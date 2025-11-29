//! DeniDom SIMD - High-performance SIMD calculations
//!
//! This crate provides SIMD-optimized functions for estimate calculations.
//! Supports SSE, AVX2, AVX-512 (x86/x64) and NEON (ARM).

pub mod scalar;
pub mod simd_calc;
pub mod types;

#[cfg(feature = "native-c")]
pub mod ffi;

pub use scalar::*;
pub use simd_calc::*;
pub use types::*;
