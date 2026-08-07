export interface OptionItem {
  id: string
  name: string
  description?: string
  price: number // 0 means Included
  image?: string
}

export interface CounterOption {
  id: string
  name: string
  unitPrice: number
  min?: number
  max?: number
}

export interface CheckboxOption {
  id: string
  name: string
  price: number
  priceSuffix?: string
}

export interface ConfiguratorStep {
  id: string
  stepNumber: number
  title: string
  type: 'card' | 'grid' | 'counter-checkbox' | 'list'
  options?: OptionItem[]
  counter?: CounterOption
  checkboxes?: CheckboxOption[]
}

export interface SpecSummaryItem {
  label: string
  value: string
}
