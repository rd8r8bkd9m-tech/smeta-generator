// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'ДениДом'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Профессиональная система сметных расчетов'

// ============================================
// Calculator Constants
// ============================================

export const DEFAULT_OVERHEAD_RATE = 0.12 // 12%
export const DEFAULT_PROFIT_RATE = 0.08  // 8%
export const DEFAULT_VAT_RATE = 0.20     // 20%

export const CALCULATOR_OPTIONS = {
  overheadRate: DEFAULT_OVERHEAD_RATE,
  profitRate: DEFAULT_PROFIT_RATE,
  vatRate: DEFAULT_VAT_RATE,
  includeVat: true,
} as const

// ============================================
// Measurement Units
// ============================================

export const UNITS = {
  // Length
  M: 'м',
  M_LINEAR: 'м.п.',
  KM: 'км',
  
  // Area
  M2: 'м²',
  
  // Volume
  M3: 'м³',
  
  // Weight
  KG: 'кг',
  T: 'т',
  
  // Count
  PCS: 'шт',
  SET: 'компл.',
  
  // Time
  HOUR: 'ч',
  SHIFT: 'смена',
  
  // Other
  LITER: 'л',
  PACK: 'уп.',
} as const

export type Unit = typeof UNITS[keyof typeof UNITS]

// ============================================
// Project Statuses
// ============================================

export const PROJECT_STATUSES = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  in_progress: 'В работе',
  completed: 'Завершен',
  archived: 'Архив',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  in_progress: 'blue',
  completed: 'green',
  archived: 'gray',
}

// ============================================
// Client Types
// ============================================

export const CLIENT_TYPES = {
  COMPANY: 'company',
  INDIVIDUAL: 'individual',
} as const

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  company: 'Юридическое лицо',
  individual: 'Физическое лицо',
}

// ============================================
// Normative Types
// ============================================

export const NORMATIVE_TYPES = {
  FER: 'FER',
  GESN: 'GESN',
  TER: 'TER',
  TSN: 'TSN',
} as const

export const NORMATIVE_TYPE_LABELS: Record<string, string> = {
  FER: 'ФЕР (Федеральные единичные расценки)',
  GESN: 'ГЭСН (Государственные элементные сметные нормы)',
  TER: 'ТЕР (Территориальные единичные расценки)',
  TSN: 'ТСН (Территориальные сметные нормативы)',
}

// ============================================
// Document Types
// ============================================

export const DOCUMENT_TYPES = {
  KS2: 'KS2',
  KS3: 'KS3',
  M29: 'M29',
  ESTIMATE: 'ESTIMATE',
  INVOICE: 'INVOICE',
} as const

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  KS2: 'Акт о приемке выполненных работ (КС-2)',
  KS3: 'Справка о стоимости работ (КС-3)',
  M29: 'Материальный отчет (М-29)',
  ESTIMATE: 'Локальная смета',
  INVOICE: 'Счет на оплату',
}

// ============================================
// Work Categories
// ============================================

export const WORK_CATEGORIES = [
  { id: 'demolition', name: 'Демонтаж', icon: '🔨' },
  { id: 'masonry', name: 'Кладка', icon: '🧱' },
  { id: 'finishing', name: 'Отделка', icon: '🎨' },
  { id: 'electrical', name: 'Электрика', icon: '⚡' },
  { id: 'plumbing', name: 'Сантехника', icon: '🚿' },
  { id: 'flooring', name: 'Полы', icon: '🏠' },
  { id: 'roofing', name: 'Кровля', icon: '🏗️' },
  { id: 'insulation', name: 'Утепление', icon: '❄️' },
  { id: 'windows', name: 'Окна и двери', icon: '🚪' },
  { id: 'other', name: 'Прочее', icon: '📦' },
] as const

// ============================================
// Validation Constants
// ============================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 5000,
  INN_LENGTH_COMPANY: 10,
  INN_LENGTH_INDIVIDUAL: 12,
  KPP_LENGTH: 9,
} as const

// ============================================
// API Constants
// ============================================

export const API = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  TOKEN_HEADER: 'Authorization',
  TOKEN_PREFIX: 'Bearer',
} as const

// ============================================
// Date Formats
// ============================================

export const DATE_FORMATS = {
  SHORT: 'dd.MM.yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd.MM.yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
} as const

// ============================================
// Currency
// ============================================

export const CURRENCY = {
  CODE: 'RUB',
  SYMBOL: '₽',
  LOCALE: 'ru-RU',
} as const
