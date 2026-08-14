import { parse, evaluate } from 'groq-js'
import { mockSanityDataset } from '../fixtures/sanityData'

export async function executeGroq<T = any>(
  query: string,
  params: Record<string, any> = {},
  dataset: any[] = mockSanityDataset
): Promise<T> {
  const tree = parse(query)
  const value = await evaluate(tree, { dataset, params })
  return (await value.get()) as T
}
