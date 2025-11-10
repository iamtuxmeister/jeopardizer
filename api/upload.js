import formidable from "formidable";
import { parseFile } from "../utils/parseFile.js";
import { generateJeopardyPPTX } from "../utils/pptEditor.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable parse error:", err);
      res.status(500).send("File parsing error");
      return;
    }

    // FIX: handle array of files
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = uploadedFile?.filepath;

    if (!filePath) {
      console.log("No file uploaded, files object:", files);
      return res.status(400).send("No file uploaded");
    }

    console.log("File uploaded successfully:", uploadedFile.originalFilename);

    try {
      const { categories, questions } = await parseFile(uploadedFile);
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
      console.error("Error generating PPTX:", error);
      res.status(500).send("Error generating PPTX: " + (error.message || error.toString()));
    }
  });
}
