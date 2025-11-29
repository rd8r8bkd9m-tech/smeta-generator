/*
 * DeniDom SIMD Calculations - Implementation
 * High-performance AVX-512/AVX2 implementations for estimate calculations
 * 
 * Copyright (c) 2024 DeniDom Team
 * Licensed under MIT
 */

#include "simd_calc.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _MSC_VER
#include <intrin.h>
#else
#include <cpuid.h>
#endif

#if defined(__x86_64__) || defined(_M_X64)
#include <immintrin.h>
#define HAS_X86_SIMD 1
#else
#define HAS_X86_SIMD 0
#endif

/* ============================================================================
 * CPU Feature Detection
 * ============================================================================ */

static void get_cpuid(int func, int* eax, int* ebx, int* ecx, int* edx) {
#ifdef _MSC_VER
    int regs[4];
    __cpuid(regs, func);
    *eax = regs[0];
    *ebx = regs[1];
    *ecx = regs[2];
    *edx = regs[3];
#else
    __cpuid(func, *eax, *ebx, *ecx, *edx);
#endif
}

static void get_cpuid_ex(int func, int sub, int* eax, int* ebx, int* ecx, int* edx) {
#ifdef _MSC_VER
    int regs[4];
    __cpuidex(regs, func, sub);
    *eax = regs[0];
    *ebx = regs[1];
    *ecx = regs[2];
    *edx = regs[3];
#else
    __cpuid_count(func, sub, *eax, *ebx, *ecx, *edx);
#endif
}

bool denidom_has_avx512(void) {
#if HAS_X86_SIMD
    int eax, ebx, ecx, edx;
    
    /* Check if CPUID supports function 7 */
    get_cpuid(0, &eax, &ebx, &ecx, &edx);
    if (eax < 7) return false;
    
    /* Get extended features */
    get_cpuid_ex(7, 0, &eax, &ebx, &ecx, &edx);
    
    /* Check AVX-512 Foundation bit (bit 16 of EBX) */
    return (ebx & (1 << 16)) != 0;
#else
    return false;
#endif
}

bool denidom_has_avx2(void) {
#if HAS_X86_SIMD
    int eax, ebx, ecx, edx;
    
    get_cpuid(0, &eax, &ebx, &ecx, &edx);
    if (eax < 7) return false;
    
    get_cpuid_ex(7, 0, &eax, &ebx, &ecx, &edx);
    
    /* Check AVX2 bit (bit 5 of EBX) */
    return (ebx & (1 << 5)) != 0;
#else
    return false;
#endif
}

bool denidom_has_fma(void) {
#if HAS_X86_SIMD
    int eax, ebx, ecx, edx;
    get_cpuid(1, &eax, &ebx, &ecx, &edx);
    
    /* Check FMA bit (bit 12 of ECX) */
    return (ecx & (1 << 12)) != 0;
#else
    return false;
#endif
}

/* ============================================================================
 * Scalar Implementation (Fallback)
 * ============================================================================ */

CalculationResult calculate_estimate_scalar(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
) {
    CalculationResult result = {0};
    
    for (size_t i = 0; i < count; i++) {
        double q = quantities[i];
        result.direct_costs += q * direct_costs[i];
        result.labor_costs += q * labor_costs[i];
        result.machine_op_costs += q * machine_op_costs[i];
        result.material_costs += q * material_costs[i];
        result.machine_costs += q * machine_costs[i];
    }
    
    /* Apply index */
    result.direct_costs *= settings->index;
    result.labor_costs *= settings->index;
    result.machine_op_costs *= settings->index;
    result.material_costs *= settings->index;
    result.machine_costs *= settings->index;
    
    /* Calculate overhead and profit from FOT (ОЗП + ЗПМ) */
    double labor_total = result.labor_costs + result.machine_op_costs;
    result.overhead = labor_total * settings->overhead_rate;
    result.profit = labor_total * settings->profit_rate;
    
    /* Subtotal, VAT, Total */
    result.subtotal = result.direct_costs + result.overhead + result.profit;
    result.vat = result.subtotal * settings->vat_rate;
    result.total = result.subtotal + result.vat;
    
    return result;
}

/* ============================================================================
 * AVX2 Implementation
 * ============================================================================ */

#if HAS_X86_SIMD

