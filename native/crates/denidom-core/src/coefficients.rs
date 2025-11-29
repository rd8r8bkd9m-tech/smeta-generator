//! Coefficients for estimate calculations
//!
//! Various adjustment coefficients used in construction estimates.

use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// Коэффициенты к смете
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coefficients {
    /// Индекс пересчёта в текущие цены
    pub index: Decimal,
    /// Коэффициент зимнего удорожания
    pub winter: Option<Decimal>,
    /// Коэффициент стеснённости
    pub cramped: Option<Decimal>,
    /// Региональный коэффициент
    pub regional: Option<Decimal>,
    /// Высотный коэффициент
    pub height: Option<Decimal>,
    /// Пользовательские коэффициенты
    pub custom: Vec<CustomCoefficient>,
}

impl Default for Coefficients {
    fn default() -> Self {
        Self {
            index: Decimal::ONE,
            winter: None,
            cramped: None,
            regional: None,
            height: None,
            custom: Vec::new(),
        }
    }
}

impl Coefficients {
    /// Calculate combined coefficient (multiply all applicable coefficients)
    pub fn combined(&self) -> Decimal {
        let mut result = self.index;
        
        if let Some(winter) = self.winter {
            result *= winter;
        }
        if let Some(cramped) = self.cramped {
            result *= cramped;
        }
        if let Some(regional) = self.regional {
            result *= regional;
        }
        if let Some(height) = self.height {
            result *= height;
        }
        
        for custom in &self.custom {
            if custom.is_active {
                result *= custom.value;
            }
        }
        
        result
    }

    /// Add a custom coefficient
    pub fn add_custom(&mut self, name: String, value: Decimal, justification: Option<String>) {
        self.custom.push(CustomCoefficient {
            name,
            value,
            justification,
            is_active: true,
        });
    }
}

/// Пользовательский коэффициент
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomCoefficient {
    /// Наименование коэффициента
    pub name: String,
    /// Значение коэффициента
    pub value: Decimal,
    /// Обоснование применения
    pub justification: Option<String>,
    /// Активен ли коэффициент
    pub is_active: bool,
}

/// Индекс пересчёта цен
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PriceIndex {
    /// Код индекса
    pub code: String,
    /// Наименование
    pub name: String,
    /// Значение индекса
    pub value: Decimal,
    /// Регион
    pub region: Option<String>,
    /// Период действия (квартал)
    pub quarter: String,
    /// Год
    pub year: u16,
    /// Тип работ
    pub work_type: Option<WorkType>,
}

/// Тип работ для индекса
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WorkType {
    /// Строительно-монтажные работы
    Construction,
    /// Ремонтно-строительные работы
    Repair,
    /// Монтаж оборудования
    Installation,
    /// Пусконаладочные работы
    Commissioning,
    /// Проектные работы
    Design,
}

/// Зимние коэффициенты по ГСН 81-05-02-2007
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WinterCoefficient {
    /// Температурная зона (1-8)
    pub zone: u8,
    /// Раздел работ
    pub work_section: String,
    /// Коэффициент к ОЗП
    pub labor_coefficient: Decimal,
    /// Коэффициент к ЭМ
    pub machine_coefficient: Decimal,
    /// Коэффициент к материалам
    pub material_coefficient: Decimal,
}

/// Температурные зоны России
pub fn temperature_zones() -> Vec<(&'static str, u8)> {
    vec![
        ("Краснодарский край", 1),
        ("Ростовская область", 2),
        ("Волгоградская область", 3),
        ("Московская область", 4),
        ("Нижегородская область", 4),
        ("Ленинградская область", 5),
        ("Свердловская область", 5),
        ("Новосибирская область", 6),
        ("Красноярский край", 6),
        ("Иркутская область", 7),
        ("Якутия", 8),
        ("Чукотка", 8),
    ]
}

/// Коэффициенты стеснённости по МДС 81-35.2004
pub fn cramped_coefficients() -> Vec<CrampedCondition> {
    vec![
        CrampedCondition {
            name: "Работа на действующем предприятии".to_string(),
            code: "К1".to_string(),
            coefficient: Decimal::new(115, 2), // 1.15
            description: "Без остановки производства".to_string(),
        },
        CrampedCondition {
            name: "Работа в жилом здании".to_string(),
            code: "К2".to_string(),
            coefficient: Decimal::new(120, 2), // 1.20
            description: "Без выселения жильцов".to_string(),
        },
        CrampedCondition {
            name: "Работа в стеснённых условиях".to_string(),
            code: "К3".to_string(),
            coefficient: Decimal::new(110, 2), // 1.10
            description: "Площадь рабочего места менее норматива".to_string(),
        },
        CrampedCondition {
            name: "Работа на высоте более 3.5м".to_string(),
            code: "К4".to_string(),
            coefficient: Decimal::new(108, 2), // 1.08
            description: "С подмостей и лесов".to_string(),
        },
    ]
}

/// Условие стеснённости
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrampedCondition {
    /// Наименование условия
    pub name: String,
    /// Код коэффициента
    pub code: String,
    /// Значение коэффициента
    pub coefficient: Decimal,
    /// Описание
    pub description: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_coefficients_combined() {
        let mut coef = Coefficients::default();
        coef.index = Decimal::new(850, 2); // 8.50 (индекс пересчёта)
        coef.winter = Some(Decimal::new(103, 2)); // 1.03
        
        let combined = coef.combined();
        // 8.50 * 1.03 = 8.755
        assert!(combined > Decimal::new(875, 2));
    }

    #[test]
    fn test_custom_coefficient() {
        let mut coef = Coefficients::default();
        coef.add_custom(
            "Работа в ночное время".to_string(),
            Decimal::new(120, 2), // 1.20
            Some("Приказ №123".to_string()),
        );
        
        assert_eq!(coef.custom.len(), 1);
        assert_eq!(coef.combined(), Decimal::new(120, 2));
    }
}
