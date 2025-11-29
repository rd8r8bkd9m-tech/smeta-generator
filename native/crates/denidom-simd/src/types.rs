//! SIMD data types for calculations

/// Item data for fast calculations (f64 for SIMD compatibility)
#[derive(Debug, Clone, Copy)]
pub struct ItemData {
    pub quantity: f64,
    pub unit_costs: UnitCostsData,
}

/// Unit costs as f64 for SIMD calculations
#[derive(Debug, Clone, Copy)]
pub struct UnitCostsData {
    pub direct: f64,
    pub labor: f64,
    pub machine_operator: f64,
    pub materials: f64,
    pub machines: f64,
}

impl Default for UnitCostsData {
    fn default() -> Self {
        Self {
            direct: 0.0,
            labor: 0.0,
            machine_operator: 0.0,
            materials: 0.0,
            machines: 0.0,
        }
    }
}

/// Calculation settings as f64
#[derive(Debug, Clone, Copy)]
pub struct CalculationSettings {
    pub overhead_rate: f64,
    pub profit_rate: f64,
    pub vat_rate: f64,
    pub index: f64,
}

impl Default for CalculationSettings {
    fn default() -> Self {
        Self {
            overhead_rate: 0.12,  // 12%
            profit_rate: 0.08,   // 8%
            vat_rate: 0.20,      // 20%
            index: 1.0,
        }
    }
}

/// Calculation result totals
#[derive(Debug, Clone, Copy, Default)]
#[repr(C)]
pub struct CalculationTotals {
    pub direct_costs: f64,
    pub labor_costs: f64,
    pub machine_op_costs: f64,
    pub material_costs: f64,
    pub machine_costs: f64,
    pub overhead: f64,
    pub profit: f64,
    pub subtotal: f64,
    pub vat: f64,
    pub total: f64,
}

impl CalculationTotals {
    /// Format total as Russian rubles string
    pub fn format_total_rub(&self) -> String {
        format!("{:.2} ₽", self.total)
    }

    /// Format all values as a summary string
    pub fn summary(&self) -> String {
        format!(
            "Прямые затраты: {:.2} ₽\n\
             Накладные расходы: {:.2} ₽\n\
             Сметная прибыль: {:.2} ₽\n\
             Итого без НДС: {:.2} ₽\n\
             НДС 20%: {:.2} ₽\n\
             ИТОГО: {:.2} ₽",
            self.direct_costs,
            self.overhead,
            self.profit,
            self.subtotal,
            self.vat,
            self.total
        )
    }
}
