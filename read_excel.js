const XLSX = require('xlsx');

const filePath = '/Users/ali/Documents/ideas/one/metrics.xlsm';
const workbook = XLSX.readFile(filePath);

// Print all sheet names
console.log("=== All Sheets ===");
console.log(workbook.SheetNames);

// Read each sheet completely
workbook.SheetNames.forEach(name => {
    console.log(`\n\n========== Sheet: ${name} ==========`);
    const s = workbook.Sheets[name];
    const d = XLSX.utils.sheet_to_json(s, { header: 1 });
    // Print all rows
    d.forEach((row, idx) => {
        if (row && row.length > 0) {
            console.log(`Row ${idx}: ${JSON.stringify(row)}`);
        }
    });
});
