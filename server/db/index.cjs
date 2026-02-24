const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'crm.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'salesperson',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Prospects table
  CREATE TABLE IF NOT EXISTS prospects (
    id TEXT PRIMARY KEY,
    ref_no TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    mobile TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    taluka TEXT,
    source TEXT,
    vehicle_type TEXT,
    model TEXT,
    budget TEXT,
    status TEXT DEFAULT 'New',
    salesperson_id TEXT,
    remarks TEXT,
    delivery_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salesperson_id) REFERENCES users(id)
  );

  -- Follow-ups table
  CREATE TABLE IF NOT EXISTS follow_ups (
    id TEXT PRIMARY KEY,
    prospect_id TEXT NOT NULL,
    follow_up_type TEXT NOT NULL,
    follow_up_date DATE NOT NULL,
    follow_up_time TIME,
    status TEXT DEFAULT 'Pending',
    outcome TEXT,
    next_follow_up_date DATE,
    remarks TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES prospects(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  -- Services table (auto-generated when vehicle is delivered)
  CREATE TABLE IF NOT EXISTS services (
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
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
  CREATE INDEX IF NOT EXISTS idx_prospects_created ON prospects(created_at);
  CREATE INDEX IF NOT EXISTS idx_prospects_salesperson ON prospects(salesperson_id);
  CREATE INDEX IF NOT EXISTS idx_prospects_taluka ON prospects(taluka);
  CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON follow_ups(follow_up_date);
  CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);
  CREATE INDEX IF NOT EXISTS idx_follow_ups_prospect ON follow_ups(prospect_id);
  CREATE INDEX IF NOT EXISTS idx_services_date ON services(service_date);
  CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
  CREATE INDEX IF NOT EXISTS idx_services_prospect ON services(prospect_id);
`);

module.exports = db;
