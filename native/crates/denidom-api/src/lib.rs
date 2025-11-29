//! DeniDom REST API Server
//!
//! High-performance API server for estimate calculations.

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;
use std::net::SocketAddr;

pub mod routes;
pub mod handlers;

/// Create the API router
pub fn create_router() -> Router {
    Router::new()
        .route("/health", get(routes::health))
        .route("/api/calculate", post(routes::calculate))
        .route("/api/normatives/search", get(routes::search_normatives))
        .layer(CorsLayer::permissive())
}

/// Start the API server
pub async fn start_server(addr: SocketAddr) -> Result<(), Box<dyn std::error::Error>> {
    let app = create_router();
    
    tracing::info!("🚀 DeniDom API starting on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    
    Ok(())
}