/* Horizontal sum of __m256d */
static inline double hsum256_pd(__m256d v) {
    __m128d low = _mm256_castpd256_pd128(v);
    __m128d high = _mm256_extractf128_pd(v, 1);
    __m128d sum128 = _mm_add_pd(low, high);
    __m128d sum = _mm_hadd_pd(sum128, sum128);
    return _mm_cvtsd_f64(sum);
}

CalculationResult calculate_estimate_avx2(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
) {
    if (count < 4) {
        return calculate_estimate_scalar(
            quantities, direct_costs, labor_costs,
            machine_op_costs, material_costs, machine_costs,
            count, settings
        );
    }
    
    __m256d direct_sum = _mm256_setzero_pd();
    __m256d labor_sum = _mm256_setzero_pd();
    __m256d machine_op_sum = _mm256_setzero_pd();
    __m256d material_sum = _mm256_setzero_pd();
    __m256d machine_sum = _mm256_setzero_pd();
    
    size_t chunks = count / 4;
    
    for (size_t i = 0; i < chunks; i++) {
        size_t idx = i * 4;
        
        __m256d q = _mm256_loadu_pd(&quantities[idx]);
        
        __m256d d = _mm256_loadu_pd(&direct_costs[idx]);
        __m256d l = _mm256_loadu_pd(&labor_costs[idx]);
        __m256d mo = _mm256_loadu_pd(&machine_op_costs[idx]);
        __m256d mat = _mm256_loadu_pd(&material_costs[idx]);
        __m256d m = _mm256_loadu_pd(&machine_costs[idx]);
        
        /* FMA: sum += q * cost */
        direct_sum = _mm256_fmadd_pd(q, d, direct_sum);
        labor_sum = _mm256_fmadd_pd(q, l, labor_sum);
        machine_op_sum = _mm256_fmadd_pd(q, mo, machine_op_sum);
        material_sum = _mm256_fmadd_pd(q, mat, material_sum);
        machine_sum = _mm256_fmadd_pd(q, m, machine_sum);
    }
    
    CalculationResult result = {0};
    result.direct_costs = hsum256_pd(direct_sum);
    result.labor_costs = hsum256_pd(labor_sum);
    result.machine_op_costs = hsum256_pd(machine_op_sum);
    result.material_costs = hsum256_pd(material_sum);
    result.machine_costs = hsum256_pd(machine_sum);
    
    /* Process remainder */
    for (size_t i = chunks * 4; i < count; i++) {
        double q = quantities[i];
        result.direct_costs += q * direct_costs[i];
        result.labor_costs += q * labor_costs[i];
        result.machine_op_costs += q * machine_op_costs[i];
        result.material_costs += q * material_costs[i];
        result.machine_costs += q * machine_costs[i];
    }
    
    /* Apply index */
    result.direct_costs *= settings->index;
    result.labor_costs *= settings->index;
    result.machine_op_costs *= settings->index;
    result.material_costs *= settings->index;
    result.machine_costs *= settings->index;
    
    /* Overhead and profit */
    double labor_total = result.labor_costs + result.machine_op_costs;
    result.overhead = labor_total * settings->overhead_rate;
    result.profit = labor_total * settings->profit_rate;
    
    /* Subtotal, VAT, Total */
    result.subtotal = result.direct_costs + result.overhead + result.profit;
    result.vat = result.subtotal * settings->vat_rate;
    result.total = result.subtotal + result.vat;
    
    return result;
}

/* ============================================================================
 * AVX-512 Implementation
 * ============================================================================ */

#ifdef __AVX512F__

