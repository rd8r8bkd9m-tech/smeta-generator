//! API Routes

use axum::{Json, response::IntoResponse};
use serde_json::json;

/// Health check endpoint
pub async fn health() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "service": "denidom-api",
        "version": "0.1.0"
    }))
}

/// Calculate estimate
pub async fn calculate() -> impl IntoResponse {
    Json(json!({
        "message": "Calculate endpoint - coming soon"
    }))
}

/// Search normatives
pub async fn search_normatives() -> impl IntoResponse {
    Json(json!({
        "message": "Search normatives - coming soon"
    }))
}
