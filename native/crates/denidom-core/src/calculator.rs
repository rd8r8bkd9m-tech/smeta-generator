//! Calculator module - Core calculation engine
//!
//! Provides high-performance calculation functions for estimates.

use rust_decimal::Decimal;
use crate::estimate::{CalculationSettings, Estimate, EstimateItem, EstimateTotals};

/// Calculate totals for an estimate
pub fn calculate_estimate_totals(estimate: &Estimate) -> EstimateTotals {
    let settings = estimate.calculation_settings();
    let items: Vec<&EstimateItem> = estimate.all_items();
    
    calculate_totals(&items, &settings)
}

/// Calculate totals from items and settings
pub fn calculate_totals(items: &[&EstimateItem], settings: &CalculationSettings) -> EstimateTotals {
    let mut totals = EstimateTotals::default();
    
    // Sum up all costs
    for item in items {
        totals.direct_costs += item.total_direct_cost();
        totals.labor_costs += item.total_labor_cost();
        totals.machine_operator_costs += item.quantity * item.unit_costs.machine_operator;
        totals.material_costs += item.total_material_cost();
        totals.machine_costs += item.total_machine_cost();
    }
    
    // Apply index
    totals.direct_costs *= settings.index;
    totals.labor_costs *= settings.index;
    totals.machine_operator_costs *= settings.index;
    totals.material_costs *= settings.index;
    totals.machine_costs *= settings.index;
    
    // Calculate overhead from labor costs (ФОТ = ОЗП + ЗПМ)
    let labor_total = totals.labor_costs + totals.machine_operator_costs;
    totals.overhead = labor_total * settings.overhead_rate;
    
    // Calculate profit from labor costs
    totals.profit = labor_total * settings.profit_rate;
    
    // Subtotal
    totals.subtotal = totals.direct_costs + totals.overhead + totals.profit;
    
    // VAT
    totals.vat = totals.subtotal * settings.vat_rate;
    
    // Total
    totals.total = totals.subtotal + totals.vat;
    
    totals
}

/// Fast calculation using f64 for SIMD compatibility
/// Returns totals as f64 array for use with SIMD functions
pub struct FastCalculator {
    quantities: Vec<f64>,
    direct_costs: Vec<f64>,
    labor_costs: Vec<f64>,
    machine_op_costs: Vec<f64>,
    material_costs: Vec<f64>,
    machine_costs: Vec<f64>,
}

impl FastCalculator {
    /// Create a new fast calculator from estimate items
    pub fn from_items(items: &[&EstimateItem]) -> Self {
        let len = items.len();
        let mut calc = Self {
            quantities: Vec::with_capacity(len),
            direct_costs: Vec::with_capacity(len),
            labor_costs: Vec::with_capacity(len),
            machine_op_costs: Vec::with_capacity(len),
            material_costs: Vec::with_capacity(len),
            machine_costs: Vec::with_capacity(len),
        };
        
        for item in items {
            calc.quantities.push(decimal_to_f64(item.quantity));
            calc.direct_costs.push(decimal_to_f64(item.unit_costs.direct));
            calc.labor_costs.push(decimal_to_f64(item.unit_costs.labor));
            calc.machine_op_costs.push(decimal_to_f64(item.unit_costs.machine_operator));
            calc.material_costs.push(decimal_to_f64(item.unit_costs.materials));
            calc.machine_costs.push(decimal_to_f64(item.unit_costs.machines));
        }
        
        calc
    }
    
    /// Get data length
    pub fn len(&self) -> usize {
        self.quantities.len()
    }
    
    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.quantities.is_empty()
    }
    
    /// Get quantities slice
    pub fn quantities(&self) -> &[f64] {
        &self.quantities
    }
    
    /// Get direct costs slice
    pub fn direct_costs(&self) -> &[f64] {
        &self.direct_costs
    }
    
    /// Get labor costs slice
    pub fn labor_costs(&self) -> &[f64] {
        &self.labor_costs
    }
    
    /// Get machine operator costs slice
    pub fn machine_op_costs(&self) -> &[f64] {
        &self.machine_op_costs
    }
    
    /// Get material costs slice
    pub fn material_costs(&self) -> &[f64] {
        &self.material_costs
    }
    
    /// Get machine costs slice
    pub fn machine_costs(&self) -> &[f64] {
        &self.machine_costs
    }
    
    /// Calculate totals using scalar operations
    pub fn calculate_totals(&self, settings: &FastCalculationSettings) -> FastTotals {
        let mut totals = FastTotals::default();
        
        for i in 0..self.len() {
            let q = self.quantities[i];
            totals.direct_costs += q * self.direct_costs[i];
            totals.labor_costs += q * self.labor_costs[i];
            totals.machine_op_costs += q * self.machine_op_costs[i];
            totals.material_costs += q * self.material_costs[i];
            totals.machine_costs += q * self.machine_costs[i];
        }
        
        // Apply index
        totals.direct_costs *= settings.index;
        totals.labor_costs *= settings.index;
        totals.machine_op_costs *= settings.index;
        totals.material_costs *= settings.index;
        totals.machine_costs *= settings.index;
        
        // Overhead and profit from ФОТ
        let labor_total = totals.labor_costs + totals.machine_op_costs;
        totals.overhead = labor_total * settings.overhead_rate;
        totals.profit = labor_total * settings.profit_rate;
        
        // Subtotal, VAT, Total
        totals.subtotal = totals.direct_costs + totals.overhead + totals.profit;
        totals.vat = totals.subtotal * settings.vat_rate;
        totals.total = totals.subtotal + totals.vat;
        
        totals
    }
}

