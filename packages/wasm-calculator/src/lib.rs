use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

// When the `console_error_panic_hook` feature is enabled, we can call the
// `set_panic_hook` function at least once during initialization, and then
// we will get better error messages if our code ever panics.
#[cfg(feature = "console_error_panic_hook")]
pub fn set_panic_hook() {
    console_error_panic_hook::set_once();
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CalculatorItem {
    pub id: String,
    pub name: String,
    pub unit: String,
    pub quantity: f64,
    pub price: f64,
    #[serde(default = "default_coefficient")]
    pub coefficient: f64,
}

fn default_coefficient() -> f64 {
    1.0
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CalculatorOptions {
    #[serde(default = "default_overhead_rate")]
    pub overhead_rate: f64,
    #[serde(default = "default_profit_rate")]
    pub profit_rate: f64,
    #[serde(default = "default_vat_rate")]
    pub vat_rate: f64,
    #[serde(default = "default_include_vat")]
    pub include_vat: bool,
}

fn default_overhead_rate() -> f64 { 0.12 }
fn default_profit_rate() -> f64 { 0.08 }
fn default_vat_rate() -> f64 { 0.20 }
fn default_include_vat() -> bool { true }

impl Default for CalculatorOptions {
    fn default() -> Self {
        Self {
            overhead_rate: 0.12,
            profit_rate: 0.08,
            vat_rate: 0.20,
            include_vat: true,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CalculationResult {
    pub subtotal: f64,
    pub overhead: f64,
    pub profit: f64,
    pub vat: f64,
    pub total: f64,
    pub items_count: usize,
}

#[wasm_bindgen]
pub struct Calculator {
    options: CalculatorOptions,
}

#[wasm_bindgen]
impl Calculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Calculator {
        #[cfg(feature = "console_error_panic_hook")]
        set_panic_hook();
        
        Calculator {
            options: CalculatorOptions::default(),
        }
    }

    #[wasm_bindgen]
    pub fn set_options(&mut self, options_json: &str) -> Result<(), JsValue> {
        let options: CalculatorOptions = serde_json::from_str(options_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse options: {}", e)))?;
        self.options = options;
        Ok(())
    }

    #[wasm_bindgen]
    pub fn calculate(&self, items_json: &str) -> Result<String, JsValue> {
        let items: Vec<CalculatorItem> = serde_json::from_str(items_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse items: {}", e)))?;

        let result = self.calculate_internal(&items);
        
        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
    }

    fn calculate_internal(&self, items: &[CalculatorItem]) -> CalculationResult {
        // Calculate subtotal using SIMD-like optimization
        let subtotal: f64 = items
            .iter()
            .map(|item| item.quantity * item.price * item.coefficient)
            .sum();

        // Calculate overhead
        let overhead = subtotal * self.options.overhead_rate;

        // Calculate profit
        let profit = (subtotal + overhead) * self.options.profit_rate;

        // Calculate base total
        let base_total = subtotal + overhead + profit;

        // Calculate VAT
        let vat = if self.options.include_vat {
            base_total * self.options.vat_rate
        } else {
            0.0
        };

        // Calculate final total
        let total = base_total + vat;

        CalculationResult {
            subtotal: round_to_cents(subtotal),
            overhead: round_to_cents(overhead),
            profit: round_to_cents(profit),
            vat: round_to_cents(vat),
            total: round_to_cents(total),
            items_count: items.len(),
        }
    }

    #[wasm_bindgen]
    pub fn calculate_item_total(&self, quantity: f64, price: f64, coefficient: f64) -> f64 {
        round_to_cents(quantity * price * coefficient)
    }

    #[wasm_bindgen]
    pub fn calculate_materials(&self, work_json: &str, quantity: f64) -> Result<String, JsValue> {
        // Parse work data with material ratios
        let work: serde_json::Value = serde_json::from_str(work_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse work: {}", e)))?;

        let materials = work.get("materials")
            .and_then(|m| m.as_array())
            .map(|materials| {
                materials.iter().filter_map(|mat| {
                    let id = mat.get("id")?.as_str()?;
                    let ratio = mat.get("ratio")?.as_f64()?;
                    Some(serde_json::json!({
                        "id": id,
                        "quantity": round_to_cents(quantity * ratio)
                    }))
                }).collect::<Vec<_>>()
            })
            .unwrap_or_default();

        serde_json::to_string(&materials)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize materials: {}", e)))
    }
}

impl Default for Calculator {
    fn default() -> Self {
        Self::new()
    }
}

fn round_to_cents(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}

// Batch calculation for performance
#[wasm_bindgen]
pub fn batch_calculate(items_json: &str, options_json: &str) -> Result<String, JsValue> {
    let mut calculator = Calculator::new();
    calculator.set_options(options_json)?;
    calculator.calculate(items_json)
}

// Version info
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_item_total() {
        let calculator = Calculator::new();
        let total = calculator.calculate_item_total(10.0, 100.0, 1.0);
        assert_eq!(total, 1000.0);
    }

    #[test]
    fn test_calculate_item_total_with_coefficient() {
        let calculator = Calculator::new();
        let total = calculator.calculate_item_total(10.0, 100.0, 1.5);
        assert_eq!(total, 1500.0);
    }

    #[test]
    fn test_calculate_estimate() {
        let calculator = Calculator::new();
        let items_json = r#"[
            {"id": "1", "name": "Test", "unit": "шт", "quantity": 10, "price": 100, "coefficient": 1}
        ]"#;
        
        let result_json = calculator.calculate(items_json).unwrap();
        let result: CalculationResult = serde_json::from_str(&result_json).unwrap();
        
        assert_eq!(result.subtotal, 1000.0);
        assert_eq!(result.overhead, 120.0); // 12%
        assert_eq!(result.profit, 89.6);   // 8% of 1120
        assert_eq!(result.items_count, 1);
    }

    #[test]
    fn test_round_to_cents() {
        assert_eq!(round_to_cents(1.234), 1.23);
        assert_eq!(round_to_cents(1.235), 1.24);
        assert_eq!(round_to_cents(1.2), 1.2);
    }
}
