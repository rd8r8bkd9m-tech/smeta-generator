//! Normative items - FER, GESN, TER standards
//!
//! Data structures for Russian construction normatives.

use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::estimate::UnitCosts;
use crate::units::MeasureUnit;

/// Нормативная расценка (ФЕР/ГЭСН/ТЕР)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormativeItem {
    /// Шифр расценки
    pub code: String,
    /// Наименование работы
    pub name: String,
    /// Единица измерения
    pub unit: MeasureUnit,
    /// Тип нормативной базы
    pub base_type: NormativeBase,
    /// Единичные расценки (базовые цены)
    pub costs: UnitCosts,
    /// Нормы расхода ресурсов
    pub resources: Vec<ResourceNorm>,
    /// Норма затрат труда рабочих (чел-час на ед. изм.)
    pub labor_norm: Decimal,
    /// Норма затрат машинного времени (маш-час на ед. изм.)
    pub machine_norm: Decimal,
    /// Раздел сборника
    pub section: Option<String>,
    /// Таблица
    pub table: Option<String>,
    /// Примечания
    pub notes: Option<String>,
}

impl NormativeItem {
    /// Create a new normative item
    pub fn new(code: String, name: String, base_type: NormativeBase) -> Self {
        Self {
            code,
            name,
            unit: MeasureUnit::Unit,
            base_type,
            costs: UnitCosts::default(),
            resources: Vec::new(),
            labor_norm: Decimal::ZERO,
            machine_norm: Decimal::ZERO,
            section: None,
            table: None,
            notes: None,
        }
    }

    /// Get the collection number from code (e.g., "ФЕР01" from "ФЕР01-01-001-01")
    pub fn collection(&self) -> Option<&str> {
        // Handle UTF-8 properly - find the position of the first dash
        // or use char indices
        let chars: Vec<(usize, char)> = self.code.char_indices().take(6).collect();
        if chars.len() >= 5 {
            // Get byte position after 5th character
            if let Some((end_pos, _)) = chars.get(5) {
                Some(&self.code[..*end_pos])
            } else {
                // 5 characters exactly
                Some(&self.code)
            }
        } else {
            None
        }
    }

    /// Check if this is a FER normative
    pub fn is_fer(&self) -> bool {
        matches!(self.base_type, NormativeBase::FER)
    }

    /// Check if this is a GESN normative
    pub fn is_gesn(&self) -> bool {
        matches!(self.base_type, NormativeBase::GESN)
    }

    /// Check if this is a TER normative  
    pub fn is_ter(&self) -> bool {
        matches!(self.base_type, NormativeBase::TER)
    }
}

/// Тип нормативной базы
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum NormativeBase {
    /// ФЕР - Федеральные единичные расценки
    FER,
    /// ГЭСН - Государственные элементные сметные нормы
    GESN,
    /// ТЕР - Территориальные единичные расценки
    TER,
    /// ФЕРм - Федеральные единичные расценки на монтаж оборудования
    FERm,
    /// ФЕРп - Федеральные единичные расценки на пусконаладочные работы
    FERp,
    /// ФЕРр - Федеральные единичные расценки на ремонтно-строительные работы
    FERr,
}

