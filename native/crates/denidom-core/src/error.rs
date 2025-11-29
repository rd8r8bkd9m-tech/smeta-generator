//! Error types for DeniDom
//!
//! Custom error types for estimate calculations and data handling.

use thiserror::Error;

/// Main error type for DeniDom operations
#[derive(Error, Debug)]
pub enum DeniDomError {
    /// Calculation error
    #[error("Calculation error: {0}")]
    Calculation(String),

    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),

    /// Data not found
    #[error("Not found: {0}")]
    NotFound(String),

    /// Database error
    #[error("Database error: {0}")]
    Database(String),

    /// Parse error
    #[error("Parse error: {0}")]
    Parse(String),

    /// IO error
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    /// Serialization error
    #[error("Serialization error: {0}")]
    Serialization(String),

    /// Invalid coefficient
    #[error("Invalid coefficient: {0}")]
    InvalidCoefficient(String),

    /// Invalid unit conversion
    #[error("Cannot convert {from} to {to}")]
    UnitConversion { from: String, to: String },
}

/// Result type alias for DeniDom operations
pub type Result<T> = std::result::Result<T, DeniDomError>;

impl From<serde_json::Error> for DeniDomError {
    fn from(err: serde_json::Error) -> Self {
        DeniDomError::Serialization(err.to_string())
    }
}