CalculationResult calculate_estimate_avx512(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
) {
    if (count < 8) {
        return calculate_estimate_avx2(
            quantities, direct_costs, labor_costs,
            machine_op_costs, material_costs, machine_costs,
            count, settings
        );
    }
    
    __m512d direct_sum = _mm512_setzero_pd();
    __m512d labor_sum = _mm512_setzero_pd();
    __m512d machine_op_sum = _mm512_setzero_pd();
    __m512d material_sum = _mm512_setzero_pd();
    __m512d machine_sum = _mm512_setzero_pd();
    
    size_t chunks = count / 8;
    
    for (size_t i = 0; i < chunks; i++) {
        size_t idx = i * 8;
        
        __m512d q = _mm512_loadu_pd(&quantities[idx]);
        
        __m512d d = _mm512_loadu_pd(&direct_costs[idx]);
        __m512d l = _mm512_loadu_pd(&labor_costs[idx]);
        __m512d mo = _mm512_loadu_pd(&machine_op_costs[idx]);
        __m512d mat = _mm512_loadu_pd(&material_costs[idx]);
        __m512d m = _mm512_loadu_pd(&machine_costs[idx]);
        
        /* FMA: sum += q * cost */
        direct_sum = _mm512_fmadd_pd(q, d, direct_sum);
        labor_sum = _mm512_fmadd_pd(q, l, labor_sum);
        machine_op_sum = _mm512_fmadd_pd(q, mo, machine_op_sum);
        material_sum = _mm512_fmadd_pd(q, mat, material_sum);
        machine_sum = _mm512_fmadd_pd(q, m, machine_sum);
    }
    
    CalculationResult result = {0};
    result.direct_costs = _mm512_reduce_add_pd(direct_sum);
    result.labor_costs = _mm512_reduce_add_pd(labor_sum);
    result.machine_op_costs = _mm512_reduce_add_pd(machine_op_sum);
    result.material_costs = _mm512_reduce_add_pd(material_sum);
    result.machine_costs = _mm512_reduce_add_pd(machine_sum);
    
    /* Process remainder with AVX2 */
    size_t remainder_start = chunks * 8;
    if (count - remainder_start >= 4) {
        /* Use AVX2 for groups of 4 */
        size_t avx2_chunks = (count - remainder_start) / 4;
        
        __m256d direct_rem = _mm256_setzero_pd();
        __m256d labor_rem = _mm256_setzero_pd();
        __m256d machine_op_rem = _mm256_setzero_pd();
        __m256d material_rem = _mm256_setzero_pd();
        __m256d machine_rem = _mm256_setzero_pd();
        
        for (size_t i = 0; i < avx2_chunks; i++) {
            size_t idx = remainder_start + i * 4;
            
            __m256d q = _mm256_loadu_pd(&quantities[idx]);
            direct_rem = _mm256_fmadd_pd(q, _mm256_loadu_pd(&direct_costs[idx]), direct_rem);
            labor_rem = _mm256_fmadd_pd(q, _mm256_loadu_pd(&labor_costs[idx]), labor_rem);
            machine_op_rem = _mm256_fmadd_pd(q, _mm256_loadu_pd(&machine_op_costs[idx]), machine_op_rem);
            material_rem = _mm256_fmadd_pd(q, _mm256_loadu_pd(&material_costs[idx]), material_rem);
            machine_rem = _mm256_fmadd_pd(q, _mm256_loadu_pd(&machine_costs[idx]), machine_rem);
        }
        
        result.direct_costs += hsum256_pd(direct_rem);
        result.labor_costs += hsum256_pd(labor_rem);
        result.machine_op_costs += hsum256_pd(machine_op_rem);
        result.material_costs += hsum256_pd(material_rem);
        result.machine_costs += hsum256_pd(machine_rem);
        
        remainder_start += avx2_chunks * 4;
    }
    
    /* Scalar remainder */
    for (size_t i = remainder_start; i < count; i++) {
        double q = quantities[i];
        result.direct_costs += q * direct_costs[i];
        result.labor_costs += q * labor_costs[i];
        result.machine_op_costs += q * machine_op_costs[i];
        result.material_costs += q * material_costs[i];
        result.machine_costs += q * machine_costs[i];
    }
    
    /* Apply index */
    result.direct_costs *= settings->index;
    result.labor_costs *= settings->index;
    result.machine_op_costs *= settings->index;
    result.material_costs *= settings->index;
    result.machine_costs *= settings->index;
    
    /* Overhead and profit */
    double labor_total = result.labor_costs + result.machine_op_costs;
    result.overhead = labor_total * settings->overhead_rate;
    result.profit = labor_total * settings->profit_rate;
    
    /* Subtotal, VAT, Total */
    result.subtotal = result.direct_costs + result.overhead + result.profit;
    result.vat = result.subtotal * settings->vat_rate;
    result.total = result.subtotal + result.vat;
    
    return result;
}

#else

/* AVX-512 not available at compile time - fallback to AVX2 */
CalculationResult calculate_estimate_avx512(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
) {
    return calculate_estimate_avx2(
        quantities, direct_costs, labor_costs,
        machine_op_costs, material_costs, machine_costs,
        count, settings
    );
}

