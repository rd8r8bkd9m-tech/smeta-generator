//! Measurement units for construction estimates
//!
//! Standard units of measurement used in Russian construction norms.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Единица измерения
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MeasureUnit {
    // Линейные
    /// Метр (м)
    Meter,
    /// Километр (км)
    Kilometer,
    /// Погонный метр (п.м)
    LinearMeter,
    /// 100 погонных метров (100 п.м)
    LinearMeter100,

    // Площадные
    /// Квадратный метр (м²)
    SquareMeter,
    /// 100 квадратных метров (100 м²)
    SquareMeter100,
    /// Гектар (га)
    Hectare,
    /// 1000 квадратных метров (1000 м²)
    SquareMeter1000,

    // Объёмные
    /// Кубический метр (м³)
    CubicMeter,
    /// 100 кубических метров (100 м³)
    CubicMeter100,
    /// 1000 кубических метров (1000 м³)
    CubicMeter1000,
    /// Литр (л)
    Liter,

    // Весовые
    /// Килограмм (кг)
    Kilogram,
    /// Тонна (т)
    Ton,
    /// 100 килограмм (100 кг)
    Kilogram100,

    // Штучные
    /// Штука (шт)
    Unit,
    /// 10 штук (10 шт)
    Unit10,
    /// 100 штук (100 шт)
    Unit100,
    /// 1000 штук (1000 шт)
    Unit1000,
    /// Комплект (компл)
    Set,

    // Временные
    /// Человеко-час (чел-ч)
    ManHour,
    /// Машино-час (маш-ч)
    MachineHour,
    /// Смена (см)
    Shift,

    // Специальные
    /// Точка присоединения
    ConnectionPoint,
    /// Выключатель, розетка
    SwitchSocket,
    /// Узел
    Node,
    /// Место
    Place,
    /// Проём
    Opening,
    /// Элемент
    Element,

    /// Другая единица (с пользовательским обозначением)
    Other(String),
}

impl MeasureUnit {
    /// Get short Russian abbreviation
    pub fn abbreviation(&self) -> &str {
        match self {
            Self::Meter => "м",
            Self::Kilometer => "км",
            Self::LinearMeter => "п.м",
            Self::LinearMeter100 => "100 п.м",
            Self::SquareMeter => "м²",
            Self::SquareMeter100 => "100 м²",
            Self::SquareMeter1000 => "1000 м²",
            Self::Hectare => "га",
            Self::CubicMeter => "м³",
            Self::CubicMeter100 => "100 м³",
            Self::CubicMeter1000 => "1000 м³",
            Self::Liter => "л",
            Self::Kilogram => "кг",
            Self::Ton => "т",
            Self::Kilogram100 => "100 кг",
            Self::Unit => "шт",
            Self::Unit10 => "10 шт",
            Self::Unit100 => "100 шт",
            Self::Unit1000 => "1000 шт",
            Self::Set => "компл",
            Self::ManHour => "чел-ч",
            Self::MachineHour => "маш-ч",
            Self::Shift => "см",
            Self::ConnectionPoint => "точка",
            Self::SwitchSocket => "шт",
            Self::Node => "узел",
            Self::Place => "место",
            Self::Opening => "проём",
            Self::Element => "элем",
            Self::Other(s) => s,
        }
    }

    /// Get full Russian name
    pub fn full_name(&self) -> &str {
        match self {
            Self::Meter => "метр",
            Self::Kilometer => "километр",
            Self::LinearMeter => "погонный метр",
            Self::LinearMeter100 => "100 погонных метров",
            Self::SquareMeter => "квадратный метр",
            Self::SquareMeter100 => "100 квадратных метров",
            Self::SquareMeter1000 => "1000 квадратных метров",
            Self::Hectare => "гектар",
            Self::CubicMeter => "кубический метр",
            Self::CubicMeter100 => "100 кубических метров",
            Self::CubicMeter1000 => "1000 кубических метров",
            Self::Liter => "литр",
            Self::Kilogram => "килограмм",
            Self::Ton => "тонна",
            Self::Kilogram100 => "100 килограмм",
            Self::Unit => "штука",
            Self::Unit10 => "10 штук",
            Self::Unit100 => "100 штук",
            Self::Unit1000 => "1000 штук",
            Self::Set => "комплект",
            Self::ManHour => "человеко-час",
            Self::MachineHour => "машино-час",
            Self::Shift => "смена",
            Self::ConnectionPoint => "точка присоединения",
            Self::SwitchSocket => "выключатель/розетка",
            Self::Node => "узел",
            Self::Place => "место",
            Self::Opening => "проём",
            Self::Element => "элемент",
            Self::Other(s) => s,
        }
    }

