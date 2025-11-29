//! Scalar (non-SIMD) calculation implementations
//!
//! Fallback implementations for platforms without SIMD support.

use crate::types::{CalculationSettings, CalculationTotals, ItemData};

/// Calculate totals using scalar operations
/// This is the fallback for platforms without SIMD
pub fn calculate_totals_scalar(
    items: &[ItemData],
    settings: &CalculationSettings,
) -> CalculationTotals {
    let mut totals = CalculationTotals::default();

    // Sum all costs
    for item in items {
        let q = item.quantity;
        totals.direct_costs += q * item.unit_costs.direct;
        totals.labor_costs += q * item.unit_costs.labor;
        totals.machine_op_costs += q * item.unit_costs.machine_operator;
        totals.material_costs += q * item.unit_costs.materials;
        totals.machine_costs += q * item.unit_costs.machines;
    }

    // Apply index
    totals.direct_costs *= settings.index;
    totals.labor_costs *= settings.index;
    totals.machine_op_costs *= settings.index;
    totals.material_costs *= settings.index;
    totals.machine_costs *= settings.index;

    // Calculate overhead and profit from labor costs (ФОТ = ОЗП + ЗПМ)
    let labor_total = totals.labor_costs + totals.machine_op_costs;
    totals.overhead = labor_total * settings.overhead_rate;
    totals.profit = labor_total * settings.profit_rate;

    // Subtotal
    totals.subtotal = totals.direct_costs + totals.overhead + totals.profit;

    // VAT
    totals.vat = totals.subtotal * settings.vat_rate;

    // Total
    totals.total = totals.subtotal + totals.vat;

    totals
}

/// Calculate item totals (quantity * unit_cost * coefficient)
pub fn calculate_items_scalar(
    quantities: &[f64],
    unit_costs: &[f64],
    coefficients: &[f64],
    results: &mut [f64],
) {
    let len = quantities.len().min(unit_costs.len()).min(coefficients.len()).min(results.len());
    
    for i in 0..len {
        results[i] = quantities[i] * unit_costs[i] * coefficients[i];
    }
}

/// Fast sum of an f64 array
pub fn fast_sum_scalar(data: &[f64]) -> f64 {
    data.iter().sum()
}

/// Dot product of two arrays
pub fn dot_product_scalar(a: &[f64], b: &[f64]) -> f64 {
    a.iter().zip(b.iter()).map(|(x, y)| x * y).sum()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::UnitCostsData;

    fn create_test_items(count: usize) -> Vec<ItemData> {
        (0..count)
            .map(|i| ItemData {
                quantity: 10.0 + i as f64,
                unit_costs: UnitCostsData {
                    direct: 1000.0 + i as f64 * 10.0,
                    labor: 300.0,
                    machine_operator: 100.0,
                    materials: 500.0,
                    machines: 100.0,
                },
            })
            .collect()
    }

    #[test]
    fn test_calculate_totals_scalar() {
        let items = create_test_items(100);
        let settings = CalculationSettings::default();

        let totals = calculate_totals_scalar(&items, &settings);

        assert!(totals.total > 0.0);
        assert!(totals.direct_costs > 0.0);
        assert!(totals.overhead > 0.0);
        assert!(totals.profit > 0.0);
        assert!(totals.vat > 0.0);
        
        // Verify total = subtotal + vat
        let expected_total = totals.subtotal + totals.vat;
        assert!((totals.total - expected_total).abs() < 0.01);
    }

    #[test]
    fn test_calculate_items_scalar() {
        let quantities = vec![10.0, 20.0, 30.0, 40.0];
        let unit_costs = vec![100.0, 200.0, 300.0, 400.0];
        let coefficients = vec![1.0, 1.0, 1.0, 1.0];
        let mut results = vec![0.0; 4];

        calculate_items_scalar(&quantities, &unit_costs, &coefficients, &mut results);

        assert_eq!(results[0], 1000.0);
        assert_eq!(results[1], 4000.0);
        assert_eq!(results[2], 9000.0);
        assert_eq!(results[3], 16000.0);
    }

    #[test]
    fn test_fast_sum_scalar() {
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let sum = fast_sum_scalar(&data);
        assert_eq!(sum, 15.0);
    }

    #[test]
    fn test_dot_product_scalar() {
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![4.0, 5.0, 6.0];
        let result = dot_product_scalar(&a, &b);
        assert_eq!(result, 32.0); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    }
}