impl NormativeBase {
    /// Get display name in Russian
    pub fn display_name(&self) -> &'static str {
        match self {
            Self::FER => "ФЕР",
            Self::GESN => "ГЭСН",
            Self::TER => "ТЕР",
            Self::FERm => "ФЕРм",
            Self::FERp => "ФЕРп",
            Self::FERr => "ФЕРр",
        }
    }

    /// Get full name in Russian
    pub fn full_name(&self) -> &'static str {
        match self {
            Self::FER => "Федеральные единичные расценки",
            Self::GESN => "Государственные элементные сметные нормы",
            Self::TER => "Территориальные единичные расценки",
            Self::FERm => "ФЕР на монтаж оборудования",
            Self::FERp => "ФЕР на пусконаладочные работы",
            Self::FERr => "ФЕР на ремонтно-строительные работы",
        }
    }

    /// Parse from string prefix
    pub fn from_code_prefix(code: &str) -> Option<Self> {
        let upper = code.to_uppercase();
        if upper.starts_with("ГЭСН") || upper.starts_with("GESN") {
            Some(Self::GESN)
        } else if upper.starts_with("ФЕРМ") || upper.starts_with("FERM") {
            Some(Self::FERm)
        } else if upper.starts_with("ФЕРП") || upper.starts_with("FERP") {
            Some(Self::FERp)
        } else if upper.starts_with("ФЕРР") || upper.starts_with("FERR") {
            Some(Self::FERr)
        } else if upper.starts_with("ФЕР") || upper.starts_with("FER") {
            Some(Self::FER)
        } else if upper.starts_with("ТЕР") || upper.starts_with("TER") {
            Some(Self::TER)
        } else {
            None
        }
    }
}

impl std::fmt::Display for NormativeBase {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.display_name())
    }
}

/// Норма расхода ресурса
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceNorm {
    /// Код ресурса
    pub code: String,
    /// Наименование ресурса
    pub name: String,
    /// Тип ресурса
    pub resource_type: ResourceNormType,
    /// Единица измерения
    pub unit: MeasureUnit,
    /// Норма расхода на единицу измерения работы
    pub consumption: Decimal,
    /// Базовая цена ресурса
    pub base_price: Option<Decimal>,
}

/// Тип ресурса в норме
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResourceNormType {
    /// Материал
    Material,
    /// Машины и механизмы
    Machine,
    /// Затраты труда рабочих
    Labor,
    /// Затраты труда машинистов
    MachineOperator,
}

/// Сборник нормативов
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormativeCollection {
    /// Код сборника (например, "01", "02")
    pub code: String,
    /// Наименование сборника
    pub name: String,
    /// Тип базы
    pub base_type: NormativeBase,
    /// Количество расценок
    pub items_count: usize,
}

/// Предопределённые сборники ФЕР
pub fn fer_collections() -> Vec<NormativeCollection> {
    vec![
        NormativeCollection {
            code: "01".to_string(),
            name: "Земляные работы".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "06".to_string(),
            name: "Бетонные и железобетонные конструкции монолитные".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "07".to_string(),
            name: "Бетонные и железобетонные конструкции сборные".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "08".to_string(),
            name: "Конструкции из кирпича и блоков".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "09".to_string(),
            name: "Металлические конструкции".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "10".to_string(),
            name: "Деревянные конструкции".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "11".to_string(),
            name: "Полы".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "12".to_string(),
            name: "Кровли".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "15".to_string(),
            name: "Отделочные работы".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "16".to_string(),
            name: "Трубопроводы внутренние".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "17".to_string(),
            name: "Водопровод и канализация".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "18".to_string(),
            name: "Отопление".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "20".to_string(),
            name: "Вентиляция и кондиционирование".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
        NormativeCollection {
            code: "26".to_string(),
            name: "Теплоизоляционные работы".to_string(),
            base_type: NormativeBase::FER,
            items_count: 0,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normative_base_from_code() {
        assert_eq!(
            NormativeBase::from_code_prefix("ФЕР01-01-001"),
            Some(NormativeBase::FER)
        );
        assert_eq!(
            NormativeBase::from_code_prefix("ГЭСН01-01-001"),
            Some(NormativeBase::GESN)
        );
        assert_eq!(
            NormativeBase::from_code_prefix("ТЕР-СПб-01"),
            Some(NormativeBase::TER)
        );
    }

    #[test]
    fn test_normative_item_collection() {
        let item = NormativeItem::new(
            "ФЕР15-01-002-01".to_string(),
            "Штукатурка улучшенная".to_string(),
            NormativeBase::FER,
        );

        assert_eq!(item.collection(), Some("ФЕР15"));
        assert!(item.is_fer());
    }
}