/// Fast calculation settings (f64)
#[derive(Debug, Clone, Copy)]
pub struct FastCalculationSettings {
    pub overhead_rate: f64,
    pub profit_rate: f64,
    pub vat_rate: f64,
    pub index: f64,
}

impl Default for FastCalculationSettings {
    fn default() -> Self {
        Self {
            overhead_rate: 0.12,
            profit_rate: 0.08,
            vat_rate: 0.20,
            index: 1.0,
        }
    }
}

impl From<&CalculationSettings> for FastCalculationSettings {
    fn from(settings: &CalculationSettings) -> Self {
        Self {
            overhead_rate: decimal_to_f64(settings.overhead_rate),
            profit_rate: decimal_to_f64(settings.profit_rate),
            vat_rate: decimal_to_f64(settings.vat_rate),
            index: decimal_to_f64(settings.index),
        }
    }
}

/// Fast totals (f64)
#[derive(Debug, Clone, Copy, Default)]
pub struct FastTotals {
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

impl FastTotals {
    /// Convert to EstimateTotals with Decimal precision
    pub fn to_estimate_totals(&self) -> EstimateTotals {
        EstimateTotals {
            direct_costs: f64_to_decimal(self.direct_costs),
            labor_costs: f64_to_decimal(self.labor_costs),
            machine_operator_costs: f64_to_decimal(self.machine_op_costs),
            material_costs: f64_to_decimal(self.material_costs),
            machine_costs: f64_to_decimal(self.machine_costs),
            overhead: f64_to_decimal(self.overhead),
            profit: f64_to_decimal(self.profit),
            subtotal: f64_to_decimal(self.subtotal),
            vat: f64_to_decimal(self.vat),
            total: f64_to_decimal(self.total),
        }
    }
}

/// Convert Decimal to f64 for fast calculations
#[inline]
fn decimal_to_f64(d: Decimal) -> f64 {
    use rust_decimal::prelude::ToPrimitive;
    d.to_f64().unwrap_or(0.0)
}

/// Convert f64 to Decimal
#[inline]
fn f64_to_decimal(f: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    Decimal::from_f64(f).unwrap_or(Decimal::ZERO)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::estimate::UnitCosts;
    use crate::units::MeasureUnit;

    fn create_test_item(quantity: f64, direct: f64, labor: f64) -> EstimateItem {
        let mut item = EstimateItem::new(
            "TEST-001".to_string(),
            "Test item".to_string(),
            MeasureUnit::SquareMeter,
            Decimal::from_f64_retain(quantity).unwrap(),
        );
        item.unit_costs = UnitCosts::new(
            Decimal::from_f64_retain(direct).unwrap(),
            Decimal::from_f64_retain(labor).unwrap(),
            Decimal::from_f64_retain(labor * 0.3).unwrap(),
            Decimal::from_f64_retain(direct * 0.5).unwrap(),
            Decimal::from_f64_retain(direct * 0.2).unwrap(),
        );
        item
    }

    #[test]
    fn test_fast_calculator() {
        let items: Vec<EstimateItem> = (0..100)
            .map(|i| create_test_item(10.0, 1000.0 + i as f64, 300.0))
            .collect();
        
        let refs: Vec<&EstimateItem> = items.iter().collect();
        let calc = FastCalculator::from_items(&refs);
        let settings = FastCalculationSettings::default();
        
        let totals = calc.calculate_totals(&settings);
        
        assert!(totals.total > 0.0);
        assert!(totals.direct_costs > 0.0);
        assert!(totals.overhead > 0.0);
    }
}
