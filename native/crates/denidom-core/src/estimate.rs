//! Estimate data structures
//!
//! Core types for representing construction estimates (сметы).

use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::coefficients::Coefficients;
use crate::units::MeasureUnit;

/// Смета - основной документ
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Estimate {
    /// Unique identifier
    pub id: Uuid,
    /// Номер сметы
    pub number: String,
    /// Наименование
    pub name: String,
    /// Объект строительства
    pub object: String,
    /// Заказчик
    pub customer: Customer,
    /// Подрядчик
    pub contractor: Contractor,
    /// Разделы сметы
    pub sections: Vec<EstimateSection>,
    /// Коэффициенты
    pub coefficients: Coefficients,
    /// Накладные расходы
    pub overhead: OverheadSettings,
    /// Сметная прибыль
    pub profit: ProfitSettings,
    /// Статус
    pub status: EstimateStatus,
    /// Дата создания
    pub created_at: DateTime<Utc>,
    /// Дата обновления
    pub updated_at: DateTime<Utc>,
}

impl Estimate {
    /// Create a new estimate with default values
    pub fn new(name: String, object: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            number: String::new(),
            name,
            object,
            customer: Customer::default(),
            contractor: Contractor::default(),
            sections: Vec::new(),
            coefficients: Coefficients::default(),
            overhead: OverheadSettings::default(),
            profit: ProfitSettings::default(),
            status: EstimateStatus::Draft,
            created_at: now,
            updated_at: now,
        }
    }

    /// Get total items count across all sections
    pub fn items_count(&self) -> usize {
        self.sections.iter().map(|s| s.items.len()).sum()
    }

    /// Get all items as a flat vector
    pub fn all_items(&self) -> Vec<&EstimateItem> {
        self.sections.iter().flat_map(|s| s.items.iter()).collect()
    }

    /// Get calculation settings from estimate
    pub fn calculation_settings(&self) -> CalculationSettings {
        CalculationSettings {
            overhead_rate: self.overhead.rate,
            profit_rate: self.profit.rate,
            vat_rate: Decimal::new(20, 2), // 20% VAT
            index: self.coefficients.index,
        }
    }
}

/// Раздел сметы
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstimateSection {
    /// Unique identifier
    pub id: Uuid,
    /// Порядковый номер раздела
    pub number: u32,
    /// Наименование раздела
    pub name: String,
    /// Позиции раздела
    pub items: Vec<EstimateItem>,
}

impl EstimateSection {
    /// Create a new section
    pub fn new(number: u32, name: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            number,
            name,
            items: Vec::new(),
        }
    }

    /// Add an item to the section
    pub fn add_item(&mut self, item: EstimateItem) {
        self.items.push(item);
    }
}

/// Позиция сметы
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstimateItem {
    /// Unique identifier
    pub id: Uuid,
    /// Порядковый номер
    pub position: u32,
    /// Шифр расценки (код ФЕР/ГЭСН/ТЕР)
    pub code: String,
    /// Наименование работы
    pub name: String,
    /// Единица измерения
    pub unit: MeasureUnit,
    /// Количество
    pub quantity: Decimal,
    /// Единичные расценки
    pub unit_costs: UnitCosts,
    /// Ресурсы
    pub resources: Vec<Resource>,
    /// Затраты труда рабочих (чел-часы)
    pub labor_hours: Decimal,
    /// Затраты машинного времени (маш-часы)
    pub machine_hours: Decimal,
}

impl EstimateItem {
    /// Create a new estimate item
    pub fn new(code: String, name: String, unit: MeasureUnit, quantity: Decimal) -> Self {
        Self {
            id: Uuid::new_v4(),
            position: 0,
            code,
            name,
            unit,
            quantity,
            unit_costs: UnitCosts::default(),
            resources: Vec::new(),
            labor_hours: Decimal::ZERO,
            machine_hours: Decimal::ZERO,
        }
    }

    /// Calculate total cost for this item
    pub fn total_direct_cost(&self) -> Decimal {
        self.quantity * self.unit_costs.direct
    }

    /// Calculate total labor cost
    pub fn total_labor_cost(&self) -> Decimal {
        self.quantity * self.unit_costs.labor
    }

    /// Calculate total material cost
    pub fn total_material_cost(&self) -> Decimal {
        self.quantity * self.unit_costs.materials
    }

    /// Calculate total machine cost
    pub fn total_machine_cost(&self) -> Decimal {
        self.quantity * self.unit_costs.machines
    }
}

/// Единичные расценки
#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
pub struct UnitCosts {
    /// Прямые затраты (всего)
    pub direct: Decimal,
    /// ОЗП - оплата труда рабочих
    pub labor: Decimal,
    /// ЗПМ - зарплата машинистов
    pub machine_operator: Decimal,
    /// Материалы
    pub materials: Decimal,
    /// Эксплуатация машин и механизмов
    pub machines: Decimal,
}

impl UnitCosts {
    /// Create new unit costs
    pub fn new(
        direct: Decimal,
        labor: Decimal,
        machine_operator: Decimal,
        materials: Decimal,
        machines: Decimal,
    ) -> Self {
        Self {
            direct,
            labor,
            machine_operator,
            materials,
            machines,
        }
    }

    /// Validate that direct equals sum of components
    pub fn validate(&self) -> bool {
        let sum = self.labor + self.machine_operator + self.materials + self.machines;
        (self.direct - sum).abs() < Decimal::new(1, 2) // tolerance of 0.01
    }
}

/// Ресурс (материал, механизм, рабочая сила)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resource {
    /// Unique identifier
    pub id: Uuid,
    /// Тип ресурса
    pub resource_type: ResourceType,
    /// Код ресурса
    pub code: String,
    /// Наименование
    pub name: String,
    /// Единица измерения
    pub unit: MeasureUnit,
    /// Норма расхода на единицу работы
    pub consumption_rate: Decimal,
    /// Цена за единицу
    pub unit_price: Decimal,
}