    /// Parse from string (Russian abbreviation)
    pub fn from_str_ru(s: &str) -> Option<Self> {
        let s = s.trim().to_lowercase();
        match s.as_str() {
            "м" | "м." => Some(Self::Meter),
            "км" | "км." => Some(Self::Kilometer),
            "п.м" | "п.м." | "пм" => Some(Self::LinearMeter),
            "100 п.м" | "100 п.м." | "100пм" => Some(Self::LinearMeter100),
            "м²" | "м2" | "кв.м" | "кв.м." | "кв м" => Some(Self::SquareMeter),
            "100 м²" | "100 м2" | "100 кв.м" | "100кв.м" => Some(Self::SquareMeter100),
            "1000 м²" | "1000 м2" | "1000 кв.м" => Some(Self::SquareMeter1000),
            "га" => Some(Self::Hectare),
            "м³" | "м3" | "куб.м" | "куб.м." | "куб м" => Some(Self::CubicMeter),
            "100 м³" | "100 м3" | "100 куб.м" => Some(Self::CubicMeter100),
            "1000 м³" | "1000 м3" | "1000 куб.м" => Some(Self::CubicMeter1000),
            "л" | "л." | "литр" => Some(Self::Liter),
            "кг" | "кг." => Some(Self::Kilogram),
            "т" | "т." | "тн" | "тонна" => Some(Self::Ton),
            "100 кг" | "100кг" => Some(Self::Kilogram100),
            "шт" | "шт." | "штука" => Some(Self::Unit),
            "10 шт" | "10шт" => Some(Self::Unit10),
            "100 шт" | "100шт" => Some(Self::Unit100),
            "1000 шт" | "1000шт" => Some(Self::Unit1000),
            "компл" | "компл." | "комплект" => Some(Self::Set),
            "чел-ч" | "чел.ч" | "чел-час" | "человеко-час" => Some(Self::ManHour),
            "маш-ч" | "маш.ч" | "маш-час" | "машино-час" => Some(Self::MachineHour),
            "см" | "см." | "смена" => Some(Self::Shift),
            "точка" => Some(Self::ConnectionPoint),
            "узел" => Some(Self::Node),
            "место" => Some(Self::Place),
            "проём" | "проем" => Some(Self::Opening),
            "элем" | "элем." | "элемент" => Some(Self::Element),
            _ => None,
        }
    }

    /// Get the multiplication factor (e.g., 100 for "100 м²")
    pub fn factor(&self) -> f64 {
        match self {
            Self::LinearMeter100 => 100.0,
            Self::SquareMeter100 => 100.0,
            Self::SquareMeter1000 => 1000.0,
            Self::CubicMeter100 => 100.0,
            Self::CubicMeter1000 => 1000.0,
            Self::Kilogram100 => 100.0,
            Self::Unit10 => 10.0,
            Self::Unit100 => 100.0,
            Self::Unit1000 => 1000.0,
            _ => 1.0,
        }
    }

    /// Check if this is an area unit
    pub fn is_area(&self) -> bool {
        matches!(
            self,
            Self::SquareMeter | Self::SquareMeter100 | Self::SquareMeter1000 | Self::Hectare
        )
    }

    /// Check if this is a volume unit
    pub fn is_volume(&self) -> bool {
        matches!(
            self,
            Self::CubicMeter | Self::CubicMeter100 | Self::CubicMeter1000 | Self::Liter
        )
    }

    /// Check if this is a time/labor unit
    pub fn is_time(&self) -> bool {
        matches!(self, Self::ManHour | Self::MachineHour | Self::Shift)
    }
}

impl Default for MeasureUnit {
    fn default() -> Self {
        Self::Unit
    }
}

impl fmt::Display for MeasureUnit {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.abbreviation())
    }
}

impl From<&str> for MeasureUnit {
    fn from(s: &str) -> Self {
        Self::from_str_ru(s).unwrap_or(Self::Other(s.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_units() {
        assert_eq!(MeasureUnit::from_str_ru("м²"), Some(MeasureUnit::SquareMeter));
        assert_eq!(MeasureUnit::from_str_ru("100 м²"), Some(MeasureUnit::SquareMeter100));
        assert_eq!(MeasureUnit::from_str_ru("м³"), Some(MeasureUnit::CubicMeter));
        assert_eq!(MeasureUnit::from_str_ru("т"), Some(MeasureUnit::Ton));
        assert_eq!(MeasureUnit::from_str_ru("чел-ч"), Some(MeasureUnit::ManHour));
    }

    #[test]
    fn test_unit_display() {
        assert_eq!(MeasureUnit::SquareMeter100.to_string(), "100 м²");
        assert_eq!(MeasureUnit::CubicMeter.to_string(), "м³");
    }

    #[test]
    fn test_factor() {
        assert_eq!(MeasureUnit::SquareMeter100.factor(), 100.0);
        assert_eq!(MeasureUnit::SquareMeter.factor(), 1.0);
    }
}
