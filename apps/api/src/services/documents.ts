// Document generation types
export interface EstimateData {
  id: string
  name: string
  description?: string | null
  items: unknown
  subtotal: number
  overhead: number
  profit: number
  total: number
  options?: unknown
  createdAt: Date
  updatedAt: Date
  projectId?: string | null
  userId: string
}

export interface ProjectData {
  id: string
  name: string
  description?: string | null
  status: string
  totalAmount: number
  createdAt: Date
  updatedAt: Date
  userId: string
  clientId?: string | null
}

export interface ClientData {
  id: string
  name: string
  type: string
  contact?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  inn?: string | null
  kpp?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

// KS-2 Form - Act of Work Completed
export interface KS2Form {
  actNumber: string
  actDate: string
  contractNumber: string
  contractDate: string
  investor: string
  customer: string
  contractor: string
  objectName: string
  objectAddress: string
  reportPeriodFrom: string
  reportPeriodTo: string
  items: KS2Item[]
  totalWithoutVat: number
  vat: number
  totalWithVat: number
}

export interface KS2Item {
  number: number
  estimateNumber: string
  name: string
  unit: string
  quantityEstimate: number
  quantityActual: number
  unitPrice: number
  total: number
}

// KS-3 Form - Certificate of Work Cost
export interface KS3Form {
  referenceNumber: string
  referenceDate: string
  contractNumber: string
  investor: string
  customer: string
  contractor: string
  objectName: string
  reportPeriodFrom: string
  reportPeriodTo: string
  items: KS3Item[]
  total: number
}

export interface KS3Item {
  number: number
  name: string
  code: string
  contractAmount: number
  previousAmount: number
  currentAmount: number
}

// M-29 Form - Material Report
export interface M29Form {
  reportNumber: string
  reportDate: string
  objectName: string
  contractor: string
  reportPeriodFrom: string
  reportPeriodTo: string
  materials: M29Material[]
  total: number
}

export interface M29Material {
  number: number
  code: string
  name: string
  unit: string
  normativeQuantity: number
  actualQuantity: number
  price: number
  normativeTotal: number
  actualTotal: number
  deviation: number
}

// Generate KS-2 document from estimate
export function generateKS2(
  estimate: EstimateData & { project?: ProjectData | null; user?: { name: string } },
  options: {
    actNumber: string
    contractNumber: string
    contractDate: string
    investor: string
    customer: string
    contractor: string
    objectAddress: string
    reportPeriodFrom: string
    reportPeriodTo: string
  }
): KS2Form {
  const items = (estimate.items as Array<{
    id: string
    name: string
    unit: string
    quantity: number
    price: number
    coefficient?: number
  }>).map((item, index) => ({
    number: index + 1,
    estimateNumber: estimate.id.slice(0, 8),
    name: item.name,
    unit: item.unit,
    quantityEstimate: item.quantity,
    quantityActual: item.quantity,
    unitPrice: item.price * (item.coefficient || 1),
    total: item.quantity * item.price * (item.coefficient || 1),
  }))

  const totalWithoutVat = estimate.subtotal + estimate.overhead + estimate.profit
  const vat = totalWithoutVat * 0.2
  const totalWithVat = totalWithoutVat + vat

  return {
    actNumber: options.actNumber,
    actDate: new Date().toISOString().split('T')[0],
    contractNumber: options.contractNumber,
    contractDate: options.contractDate,
    investor: options.investor,
    customer: options.customer,
    contractor: options.contractor,
    objectName: estimate.project?.name || estimate.name,
    objectAddress: options.objectAddress,
    reportPeriodFrom: options.reportPeriodFrom,
    reportPeriodTo: options.reportPeriodTo,
    items,
    totalWithoutVat: Math.round(totalWithoutVat * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    totalWithVat: Math.round(totalWithVat * 100) / 100,
  }
}

// Generate KS-3 document
export function generateKS3(
  estimates: Array<EstimateData & { project?: ProjectData | null }>,
  options: {
    referenceNumber: string
    contractNumber: string
    investor: string
    customer: string
    contractor: string
    reportPeriodFrom: string
    reportPeriodTo: string
  }
): KS3Form {
  const items = estimates.map((estimate, index) => ({
    number: index + 1,
    name: estimate.name,
    code: estimate.id.slice(0, 8),
    contractAmount: estimate.total,
    previousAmount: 0, // Would need historical data
    currentAmount: estimate.total,
  }))

  const total = items.reduce((sum, item) => sum + item.currentAmount, 0)

  return {
    referenceNumber: options.referenceNumber,
    referenceDate: new Date().toISOString().split('T')[0],
    contractNumber: options.contractNumber,
    investor: options.investor,
    customer: options.customer,
    contractor: options.contractor,
    objectName: estimates[0]?.project?.name || 'Объект',
    reportPeriodFrom: options.reportPeriodFrom,
    reportPeriodTo: options.reportPeriodTo,
    items,
    total: Math.round(total * 100) / 100,
  }
}

// Generate M-29 material report
export function generateM29(
  materials: Array<{
    code: string
    name: string
    unit: string
    normativeQuantity: number
    actualQuantity: number
    price: number
  }>,
  options: {
    reportNumber: string
    objectName: string
    contractor: string
    reportPeriodFrom: string
    reportPeriodTo: string
  }
): M29Form {
  const m29Materials = materials.map((mat, index) => ({
    number: index + 1,
    code: mat.code,
    name: mat.name,
    unit: mat.unit,
    normativeQuantity: mat.normativeQuantity,
    actualQuantity: mat.actualQuantity,
    price: mat.price,
    normativeTotal: mat.normativeQuantity * mat.price,
    actualTotal: mat.actualQuantity * mat.price,
    deviation: (mat.actualQuantity - mat.normativeQuantity) * mat.price,
  }))

  const total = m29Materials.reduce((sum, mat) => sum + mat.actualTotal, 0)

  return {
    reportNumber: options.reportNumber,
    reportDate: new Date().toISOString().split('T')[0],
    objectName: options.objectName,
    contractor: options.contractor,
    reportPeriodFrom: options.reportPeriodFrom,
    reportPeriodTo: options.reportPeriodTo,
    materials: m29Materials,
    total: Math.round(total * 100) / 100,
  }
}

// Convert form to CSV format (simple export)
export function toCSV(data: KS2Form | KS3Form | M29Form, type: 'ks2' | 'ks3' | 'm29'): string {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
  
  if (type === 'ks2') {
    const form = data as KS2Form
    let csv = `Акт о приемке выполненных работ (КС-2)\n`
    csv += `Номер акта;${form.actNumber}\n`
    csv += `Дата акта;${form.actDate}\n`
    csv += `Договор;${form.contractNumber} от ${form.contractDate}\n`
    csv += `Объект;${form.objectName}\n\n`
    csv += `№ п/п;Номер сметы;Наименование;Ед.изм.;По смете;Выполнено;Цена;Стоимость\n`
    
    form.items.forEach(item => {
      csv += `${item.number};${item.estimateNumber};${item.name};${item.unit};${item.quantityEstimate};${item.quantityActual};${item.unitPrice};${item.total}\n`
    })
    
    csv += `\nИтого без НДС;;;;;;${form.totalWithoutVat}\n`
    csv += `НДС 20%;;;;;;${form.vat}\n`
    csv += `Всего с НДС;;;;;;${form.totalWithVat}\n`
    
    return BOM + csv
  }
  
  if (type === 'ks3') {
    const form = data as KS3Form
    let csv = `Справка о стоимости выполненных работ (КС-3)\n`
    csv += `Номер справки;${form.referenceNumber}\n`
    csv += `Дата справки;${form.referenceDate}\n`
    csv += `Договор;${form.contractNumber}\n\n`
    csv += `№ п/п;Наименование;Код;По договору;С начала года;За период\n`
    
    form.items.forEach(item => {
      csv += `${item.number};${item.name};${item.code};${item.contractAmount};${item.previousAmount};${item.currentAmount}\n`
    })
    
    csv += `\nИТОГО;;;;;${form.total}\n`
    
    return BOM + csv
  }
  
  if (type === 'm29') {
    const form = data as M29Form
    let csv = `Материальный отчет (М-29)\n`
    csv += `Номер отчета;${form.reportNumber}\n`
    csv += `Дата отчета;${form.reportDate}\n`
    csv += `Объект;${form.objectName}\n\n`
    csv += `№ п/п;Код;Наименование;Ед.изм.;Норма;Факт;Цена;По норме;Фактически;Отклонение\n`
    
    form.materials.forEach(mat => {
      csv += `${mat.number};${mat.code};${mat.name};${mat.unit};${mat.normativeQuantity};${mat.actualQuantity};${mat.price};${mat.normativeTotal};${mat.actualTotal};${mat.deviation}\n`
    })
    
    csv += `\nИТОГО;;;;;;;${form.total}\n`
    
    return BOM + csv
  }
  
  return ''
}
