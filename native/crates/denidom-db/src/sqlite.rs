//! SQLite Database Backend

use rusqlite::{Connection, Result};

pub struct Database {
    conn: Connection,
}

impl Database {
    /// Open or create a SQLite database
    pub fn open(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        Ok(Self { conn })
    }

    /// Open an in-memory database (for testing)
    pub fn open_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        Ok(Self { conn })
    }

    /// Run database migrations
    pub fn migrate(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS estimates (
                id TEXT PRIMARY KEY,
                number TEXT NOT NULL,
                name TEXT NOT NULL,
                object TEXT,
                status TEXT NOT NULL DEFAULT 'draft',
                data TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS normatives (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                unit TEXT NOT NULL,
                base_type TEXT NOT NULL,
                direct_cost REAL NOT NULL DEFAULT 0,
                labor_cost REAL NOT NULL DEFAULT 0,
                machine_op_cost REAL NOT NULL DEFAULT 0,
                material_cost REAL NOT NULL DEFAULT 0,
                machine_cost REAL NOT NULL DEFAULT 0,
                labor_norm REAL NOT NULL DEFAULT 0,
                machine_norm REAL NOT NULL DEFAULT 0,
                section TEXT,
                notes TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_normatives_code ON normatives(code);
            CREATE INDEX IF NOT EXISTS idx_normatives_base_type ON normatives(base_type);
            "
        )?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_in_memory() {
        let db = Database::open_in_memory().unwrap();
        db.migrate().unwrap();
    }
}