#endif /* __AVX512F__ */

/* ============================================================================
 * Array Operations
 * ============================================================================ */

void calculate_items_avx2(
    const double* quantities,
    const double* unit_costs,
    const double* coefficients,
    double* results,
    size_t count
) {
    size_t i = 0;
    
    /* AVX2: process 4 doubles at a time */
    for (; i + 4 <= count; i += 4) {
        __m256d q = _mm256_loadu_pd(&quantities[i]);
        __m256d c = _mm256_loadu_pd(&unit_costs[i]);
        __m256d k = _mm256_loadu_pd(&coefficients[i]);
        
        __m256d result = _mm256_mul_pd(_mm256_mul_pd(q, c), k);
        _mm256_storeu_pd(&results[i], result);
    }
    
    /* Scalar remainder */
    for (; i < count; i++) {
        results[i] = quantities[i] * unit_costs[i] * coefficients[i];
    }
}

#ifdef __AVX512F__

void calculate_items_avx512(
    const double* quantities,
    const double* unit_costs,
    const double* coefficients,
    double* results,
    size_t count
) {
    size_t i = 0;
    
    /* AVX-512: process 8 doubles at a time */
    for (; i + 8 <= count; i += 8) {
        __m512d q = _mm512_loadu_pd(&quantities[i]);
        __m512d c = _mm512_loadu_pd(&unit_costs[i]);
        __m512d k = _mm512_loadu_pd(&coefficients[i]);
        
        __m512d result = _mm512_mul_pd(_mm512_mul_pd(q, c), k);
        _mm512_storeu_pd(&results[i], result);
    }
    
    /* AVX2 for groups of 4 */
    for (; i + 4 <= count; i += 4) {
        __m256d q = _mm256_loadu_pd(&quantities[i]);
        __m256d c = _mm256_loadu_pd(&unit_costs[i]);
        __m256d k = _mm256_loadu_pd(&coefficients[i]);
        
        __m256d result = _mm256_mul_pd(_mm256_mul_pd(q, c), k);
        _mm256_storeu_pd(&results[i], result);
    }
    
    /* Scalar remainder */
    for (; i < count; i++) {
        results[i] = quantities[i] * unit_costs[i] * coefficients[i];
    }
}

double fast_sum_avx512(const double* data, size_t count) {
    __m512d sum_vec = _mm512_setzero_pd();
    size_t i = 0;
    
    for (; i + 8 <= count; i += 8) {
        __m512d values = _mm512_loadu_pd(&data[i]);
        sum_vec = _mm512_add_pd(sum_vec, values);
    }
    
    double sum = _mm512_reduce_add_pd(sum_vec);
    
    /* Remainder */
    for (; i < count; i++) {
        sum += data[i];
    }
    
    return sum;
}

#else

void calculate_items_avx512(
    const double* quantities,
    const double* unit_costs,
    const double* coefficients,
    double* results,
    size_t count
) {
    calculate_items_avx2(quantities, unit_costs, coefficients, results, count);
}

double fast_sum_avx512(const double* data, size_t count) {
    return fast_sum_avx2(data, count);
}

#endif /* __AVX512F__ */

double fast_sum_avx2(const double* data, size_t count) {
    __m256d sum_vec = _mm256_setzero_pd();
    size_t i = 0;
    
    for (; i + 4 <= count; i += 4) {
        __m256d values = _mm256_loadu_pd(&data[i]);
        sum_vec = _mm256_add_pd(sum_vec, values);
    }
    
    double sum = hsum256_pd(sum_vec);
    
    for (; i < count; i++) {
        sum += data[i];
    }
    
    return sum;
}

double dot_product_simd(const double* a, const double* b, size_t count) {
    __m256d sum_vec = _mm256_setzero_pd();
    size_t i = 0;
    
    for (; i + 4 <= count; i += 4) {
        __m256d va = _mm256_loadu_pd(&a[i]);
        __m256d vb = _mm256_loadu_pd(&b[i]);
        sum_vec = _mm256_fmadd_pd(va, vb, sum_vec);
    }
    
    double sum = hsum256_pd(sum_vec);
    
    for (; i < count; i++) {
        sum += a[i] * b[i];
    }
    
    return sum;
}

#else /* !HAS_X86_SIMD */

/* Non-x86 platforms - scalar implementations only */

