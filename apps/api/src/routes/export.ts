import { Router, type Router as RouterType } from 'express'
import prisma from '../lib/prisma.js'
import { generateKS2, generateKS3, generateM29, toCSV } from '../services/documents.js'

const router: RouterType = Router()

// Export estimate as KS-2 (CSV format)
router.get('/ks2/:estimateId', async (req, res) => {
  try {
    const { estimateId } = req.params
    const { 
      actNumber = 'A-001',
      contractNumber = 'Д-001',
      contractDate = new Date().toISOString().split('T')[0],
      investor = 'Инвестор',
      customer = 'Заказчик',
      contractor = 'Подрядчик',
      objectAddress = 'Адрес объекта',
      reportPeriodFrom = new Date().toISOString().split('T')[0],
      reportPeriodTo = new Date().toISOString().split('T')[0],
    } = req.query

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        project: true,
        user: { select: { name: true } },
      },
    })

    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' })
    }

    const ks2 = generateKS2(estimate, {
      actNumber: String(actNumber),
      contractNumber: String(contractNumber),
      contractDate: String(contractDate),
      investor: String(investor),
      customer: String(customer),
      contractor: String(contractor),
      objectAddress: String(objectAddress),
      reportPeriodFrom: String(reportPeriodFrom),
      reportPeriodTo: String(reportPeriodTo),
    })

    const format = req.query.format || 'json'
    
    if (format === 'csv') {
      const csv = toCSV(ks2, 'ks2')
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="KS-2_${ks2.actNumber}.csv"`)
      return res.send(csv)
    }

    res.json(ks2)
  } catch (error) {
    console.error('Error generating KS-2:', error)
    res.status(500).json({ error: 'Failed to generate KS-2' })
  }
})

// Export project estimates as KS-3 (CSV format)
router.get('/ks3/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params
    const {
      referenceNumber = 'С-001',
      contractNumber = 'Д-001',
      investor = 'Инвестор',
      customer = 'Заказчик',
      contractor = 'Подрядчик',
      reportPeriodFrom = new Date().toISOString().split('T')[0],
      reportPeriodTo = new Date().toISOString().split('T')[0],
    } = req.query

    const estimates = await prisma.estimate.findMany({
      where: { projectId },
      include: { project: true },
    })

    if (estimates.length === 0) {
      return res.status(404).json({ error: 'No estimates found for this project' })
    }

    const ks3 = generateKS3(estimates, {
      referenceNumber: String(referenceNumber),
      contractNumber: String(contractNumber),
      investor: String(investor),
      customer: String(customer),
      contractor: String(contractor),
      reportPeriodFrom: String(reportPeriodFrom),
      reportPeriodTo: String(reportPeriodTo),
    })

    const format = req.query.format || 'json'
    
    if (format === 'csv') {
      const csv = toCSV(ks3, 'ks3')
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="KS-3_${ks3.referenceNumber}.csv"`)
      return res.send(csv)
    }

    res.json(ks3)
  } catch (error) {
    console.error('Error generating KS-3:', error)
    res.status(500).json({ error: 'Failed to generate KS-3' })
  }
})

// Export material report as M-29 (CSV format)
router.post('/m29', async (req, res) => {
  try {
    const {
      materials,
      reportNumber = 'М-001',
      objectName = 'Объект',
      contractor = 'Подрядчик',
      reportPeriodFrom = new Date().toISOString().split('T')[0],
      reportPeriodTo = new Date().toISOString().split('T')[0],
    } = req.body

    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'Materials array is required' })
    }

    const m29 = generateM29(materials, {
      reportNumber,
      objectName,
      contractor,
      reportPeriodFrom,
      reportPeriodTo,
    })

    const format = req.query.format || 'json'
    
    if (format === 'csv') {
      const csv = toCSV(m29, 'm29')
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="M-29_${m29.reportNumber}.csv"`)
      return res.send(csv)
    }

    res.json(m29)
  } catch (error) {
    console.error('Error generating M-29:', error)
    res.status(500).json({ error: 'Failed to generate M-29' })
  }
})

// Export estimate as generic CSV/Excel format
router.get('/estimate/:estimateId', async (req, res) => {
  try {
    const { estimateId } = req.params

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: {
        project: true,
        user: { select: { name: true, email: true } },
      },
    })

    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' })
    }

    const items = estimate.items as Array<{
      id: string
      name: string
      unit: string
      quantity: number
      price: number
      coefficient?: number
    }>

    const BOM = '\uFEFF'
    let csv = `Локальная смета\n`
    csv += `Название;${estimate.name}\n`
    csv += `Проект;${estimate.project?.name || 'Не указан'}\n`
    csv += `Дата создания;${new Date(estimate.createdAt).toLocaleDateString('ru-RU')}\n\n`
    csv += `№ п/п;Наименование;Ед.изм.;Количество;Цена;Коэф.;Стоимость\n`

    items.forEach((item, index) => {
      const coef = item.coefficient || 1
      const total = item.quantity * item.price * coef
      csv += `${index + 1};${item.name};${item.unit};${item.quantity};${item.price};${coef};${total}\n`
    })

    csv += `\nИтого прямые затраты;;;;;${estimate.subtotal}\n`
    csv += `Накладные расходы;;;;;${estimate.overhead}\n`
    csv += `Сметная прибыль;;;;;${estimate.profit}\n`
    csv += `ВСЕГО;;;;;${estimate.total}\n`

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="estimate_${estimateId}.csv"`)
    res.send(BOM + csv)
  } catch (error) {
    console.error('Error exporting estimate:', error)
    res.status(500).json({ error: 'Failed to export estimate' })
  }
})

export default router
