import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { parseFile } from "../utils/parseFile.js";
import { generateJeopardyPPTX } from "../utils/pptEditor.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("File parsing error");
      return;
    }

    try {
      const file = files.file;
      const filePath = file.filepath || file.path;

      const { categories, questions } = await parseFile(filePath);
      const buffer = await generateJeopardyPPTX({ categories, questions });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=jeopardy_generated.pptx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      );
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing PPTX: " + error.message);
    }
  });
}