CalculationResult calculate_estimate_avx2(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
) {
    return calculate_estimate_scalar(
        quantities, direct_costs, labor_costs,
        machine_op_costs, material_costs, machine_costs,
        count, settings
    );
}

CalculationResult calculate_estimate_avx512(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
) {
    return calculate_estimate_scalar(
        quantities, direct_costs, labor_costs,
        machine_op_costs, material_costs, machine_costs,
        count, settings
    );
}

void calculate_items_avx2(
    const double* quantities,
    const double* unit_costs,
    const double* coefficients,
    double* results,
    size_t count
) {
    for (size_t i = 0; i < count; i++) {
        results[i] = quantities[i] * unit_costs[i] * coefficients[i];
    }
}

void calculate_items_avx512(
    const double* quantities,
    const double* unit_costs,
    const double* coefficients,
    double* results,
    size_t count
) {
    calculate_items_avx2(quantities, unit_costs, coefficients, results, count);
}

double fast_sum_avx2(const double* data, size_t count) {
    double sum = 0.0;
    for (size_t i = 0; i < count; i++) {
        sum += data[i];
    }
    return sum;
}

double fast_sum_avx512(const double* data, size_t count) {
    return fast_sum_avx2(data, count);
}

double dot_product_simd(const double* a, const double* b, size_t count) {
    double sum = 0.0;
    for (size_t i = 0; i < count; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}

#endif /* HAS_X86_SIMD */

/* ============================================================================
 * Auto-Selection
 * ============================================================================ */

CalculationResult calculate_estimate_auto(
    const double* quantities,
    const double* direct_costs,
    const double* labor_costs,
    const double* machine_op_costs,
    const double* material_costs,
    const double* machine_costs,
    size_t count,
    const CalculationSettings* settings
) {
    if (denidom_has_avx512()) {
        return calculate_estimate_avx512(
            quantities, direct_costs, labor_costs,
            machine_op_costs, material_costs, machine_costs,
            count, settings
        );
    }
    
    if (denidom_has_avx2()) {
        return calculate_estimate_avx2(
            quantities, direct_costs, labor_costs,
            machine_op_costs, material_costs, machine_costs,
            count, settings
        );
    }
    
    return calculate_estimate_scalar(
        quantities, direct_costs, labor_costs,
        machine_op_costs, material_costs, machine_costs,
        count, settings
    );
}

/* ============================================================================
 * Memory Operations
 * ============================================================================ */

void* denidom_aligned_alloc(size_t size) {
#ifdef _MSC_VER
    return _aligned_malloc(size, 64);
#else
    void* ptr = NULL;
    if (posix_memalign(&ptr, 64, size) != 0) {
        return NULL;
    }
    return ptr;
#endif
}

void denidom_aligned_free(void* ptr) {
#ifdef _MSC_VER
    _aligned_free(ptr);
#else
    free(ptr);
#endif
}

/* ============================================================================
 * Utility Functions
 * ============================================================================ */

CalculationSettings denidom_default_settings(void) {
    CalculationSettings settings;
    settings.overhead_rate = 0.12;
    settings.profit_rate = 0.08;
    settings.vat_rate = 0.20;
    settings.index = 1.0;
    return settings;
}

void denidom_print_result(const CalculationResult* result) {
    printf("═══════════════════════════════════════\n");
    printf("  Результаты расчёта сметы\n");
    printf("═══════════════════════════════════════\n");
    printf("  Прямые затраты:    %15.2f ₽\n", result->direct_costs);
    printf("  ОЗП:               %15.2f ₽\n", result->labor_costs);
    printf("  ЗПМ:               %15.2f ₽\n", result->machine_op_costs);
    printf("  Материалы:         %15.2f ₽\n", result->material_costs);
    printf("  Машины:            %15.2f ₽\n", result->machine_costs);
    printf("───────────────────────────────────────\n");
    printf("  Накладные расходы: %15.2f ₽\n", result->overhead);
    printf("  Сметная прибыль:   %15.2f ₽\n", result->profit);
    printf("───────────────────────────────────────\n");
    printf("  Итого без НДС:     %15.2f ₽\n", result->subtotal);
    printf("  НДС 20%%:           %15.2f ₽\n", result->vat);
    printf("═══════════════════════════════════════\n");
    printf("  ИТОГО:             %15.2f ₽\n", result->total);
    printf("═══════════════════════════════════════\n");
}
