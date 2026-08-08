import type { CustomizationStep, SpecSummaryItem } from '~/types/customization'

export function getModularStepsForProduct(productId?: string, productName?: string): CustomizationStep[] {
  return [
    {
      id: 'dimensions',
      stepNumber: 1,
      title: 'Module Dimensions & Footprint',
      type: 'card',
      options: [
        {
          id: 'dim-150-150',
          name: '1.50m x 1.50m Compact Footprint',
          description: 'Optimized for single operator gatehouse & parking booths.',
          price: 0
        },
        {
          id: 'dim-200-200',
          name: '2.00m x 2.00m Standard Module',
          description: 'Standard security checkpoint with dual side inspection windows.',
          price: 650
        },
        {
          id: 'dim-240-300',
          name: '2.40m x 3.00m Expanded Office',
          description: 'Spacious workspace with room for desk, computer, and storage.',
          price: 1350
        },
        {
          id: 'dim-240-600',
          name: '2.40m x 6.00m Multi-Role Structure',
          description: 'Commercial grade unit with dual rooms or internal partition.',
          price: 2900
        }
      ]
    },
    {
      id: 'exterior-finish',
      stepNumber: 2,
      title: 'Exterior Wall Finish & RAL Color',
      type: 'grid',
      options: [
        {
          id: 'finish-white-9002',
          name: 'Standard White (RAL 9002)',
          price: 0,
          image: '/images/product-service-cabin-135.png'
        },
        {
          id: 'finish-anthracite-7016',
          name: 'Anthracite Grey (RAL 7016)',
          price: 320,
          image: '/images/product-security-cabin-110.png'
        },
        {
          id: 'finish-timber-clad',
          name: 'Architectural Timber Slat',
          price: 780,
          image: '/images/product-container-k2004.png'
        },
        {
          id: 'finish-metallic-9006',
          name: 'Metallic Silver (RAL 9006)',
          price: 410,
          image: '/images/product-service-cabin-135.png'
        }
      ]
    },
    {
      id: 'doors-windows',
      stepNumber: 3,
      title: 'Security Glazing & Access Openings',
      type: 'counter-checkbox',
      counter: {
        id: 'window-count',
        name: 'Aluminium Sliding Counter Windows',
        unitPrice: 180,
        min: 1,
        max: 6
      },
      checkboxes: [
        {
          id: 'chk-roller-shutter',
          name: 'Heavy Duty Security Roller Shutter',
          price: 295,
          priceSuffix: '/window'
        },
        {
          id: 'chk-double-glazed',
          name: 'Thermal Low-E Double Glazed Acoustic Glass',
          price: 220,
          priceSuffix: ' pack'
        },
        {
          id: 'chk-rain-canopy',
          name: 'Overhead Weather Protection Rain Canopy',
          price: 160,
          priceSuffix: ' set'
        }
      ]
    },
    {
      id: 'electrical-hvac',
      stepNumber: 4,
      title: 'Electrical Distribution & Climate Control',
      type: 'list',
      options: [
        {
          id: 'elec-standard',
          name: 'Standard Package: 1x LED Panel + 2x Twin 13A Sockets + RCD Consumer Unit',
          price: 0
        },
        {
          id: 'elec-comfort-hvac',
          name: 'Comfort Pack: High Output LED + 2kW Wall Convector Heater + 4x Twin Sockets',
          price: 490
        },
        {
          id: 'elec-inverter-ac',
          name: 'Premium Climate: 9,000 BTU Inverter AC / Heat Pump + Data Network Points',
          price: 1150
        }
      ]
    }
  ]
}

export function generateSpecSummary(steps: CustomizationStep[], selections: Record<string, any>): SpecSummaryItem[] {
  const summary: SpecSummaryItem[] = []

  for (const step of steps) {
    const sel = selections[step.id]
    if (!sel) continue

    if (step.id === 'dimensions' && step.options) {
      const opt = step.options.find(o => o.id === sel)
      if (opt) {
        summary.push({
          label: 'DIMENSIONS',
          value: opt.name.split(' ')[0] || opt.name
        })
      }
    } else if (step.id === 'exterior-finish' && step.options) {
      const opt = step.options.find(o => o.id === sel)
      if (opt) {
        summary.push({
          label: 'FINISH',
          value: opt.name.replace(/\s*\(.*?\)\s*/g, '')
        })
      }
    } else if (step.id === 'doors-windows') {
      const count = sel.counterValue ?? 1
      let winText = `${count}x Sliding Window`
      if (sel.checkboxes?.['chk-roller-shutter']) {
        winText += ' + Shutters'
      }
      summary.push({
        label: 'GLAZING',
        value: winText
      })
    } else if (step.id === 'electrical-hvac' && step.options) {
      const opt = step.options.find(o => o.id === sel)
      if (opt) {
        const shortName = opt.name.split(':')[0] || opt.name
        summary.push({
          label: 'ELECTRICS',
          value: shortName
        })
      }
    }
  }

  if (summary.length === 0) {
    summary.push(
      { label: 'DIMENSIONS', value: '2.00m x 2.00m' },
      { label: 'FINISH', value: 'RAL 9002 Standard' },
      { label: 'GLAZING', value: 'Double Glazed' },
      { label: 'ELECTRICS', value: 'Standard LED + RCD' }
    )
  }

  return summary
}

export function getDefaultSelections(): Record<string, any> {
  return {
    'dimensions': 'dim-200-200',
    'exterior-finish': 'finish-white-9002',
    'doors-windows': {
      counterValue: 2,
      checkboxes: {
        'chk-roller-shutter': false,
        'chk-double-glazed': true,
        'chk-rain-canopy': false
      }
    },
    'electrical-hvac': 'elec-standard'
  }
}
