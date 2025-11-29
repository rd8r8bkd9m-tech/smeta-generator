//! SIMD-optimized calculation functions
//!
//! Uses platform-specific SIMD intrinsics when available:
//! - AVX2/AVX-512 on x86_64
//! - NEON on ARM64
//! - Fallback to scalar on other platforms

use crate::types::{CalculationSettings, CalculationTotals, ItemData};
use crate::scalar::{calculate_totals_scalar, calculate_items_scalar};

/// Calculate estimate totals using best available SIMD
///
/// Automatically selects the optimal implementation:
/// - AVX-512 if available and enabled
/// - AVX2 if available
/// - NEON on ARM
/// - Scalar fallback
pub fn calculate_estimate_totals(
    items: &[ItemData],
    settings: &CalculationSettings,
) -> CalculationTotals {
    #[cfg(all(target_arch = "x86_64", feature = "avx512"))]
    {
        if is_x86_feature_detected!("avx512f") {
            return unsafe { calculate_totals_avx512(items, settings) };
        }
    }

    #[cfg(target_arch = "x86_64")]
    {
        if is_x86_feature_detected!("avx2") {
            return calculate_totals_avx2(items, settings);
        }
    }

    #[cfg(target_arch = "aarch64")]
    {
        return calculate_totals_neon(items, settings);
    }

    // Fallback to scalar
    calculate_totals_scalar(items, settings)
}

/// Calculate item results using best available SIMD
pub fn calculate_items(
    quantities: &[f64],
    unit_costs: &[f64],
    coefficients: &[f64],
    results: &mut [f64],
) {
    #[cfg(target_arch = "x86_64")]
    {
        if is_x86_feature_detected!("avx2") {
            calculate_items_avx2(quantities, unit_costs, coefficients, results);
            return;
        }
    }

    calculate_items_scalar(quantities, unit_costs, coefficients, results);
}

