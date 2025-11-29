/*
 * DeniDom SIMD Calculations
 * High-performance AVX-512/AVX2 implementations for estimate calculations
 * 
 * Copyright (c) 2024 DeniDom Team
 * Licensed under MIT
 */

#ifndef DENIDOM_SIMD_CALC_H
#define DENIDOM_SIMD_CALC_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ============================================================================
 * Data Structures
 * ============================================================================ */

/**
 * Calculation result structure
 * All values in Russian rubles
 */
typedef struct {
    double direct_costs;        /* Прямые затраты */
    double labor_costs;         /* ОЗП */
    double machine_op_costs;    /* ЗПМ */
    double material_costs;      /* Материалы */
    double machine_costs;       /* Эксплуатация машин */
    double overhead;            /* Накладные расходы */
    double profit;              /* Сметная прибыль */
    double subtotal;            /* Итого без НДС */
    double vat;                 /* НДС */
    double total;               /* ИТОГО с НДС */
} CalculationResult;

/**
 * Calculation settings
 */
typedef struct {
    double overhead_rate;       /* Ставка накладных (default: 0.12) */
    double profit_rate;         /* Ставка прибыли (default: 0.08) */
    double vat_rate;            /* Ставка НДС (default: 0.20) */
    double index;               /* Индекс пересчёта (default: 1.0) */
} CalculationSettings;

/* ============================================================================
 * CPU Feature Detection
 * ============================================================================ */

/**
 * Check if AVX-512 is supported
 */
bool denidom_has_avx512(void);

/**
 * Check if AVX2 is supported
 */
bool denidom_has_avx2(void);

/**
 * Check if FMA is supported
 */
bool denidom_has_fma(void);

/* ============================================================================
 * SIMD Calculation Functions
 * ============================================================================ */

/**
 * Calculate estimate totals using AVX-512
 * 
 * @param quantities      Array of quantities
 * @param direct_costs    Array of direct unit costs
 * @param labor_costs     Array of labor unit costs
 * @param machine_op_costs Array of machine operator unit costs
 * @param material_costs  Array of material unit costs
 * @param machine_costs   Array of machine unit costs
 * @param count           Number of items
 * @param settings        Calculation settings
 * @return Calculation result with all totals
 */
CalculationResult calculate_estimate_avx512(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
);

/**
 * Calculate estimate totals using AVX2 (fallback)
 */
CalculationResult calculate_estimate_avx2(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
);

/**
 * Calculate estimate totals using scalar (fallback)
 */
CalculationResult calculate_estimate_scalar(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
);

/**
 * Calculate estimate totals using best available SIMD
 * Automatically selects AVX-512 > AVX2 > Scalar
 */
CalculationResult calculate_estimate_auto(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
);

/* ============================================================================
 * Array Operations (SIMD-optimized)
 * ============================================================================ */

/**
 * Calculate item totals: results[i] = quantities[i] * unit_costs[i] * coefficients[i]
 * AVX-512: 8 doubles per instruction
 */
void calculate_items_avx512(
    const double* quantities,
    const double* unit_costs,
    const double* coefficients,
    double* results,
    size_t count
);

/**
 * AVX2 version: 4 doubles per instruction
 */
void calculate_items_avx2(
    const double* quantities,
    const double* unit_costs,
    const double* coefficients,
    double* results,
    size_t count
);

/**
 * Fast array sum using AVX-512
 */
double fast_sum_avx512(const double* data, size_t count);

/**
 * Fast array sum using AVX2
 */
double fast_sum_avx2(const double* data, size_t count);

/**
 * Dot product of two arrays using SIMD
 */
double dot_product_simd(const double* a, const double* b, size_t count);

/* ============================================================================
 * Memory Operations
 * ============================================================================ */

/**
 * Aligned memory allocation for SIMD operations
 * Returns pointer aligned to 64 bytes (AVX-512)
 */
void* denidom_aligned_alloc(size_t size);

/**
 * Free aligned memory
 */
void denidom_aligned_free(void* ptr);

/* ============================================================================
 * Utility Functions
 * ============================================================================ */

/**
 * Get default calculation settings
 */
CalculationSettings denidom_default_settings(void);

/**
 * Print calculation result to stdout (for debugging)
 */
void denidom_print_result(const CalculationResult* result);

#ifdef __cplusplus
}
#endif

#endif /* DENIDOM_SIMD_CALC_H */
