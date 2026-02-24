/**
 * Data Backup Script - 3 Layer Backup System
 * 
 * Backup 1: MongoDB Atlas (primary - always in sync)
 * Backup 2: Local SQLite database (synced from MongoDB)
 * Backup 3: Excel files per collection (human-readable backup)
 * 
 * Usage: node server/scripts/backup.cjs
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const mongoose = require('mongoose');

const { connectDB } = require('../db/mongodb.cjs');
const User = require('../models/User.cjs');
const Prospect = require('../models/Prospect.cjs');
const FollowUp = require('../models/FollowUp.cjs');
const Service = require('../models/Service.cjs');

const BACKUP_DIR = path.join(__dirname, '../../backups');
const EXCEL_DIR = path.join(BACKUP_DIR, 'excel');
const SQLITE_DIR = path.join(BACKUP_DIR, 'sqlite');

async function createBackup() {
    try {
        // Ensure backup directories exist
        [BACKUP_DIR, EXCEL_DIR, SQLITE_DIR].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        await connectDB();
        console.log('🔄 Starting 3-layer backup...\n');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

        // ========== BACKUP 2: SQLite ==========
        console.log('📦 Backup 2: Syncing to local SQLite...');
        try {
            const Database = require('better-sqlite3');
            const dbPath = path.join(SQLITE_DIR, `backup_${timestamp}.db`);
            const db = new Database(dbPath);

            // Create tables
            db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY, email TEXT, name TEXT, role TEXT, created_at TEXT
                );
                CREATE TABLE IF NOT EXISTS prospects (
                    id TEXT PRIMARY KEY, ref_no TEXT, first_name TEXT, last_name TEXT,
                    mobile TEXT, email TEXT, address TEXT, city TEXT, taluka TEXT,
                    source TEXT, model TEXT, vehicle_type TEXT, budget TEXT,
                    status TEXT, salesperson_id TEXT, delivery_date TEXT, remarks TEXT,
                    created_at TEXT, updated_at TEXT
                );
                CREATE TABLE IF NOT EXISTS follow_ups (
                    id TEXT PRIMARY KEY, prospect_id TEXT, follow_up_type TEXT,
                    follow_up_date TEXT, follow_up_time TEXT, status TEXT,
                    outcome TEXT, next_follow_up_date TEXT, remarks TEXT,
                    created_by TEXT, created_at TEXT
                );
                CREATE TABLE IF NOT EXISTS services (
                    id TEXT PRIMARY KEY, prospect_id TEXT, vehicle_model TEXT,
                    customer_name TEXT, customer_mobile TEXT, taluka TEXT,
                    delivery_date TEXT, service_month TEXT, service_date TEXT,
                    status TEXT, remarks TEXT, created_at TEXT, updated_at TEXT
                );
            `);

            // Fetch all data from MongoDB
            const [users, prospects, followUps, services] = await Promise.all([
                User.find().lean(),
                Prospect.find().lean(),
                FollowUp.find().lean(),
                Service.find().lean(),
            ]);

            // Insert into SQLite
            const insertUser = db.prepare('INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?)');
            const insertProspect = db.prepare('INSERT OR REPLACE INTO prospects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            const insertFollowUp = db.prepare('INSERT OR REPLACE INTO follow_ups VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            const insertService = db.prepare('INSERT OR REPLACE INTO services VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

            const syncData = db.transaction(() => {
                users.forEach(u => insertUser.run(u._id, u.email, u.name, u.role, u.created_at?.toISOString?.() || ''));
                prospects.forEach(p => insertProspect.run(
                    p._id, p.ref_no, p.first_name, p.last_name, p.mobile, p.email,
                    p.address, p.city, p.taluka, p.source, p.model, p.vehicle_type,
                    p.budget, p.status, p.salesperson_id, p.delivery_date, p.remarks,
                    p.created_at?.toISOString?.() || '', p.updated_at?.toISOString?.() || ''
                ));
                followUps.forEach(f => insertFollowUp.run(
                    f._id, f.prospect_id, f.follow_up_type, f.follow_up_date,
                    f.follow_up_time, f.status, f.outcome, f.next_follow_up_date,
                    f.remarks, f.created_by, f.created_at?.toISOString?.() || ''
                ));
                services.forEach(s => insertService.run(
                    s._id, s.prospect_id, s.vehicle_model, s.customer_name,
                    s.customer_mobile, s.taluka, s.delivery_date, s.service_month,
                    s.service_date, s.status, s.remarks,
                    s.created_at?.toISOString?.() || '', s.updated_at?.toISOString?.() || ''
                ));
            });

            syncData();
            db.close();
            console.log(`   ✅ SQLite backup: ${dbPath}`);
            console.log(`      Users: ${users.length}, Prospects: ${prospects.length}, Follow-ups: ${followUps.length}, Services: ${services.length}`);
        } catch (sqliteError) {
            console.log(`   ⚠️  SQLite backup skipped (better-sqlite3 may not be installed): ${sqliteError.message}`);
        }

        // ========== BACKUP 3: Excel Files ==========
        console.log('\n📊 Backup 3: Creating Excel files...');

        const [users, prospects, followUps, services] = await Promise.all([
            User.find().lean(),
            Prospect.find().lean(),
            FollowUp.find().lean(),
            Service.find().lean(),
        ]);

        // Users Excel
        const usersData = users.map(u => ({
            'ID': u._id,
            'Email': u.email,
            'Name': u.name,
            'Role': u.role,
            'Created': u.created_at?.toISOString?.() || '',
        }));
        writeExcel(usersData, path.join(EXCEL_DIR, `Users_${timestamp}.xlsx`), 'Users');

        // Prospects Excel
        const prospectsData = prospects.map(p => ({
            'Ref No': p.ref_no,
            'First Name': p.first_name,
            'Last Name': p.last_name,
            'Mobile': p.mobile,
            'Email': p.email,
            'City': p.city,
            'Taluka': p.taluka,
            'Source': p.source,
            'Vehicle Model': p.model,
            'Budget': p.budget,
            'Status': p.status,
            'Delivery Date': p.delivery_date,
            'Remarks': p.remarks,
            'Created': p.created_at?.toISOString?.() || '',
        }));
        writeExcel(prospectsData, path.join(EXCEL_DIR, `Prospects_${timestamp}.xlsx`), 'Prospects');

        // Follow-Ups Excel
        const followUpsData = followUps.map(f => ({
            'ID': f._id,
            'Prospect ID': f.prospect_id,
            'Type': f.follow_up_type,
            'Date': f.follow_up_date,
            'Time': f.follow_up_time,
            'Status': f.status,
            'Outcome': f.outcome,
            'Next Follow-Up': f.next_follow_up_date,
            'Remarks': f.remarks,
            'Created': f.created_at?.toISOString?.() || '',
        }));
        writeExcel(followUpsData, path.join(EXCEL_DIR, `FollowUps_${timestamp}.xlsx`), 'FollowUps');

        // Services Excel
        const servicesData = services.map(s => ({
            'Customer': s.customer_name,
            'Mobile': s.customer_mobile,
            'Vehicle': s.vehicle_model,
            'Taluka': s.taluka,
            'Delivery Date': s.delivery_date,
            'Service Month': s.service_month,
            'Service Date': s.service_date,
            'Status': s.status,
            'Remarks': s.remarks,
        }));
        writeExcel(servicesData, path.join(EXCEL_DIR, `Services_${timestamp}.xlsx`), 'Services');

        console.log(`   ✅ Excel files saved to: ${EXCEL_DIR}`);

        // Cleanup old backups (keep last 5)
        cleanupOldBackups(EXCEL_DIR, 5);
        cleanupOldBackups(SQLITE_DIR, 5);

        console.log('\n🎉 All 3 backups completed!');
        console.log('   1️⃣  MongoDB Atlas: Always in sync (primary)');
        console.log('   2️⃣  Local SQLite: Snapshot saved');
        console.log('   3️⃣  Excel files: Exported per collection');

        process.exit(0);
    } catch (error) {
        console.error('❌ Backup error:', error.message);
        process.exit(1);
    }
}

function writeExcel(data, filePath, sheetName) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filePath);
}

function cleanupOldBackups(dir, keepCount) {
    try {
        const files = fs.readdirSync(dir)
            .map(f => ({ name: f, path: path.join(dir, f), time: fs.statSync(path.join(dir, f)).mtime }))
            .sort((a, b) => b.time - a.time);

        if (files.length > keepCount * 4) { // 4 files per backup (users, prospects, followups, services)
            const toDelete = files.slice(keepCount * 4);
            toDelete.forEach(f => fs.unlinkSync(f.path));
            if (toDelete.length > 0) {
                console.log(`   🧹 Cleaned up ${toDelete.length} old backup files from ${path.basename(dir)}`);
            }
        }
    } catch (e) {
        // Ignore cleanup errors
    }
}

createBackup();
