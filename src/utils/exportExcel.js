import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the Excel file (without extension)
 * @param {string} sheetName - Name of the worksheet
 */
export function exportToExcel(data, filename = 'export', sheetName = 'Sheet1') {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-size columns
    const maxWidths = {};
    const keys = Object.keys(data[0]);

    keys.forEach(key => {
        maxWidths[key] = key.length;
    });

    data.forEach(row => {
        keys.forEach(key => {
            const value = row[key] ? String(row[key]) : '';
            maxWidths[key] = Math.max(maxWidths[key], value.length);
        });
    });

    worksheet['!cols'] = keys.map(key => ({ wch: Math.min(maxWidths[key] + 2, 50) }));

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${date}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, fullFilename);
}

/**
 * Export table element to Excel
 * @param {string} tableId - ID of the HTML table element
 * @param {string} filename - Name of the Excel file
 */
export function exportTableToExcel(tableId, filename = 'export') {
    const table = document.getElementById(tableId);
    if (!table) {
        console.warn('Table not found');
        return;
    }

    const workbook = XLSX.utils.table_to_book(table);
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
}
