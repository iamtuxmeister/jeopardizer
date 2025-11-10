import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import XLSX from "xlsx";

export async function parseFile(file) {
  // file can be PersistentFile from Formidable
  const ext = (file.originalFilename ? path.extname(file.originalFilename) : "").toLowerCase();

  let rows = [];
  if (ext === ".csv") {
    const content = fs.readFileSync(file.filepath, "utf-8");
    rows = parse(content, { columns: true, skip_empty_lines: true });
  } else if (ext === ".xlsx") {
    const wb = XLSX.readFile(file.filepath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  } else {
    throw new Error("Unsupported file type: " + ext);
  }

  const categories = [...new Set(rows.map(r => r.category))];
  return { categories, questions: rows };
}