/// AVX2 implementation for x86_64
#[cfg(target_arch = "x86_64")]
fn calculate_totals_avx2(
    items: &[ItemData],
    settings: &CalculationSettings,
) -> CalculationTotals {
    use std::arch::x86_64::*;

    let len = items.len();
    if len < 4 {
        return calculate_totals_scalar(items, settings);
    }

    unsafe {
        let mut direct_sum = _mm256_setzero_pd();
        let mut labor_sum = _mm256_setzero_pd();
        let mut machine_op_sum = _mm256_setzero_pd();
        let mut material_sum = _mm256_setzero_pd();
        let mut machine_sum = _mm256_setzero_pd();

        let chunks = len / 4;

        for i in 0..chunks {
            let idx = i * 4;

            // Load quantities for 4 items
            let q = _mm256_set_pd(
                items[idx + 3].quantity,
                items[idx + 2].quantity,
                items[idx + 1].quantity,
                items[idx].quantity,
            );

            // Load and multiply costs
            let direct = _mm256_set_pd(
                items[idx + 3].unit_costs.direct,
                items[idx + 2].unit_costs.direct,
                items[idx + 1].unit_costs.direct,
                items[idx].unit_costs.direct,
            );
            direct_sum = _mm256_fmadd_pd(q, direct, direct_sum);

            let labor = _mm256_set_pd(
                items[idx + 3].unit_costs.labor,
                items[idx + 2].unit_costs.labor,
                items[idx + 1].unit_costs.labor,
                items[idx].unit_costs.labor,
            );
            labor_sum = _mm256_fmadd_pd(q, labor, labor_sum);

            let machine_op = _mm256_set_pd(
                items[idx + 3].unit_costs.machine_operator,
                items[idx + 2].unit_costs.machine_operator,
                items[idx + 1].unit_costs.machine_operator,
                items[idx].unit_costs.machine_operator,
            );
            machine_op_sum = _mm256_fmadd_pd(q, machine_op, machine_op_sum);

            let materials = _mm256_set_pd(
                items[idx + 3].unit_costs.materials,
                items[idx + 2].unit_costs.materials,
                items[idx + 1].unit_costs.materials,
                items[idx].unit_costs.materials,
            );
            material_sum = _mm256_fmadd_pd(q, materials, material_sum);

            let machines = _mm256_set_pd(
                items[idx + 3].unit_costs.machines,
                items[idx + 2].unit_costs.machines,
                items[idx + 1].unit_costs.machines,
                items[idx].unit_costs.machines,
            );
            machine_sum = _mm256_fmadd_pd(q, machines, machine_sum);
        }

        // Horizontal sum of vectors
        let mut totals = CalculationTotals::default();
        totals.direct_costs = hsum_pd(direct_sum);
        totals.labor_costs = hsum_pd(labor_sum);
        totals.machine_op_costs = hsum_pd(machine_op_sum);
        totals.material_costs = hsum_pd(material_sum);
        totals.machine_costs = hsum_pd(machine_sum);

        // Process remainder
        for i in (chunks * 4)..len {
            let q = items[i].quantity;
            totals.direct_costs += q * items[i].unit_costs.direct;
            totals.labor_costs += q * items[i].unit_costs.labor;
            totals.machine_op_costs += q * items[i].unit_costs.machine_operator;
            totals.material_costs += q * items[i].unit_costs.materials;
            totals.machine_costs += q * items[i].unit_costs.machines;
        }

        // Apply index
        totals.direct_costs *= settings.index;
        totals.labor_costs *= settings.index;
        totals.machine_op_costs *= settings.index;
        totals.material_costs *= settings.index;
        totals.machine_costs *= settings.index;

        // Calculate overhead and profit
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

/// AVX2 item calculation
#[cfg(target_arch = "x86_64")]
fn calculate_items_avx2(
    quantities: &[f64],
    unit_costs: &[f64],
    coefficients: &[f64],
    results: &mut [f64],
) {
    use std::arch::x86_64::*;

    let len = quantities.len()
        .min(unit_costs.len())
        .min(coefficients.len())
        .min(results.len());

    if len < 4 {
        calculate_items_scalar(quantities, unit_costs, coefficients, results);
        return;
    }

    unsafe {
        let chunks = len / 4;

        for i in 0..chunks {
            let idx = i * 4;

            let q = _mm256_loadu_pd(quantities.as_ptr().add(idx));
            let c = _mm256_loadu_pd(unit_costs.as_ptr().add(idx));
            let k = _mm256_loadu_pd(coefficients.as_ptr().add(idx));

            let result = _mm256_mul_pd(_mm256_mul_pd(q, c), k);
            _mm256_storeu_pd(results.as_mut_ptr().add(idx), result);
        }

        // Process remainder
        for i in (chunks * 4)..len {
            results[i] = quantities[i] * unit_costs[i] * coefficients[i];
        }
    }
}

/// Horizontal sum of __m256d vector
#[cfg(target_arch = "x86_64")]
#[inline]
unsafe fn hsum_pd(v: std::arch::x86_64::__m256d) -> f64 {
    use std::arch::x86_64::*;
    
    // Extract high and low 128-bit lanes
    let low = _mm256_castpd256_pd128(v);
    let high = _mm256_extractf128_pd(v, 1);
    
    // Add lanes together
    let sum128 = _mm_add_pd(low, high);
    
    // Horizontal add within 128-bit
    let sum = _mm_hadd_pd(sum128, sum128);
    
    // Extract scalar
    _mm_cvtsd_f64(sum)
}

/// NEON implementation for ARM64
#[cfg(target_arch = "aarch64")]
fn calculate_totals_neon(
    items: &[ItemData],
    settings: &CalculationSettings,
) -> CalculationTotals {
    use std::arch::aarch64::*;

    let len = items.len();
    if len < 2 {
        return calculate_totals_scalar(items, settings);
    }

    unsafe {
        let mut direct_sum = vdupq_n_f64(0.0);
        let mut labor_sum = vdupq_n_f64(0.0);
        let mut machine_op_sum = vdupq_n_f64(0.0);
        let mut material_sum = vdupq_n_f64(0.0);
        let mut machine_sum = vdupq_n_f64(0.0);

        let chunks = len / 2;

        for i in 0..chunks {
            let idx = i * 2;

            // Load quantities for 2 items
            let q = vld1q_f64([items[idx].quantity, items[idx + 1].quantity].as_ptr());

            // Direct costs
            let direct = vld1q_f64([
                items[idx].unit_costs.direct,
                items[idx + 1].unit_costs.direct,
            ].as_ptr());
            direct_sum = vfmaq_f64(direct_sum, q, direct);

            // Labor costs
            let labor = vld1q_f64([
                items[idx].unit_costs.labor,
                items[idx + 1].unit_costs.labor,
            ].as_ptr());
            labor_sum = vfmaq_f64(labor_sum, q, labor);

            // Machine operator costs
            let machine_op = vld1q_f64([
                items[idx].unit_costs.machine_operator,
                items[idx + 1].unit_costs.machine_operator,
            ].as_ptr());
            machine_op_sum = vfmaq_f64(machine_op_sum, q, machine_op);

            // Material costs
            let materials = vld1q_f64([
                items[idx].unit_costs.materials,
                items[idx + 1].unit_costs.materials,
            ].as_ptr());
            material_sum = vfmaq_f64(material_sum, q, materials);

            // Machine costs
            let machines = vld1q_f64([
                items[idx].unit_costs.machines,
                items[idx + 1].unit_costs.machines,
            ].as_ptr());
            machine_sum = vfmaq_f64(machine_sum, q, machines);
        }

        // Horizontal sum
        let mut totals = CalculationTotals::default();
        totals.direct_costs = vaddvq_f64(direct_sum);
        totals.labor_costs = vaddvq_f64(labor_sum);
        totals.machine_op_costs = vaddvq_f64(machine_op_sum);
        totals.material_costs = vaddvq_f64(material_sum);
        totals.machine_costs = vaddvq_f64(machine_sum);

        // Process remainder
        for i in (chunks * 2)..len {
            let q = items[i].quantity;
            totals.direct_costs += q * items[i].unit_costs.direct;
            totals.labor_costs += q * items[i].unit_costs.labor;
            totals.machine_op_costs += q * items[i].unit_costs.machine_operator;
            totals.material_costs += q * items[i].unit_costs.materials;
            totals.machine_costs += q * items[i].unit_costs.machines;
        }

        // Apply index and calculate overhead/profit
        totals.direct_costs *= settings.index;
        totals.labor_costs *= settings.index;
        totals.machine_op_costs *= settings.index;
        totals.material_costs *= settings.index;
        totals.machine_costs *= settings.index;

        let labor_total = totals.labor_costs + totals.machine_op_costs;
        totals.overhead = labor_total * settings.overhead_rate;
        totals.profit = labor_total * settings.profit_rate;
        totals.subtotal = totals.direct_costs + totals.overhead + totals.profit;
        totals.vat = totals.subtotal * settings.vat_rate;
        totals.total = totals.subtotal + totals.vat;

        totals
    }
}

/// Benchmark utility: calculate N items M times and return average time in microseconds
pub fn benchmark_calculation(item_count: usize, iterations: usize) -> f64 {
    use crate::types::UnitCostsData;
    use std::time::Instant;

    // Generate test data
    let items: Vec<ItemData> = (0..item_count)
        .map(|i| ItemData {
            quantity: 10.0 + (i as f64) * 0.5,
            unit_costs: UnitCostsData {
                direct: 1000.0 + (i as f64) * 5.0,
                labor: 300.0 + (i as f64),
                machine_operator: 100.0 + (i as f64) * 0.3,
                materials: 500.0 + (i as f64) * 2.0,
                machines: 100.0 + (i as f64) * 0.5,
            },
        })
        .collect();

    let settings = CalculationSettings::default();

    // Warmup
    for _ in 0..10 {
        let _ = calculate_estimate_totals(&items, &settings);
    }

    // Benchmark
    let start = Instant::now();
    for _ in 0..iterations {
        let _ = calculate_estimate_totals(&items, &settings);
    }
    let elapsed = start.elapsed();

    // Return average time in microseconds
    elapsed.as_micros() as f64 / iterations as f64
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
    fn test_calculate_estimate_totals() {
        let items = create_test_items(1000);
        let settings = CalculationSettings::default();

        let totals = calculate_estimate_totals(&items, &settings);

        assert!(totals.total > 0.0);
        assert!(totals.direct_costs > 0.0);
        
        // Verify consistency
        let expected_subtotal = totals.direct_costs + totals.overhead + totals.profit;
        assert!((totals.subtotal - expected_subtotal).abs() < 0.01);
    }

    #[test]
    fn test_simd_vs_scalar_consistency() {
        let items = create_test_items(100);
        let settings = CalculationSettings::default();

        let scalar_totals = calculate_totals_scalar(&items, &settings);
        let simd_totals = calculate_estimate_totals(&items, &settings);

        // Results should be very close (floating point tolerance)
        assert!((scalar_totals.total - simd_totals.total).abs() < 1.0);
        assert!((scalar_totals.direct_costs - simd_totals.direct_costs).abs() < 1.0);
    }

    #[test]
    fn test_benchmark() {
        let avg_time = benchmark_calculation(10000, 100);
        println!("Average calculation time for 10000 items: {:.2} µs", avg_time);
        
        // Should be very fast - less than 1ms for 10000 items
        assert!(avg_time < 1000.0);
    }
}
