import fs from "fs";
import path from "path";
import csvParse from "csv-parse/lib/sync";
import XLSX from "xlsx";

export async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let rows = [];

  if (ext === ".csv") {
    const content = fs.readFileSync(filePath, "utf-8");
    rows = csvParse(content, { columns: true, skip_empty_lines: true });
  } else if (ext === ".xlsx") {
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  } else {
    throw new Error("Unsupported file type");
  }

  const categories = [...new Set(rows.map(r => r.category))];
  return { categories, questions: rows };
}

