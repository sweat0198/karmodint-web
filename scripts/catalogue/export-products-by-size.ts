import fs from 'node:fs/promises'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { createSanityClient, readSanityTarget } from './lib/sanityEnv'

const query = `*[_type == "product" && !(_id in path("drafts.**"))] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  shortDescription,
  description,
  "categories": categories[]->{ _id, name, "slug": slug.current },
  lifestyleImages,
  customizationGroups[]->{ _id, title, "identifier": identifier.current, selectionType, isMandatory, description, items },
  specifications,
  isFeatured,
  status,
  seo,
  sizes[] {
    _key,
    label,
    widthM,
    lengthM,
    heightM,
    weightKg,
    price,
    isPoa,
    isDefault,
    images[] { _key, view, alt, caption, asset, "url": asset->url }
  }
}`

const target = readSanityTarget()
const client = createSanityClient(target)
const products = await client.fetch<Product[]>(query)

const records = products.flatMap((product) =>
  (product.sizes ?? []).map((size, sizeIndex) => ({
    productId: product._id,
    productName: product.name,
    productSlug: product.slug,
    productStatus: product.status,
    productIsFeatured: product.isFeatured,
    productShortDescription: product.shortDescription,
    productDescription: product.description,
    categories: product.categories,
    lifestyleImages: product.lifestyleImages,
    customizationGroups: product.customizationGroups,
    specifications: product.specifications,
    seo: product.seo,
    sizeIndex,
    sizeKey: size._key,
    size: {
      label: size.label,
      widthM: size.widthM,
      lengthM: size.lengthM,
      heightM: size.heightM,
      weightKg: size.weightKg,
      price: size.price,
      isPoa: size.isPoa,
      isDefault: size.isDefault,
      images: size.images
    }
  })))

const outputPath = path.resolve('sanity/exports/products-by-size.json')
await fs.mkdir(path.dirname(outputPath), { recursive: true })
await fs.writeFile(outputPath, `${JSON.stringify({
  exportedAt: new Date().toISOString(),
  projectId: target.projectId,
  dataset: target.dataset,
  productCount: products.length,
  sizeProductCount: records.length,
  products,
  records
}, null, 2)}\n`, 'utf8')

const workbook = new ExcelJS.Workbook()
workbook.creator = 'Karmod International'
workbook.created = new Date()
const worksheet = workbook.addWorksheet('Price Request', {
  views: [{ state: 'frozen', ySplit: 4 }]
})

worksheet.mergeCells('A1:O1')
worksheet.getCell('A1').value = 'Karmod Product Price Request'
worksheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }
worksheet.getCell('A1').alignment = { vertical: 'middle' }
worksheet.getRow(1).height = 28

worksheet.mergeCells('A2:O2')
worksheet.getCell('A2').value = 'Please complete Owner Price, Owner Height, and Owner Weight fields where needed. Keep POA where a fixed price is unavailable.'
worksheet.getCell('A2').font = { italic: true, color: { argb: 'FF404040' } }

worksheet.mergeCells('A3:O3')
worksheet.getCell('A3').value = `Exported ${new Date().toLocaleDateString('en-GB')} • ${records.length} size-products • prices currently blank in owner columns`
worksheet.getCell('A3').font = { color: { argb: 'FF666666' }, size: 10 }

worksheet.columns = [
  { key: 'category', width: 28 },
  { key: 'product', width: 32 },
  { key: 'slug', width: 32 },
  { key: 'size', width: 20 },
  { key: 'width', width: 12 },
  { key: 'length', width: 12 },
  { key: 'currentHeight', width: 18 },
  { key: 'ownerHeight', width: 18 },
  { key: 'currentWeight', width: 18 },
  { key: 'ownerWeight', width: 18 },
  { key: 'currentPrice', width: 22 },
  { key: 'currentStatus', width: 16 },
  { key: 'ownerPrice', width: 18 },
  { key: 'currency', width: 12 },
  { key: 'notes', width: 32 }
]

const priceRows = records
  .map((record) => ({
    category: (record.categories ?? []).map((category: any) => category.name).filter(Boolean).join(' > '),
    product: record.productName,
    slug: record.productSlug,
    size: record.size.label,
    width: record.size.widthM ?? '',
    length: record.size.lengthM ?? '',
    currentHeight: record.size.heightM ?? '',
    ownerHeight: record.size.heightM ?? '',
    currentWeight: record.size.weightKg || '',
    ownerWeight: record.size.weightKg || '',
    currentPrice: record.size.isPoa ? '' : record.size.price ?? '',
    currentStatus: record.size.isPoa ? 'POA' : 'Price set',
    ownerPrice: '',
    currency: 'GBP',
    notes: ''
  }))
  .sort((a, b) => `${a.category}\u0000${a.product}\u0000${a.size}`.localeCompare(`${b.category}\u0000${b.product}\u0000${b.size}`))

const headerRow = worksheet.getRow(4)
headerRow.values = [
  'Category Structure', 'Product', 'Product Slug', 'Size', 'Width (m)', 'Length (m)',
  'Current Height (m)', 'Owner Height (m)', 'Current Weight (kg)', 'Owner Weight (kg)',
  'Current Sanity Price (£)', 'Current Status', 'Owner Price (£)', 'Currency', 'Owner Notes'
]

for (const row of priceRows) worksheet.addRow(row)

headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } }
headerRow.alignment = { vertical: 'middle', wrapText: true }
headerRow.height = 30

for (let rowNumber = 5; rowNumber <= worksheet.rowCount; rowNumber += 1) {
  const row = worksheet.getRow(rowNumber)
  row.alignment = { vertical: 'top', wrapText: true }
  if (rowNumber % 2 === 0) {
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FC' } }
  }
  for (const cellNumber of [8, 10, 13, 15]) {
    row.getCell(cellNumber).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
  }
  for (const cellNumber of [7, 8, 9, 10]) row.getCell(cellNumber).numFmt = '0.00'
  row.getCell(13).numFmt = '£#,##0.00'
  row.getCell(11).numFmt = '£#,##0.00'
}

worksheet.autoFilter = { from: 'A4', to: `O${worksheet.rowCount}` }

const xlsxPath = path.resolve('sanity/exports/product-price-request.xlsx')
await workbook.xlsx.writeFile(xlsxPath)

console.log(`Exported ${products.length} products and ${records.length} size-products to ${outputPath}`)
console.log(`Wrote owner price request workbook to ${xlsxPath}`)

interface Product {
  _id: string
  name: string
  slug?: string
  status?: string
  isFeatured?: boolean
  shortDescription?: unknown
  description?: unknown
  categories?: unknown[]
  lifestyleImages?: unknown[]
  customizationGroups?: unknown[]
  specifications?: unknown[]
  seo?: unknown
  sizes?: Size[]
}

interface Size {
  _key?: string
  label?: string
  widthM?: number
  lengthM?: number
  heightM?: number
  weightKg?: number
  price?: number
  isPoa?: boolean
  isDefault?: boolean
  images?: unknown[]
}
