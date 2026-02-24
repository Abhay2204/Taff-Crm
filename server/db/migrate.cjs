const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'crm.db'));
db.pragma('foreign_keys = ON');

console.log('🔄 Running database migration...');

// Helper to check if column exists
function columnExists(table, column) {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
    return info.some(col => col.name === column);
}

// Helper to check if table exists
function tableExists(table) {
    const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
    return !!result;
}

// Add taluka column to prospects
if (!columnExists('prospects', 'taluka')) {
    db.exec('ALTER TABLE prospects ADD COLUMN taluka TEXT');
    console.log('✅ Added taluka column to prospects');
} else {
    console.log('⏭️  taluka column already exists');
}

// Add delivery_date column to prospects
if (!columnExists('prospects', 'delivery_date')) {
    db.exec('ALTER TABLE prospects ADD COLUMN delivery_date DATE');
    console.log('✅ Added delivery_date column to prospects');
} else {
    console.log('⏭️  delivery_date column already exists');
}

// Create services table
if (!tableExists('services')) {
    db.exec(`
    CREATE TABLE services (
      id TEXT PRIMARY KEY,
      prospect_id TEXT NOT NULL,
      vehicle_model TEXT,
      customer_name TEXT NOT NULL,
      customer_mobile TEXT,
      taluka TEXT,
      delivery_date DATE NOT NULL,
      service_month TEXT NOT NULL,
      service_date DATE NOT NULL,
      status TEXT DEFAULT 'Pending',
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prospect_id) REFERENCES prospects(id)
    )
  `);
    console.log('✅ Created services table');
} else {
    console.log('⏭️  services table already exists');
}

// Create indexes
try { db.exec('CREATE INDEX IF NOT EXISTS idx_prospects_taluka ON prospects(taluka)'); } catch (e) { }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_services_date ON services(service_date)'); } catch (e) { }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_services_status ON services(status)'); } catch (e) { }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_services_prospect ON services(prospect_id)'); } catch (e) { }

console.log('✅ Database migration complete!');
db.close();