/// Тип ресурса
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResourceType {
    /// Материал
    Material,
    /// Механизм/машина
    Machine,
    /// Рабочая сила
    Labor,
    /// Оборудование
    Equipment,
}

/// Заказчик
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Customer {
    /// Наименование организации
    pub name: String,
    /// ИНН
    pub inn: Option<String>,
    /// КПП
    pub kpp: Option<String>,
    /// Адрес
    pub address: Option<String>,
    /// Контактное лицо
    pub contact_person: Option<String>,
    /// Телефон
    pub phone: Option<String>,
    /// Email
    pub email: Option<String>,
}

/// Подрядчик
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Contractor {
    /// Наименование организации
    pub name: String,
    /// ИНН
    pub inn: Option<String>,
    /// КПП
    pub kpp: Option<String>,
    /// Адрес
    pub address: Option<String>,
    /// Контактное лицо
    pub contact_person: Option<String>,
    /// Телефон
    pub phone: Option<String>,
    /// Email
    pub email: Option<String>,
    /// Номер лицензии
    pub license: Option<String>,
}

/// Настройки накладных расходов
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OverheadSettings {
    /// Ставка накладных расходов (от ФОТ)
    pub rate: Decimal,
    /// Метод расчёта
    pub method: OverheadMethod,
}

impl Default for OverheadSettings {
    fn default() -> Self {
        Self {
            rate: Decimal::new(12, 2), // 12%
            method: OverheadMethod::FromLaborCost,
        }
    }
}

/// Метод расчёта накладных расходов
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OverheadMethod {
    /// От фонда оплаты труда (ФОТ = ОЗП + ЗПМ)
    FromLaborCost,
    /// От прямых затрат
    FromDirectCost,
    /// Фиксированная сумма
    Fixed,
}

/// Настройки сметной прибыли
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfitSettings {
    /// Ставка сметной прибыли (от ФОТ)
    pub rate: Decimal,
    /// Метод расчёта
    pub method: ProfitMethod,
}

impl Default for ProfitSettings {
    fn default() -> Self {
        Self {
            rate: Decimal::new(8, 2), // 8%
            method: ProfitMethod::FromLaborCost,
        }
    }
}

/// Метод расчёта сметной прибыли
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProfitMethod {
    /// От фонда оплаты труда
    FromLaborCost,
    /// От прямых затрат
    FromDirectCost,
    /// Фиксированная сумма
    Fixed,
}

/// Статус сметы
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EstimateStatus {
    /// Черновик
    Draft,
    /// В работе
    InProgress,
    /// На проверке
    OnReview,
    /// Утверждена
    Approved,
    /// В архиве
    Archived,
}

impl Default for EstimateStatus {
    fn default() -> Self {
        Self::Draft
    }
}

/// Настройки расчёта
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct CalculationSettings {
    /// Ставка накладных расходов
    pub overhead_rate: Decimal,
    /// Ставка сметной прибыли
    pub profit_rate: Decimal,
    /// Ставка НДС
    pub vat_rate: Decimal,
    /// Индекс пересчёта
    pub index: Decimal,
}

impl Default for CalculationSettings {
    fn default() -> Self {
        Self {
            overhead_rate: Decimal::new(12, 2),
            profit_rate: Decimal::new(8, 2),
            vat_rate: Decimal::new(20, 2),
            index: Decimal::ONE,
        }
    }
}

/// Итоги сметы
#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
pub struct EstimateTotals {
    /// Прямые затраты
    pub direct_costs: Decimal,
    /// ОЗП (оплата труда рабочих)
    pub labor_costs: Decimal,
    /// ЗПМ (зарплата машинистов)
    pub machine_operator_costs: Decimal,
    /// Материалы
    pub material_costs: Decimal,
    /// Эксплуатация машин
    pub machine_costs: Decimal,
    /// Накладные расходы
    pub overhead: Decimal,
    /// Сметная прибыль
    pub profit: Decimal,
    /// Итого без НДС
    pub subtotal: Decimal,
    /// НДС
    pub vat: Decimal,
    /// Всего с НДС
    pub total: Decimal,
}

impl EstimateTotals {
    /// Format as Russian rubles
    pub fn format_rub(&self) -> String {
        format!("{:.2} ₽", self.total)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_estimate_creation() {
        let estimate = Estimate::new(
            "Ремонт квартиры".to_string(),
            "г. Москва, ул. Примерная, д. 1".to_string(),
        );

        assert!(!estimate.id.is_nil());
        assert_eq!(estimate.name, "Ремонт квартиры");
        assert_eq!(estimate.status, EstimateStatus::Draft);
    }

    #[test]
    fn test_unit_costs_validation() {
        let costs = UnitCosts::new(
            Decimal::new(1000, 0),
            Decimal::new(300, 0),
            Decimal::new(100, 0),
            Decimal::new(500, 0),
            Decimal::new(100, 0),
        );

        assert!(costs.validate());
    }

    #[test]
    fn test_estimate_item_total() {
        let mut item = EstimateItem::new(
            "ФЕР01-01-001-01".to_string(),
            "Разработка грунта".to_string(),
            MeasureUnit::CubicMeter,
            Decimal::new(100, 0),
        );

        item.unit_costs = UnitCosts::new(
            Decimal::new(500, 0),
            Decimal::new(200, 0),
            Decimal::new(50, 0),
            Decimal::new(200, 0),
            Decimal::new(50, 0),
        );

        assert_eq!(item.total_direct_cost(), Decimal::new(50000, 0));
    }
}
