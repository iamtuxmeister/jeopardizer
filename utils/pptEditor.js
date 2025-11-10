import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function generateJeopardyPPTX({ categories, questions }) {
  console.log("Generating PPTX...");
  const templatePath = path.resolve("ppt/jeopardy_template.pptx");

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template PPTX not found at " + templatePath);
  }

  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  const data = {};
  categories.forEach((cat, i) => {
    data[`CATEGORY_${i + 1}`] = cat;
  });

  questions.forEach(q => {
    const catIndex = categories.indexOf(q.category) + 1;
    if (catIndex <= 0) {
      console.warn("Unknown category:", q.category);
    }
    data[`Q${catIndex}_${q.value}`] = q.question;
    data[`A${catIndex}_${q.value}`] = q.answer;
  });

  console.log("Data prepared for Docxtemplater:", data);

  try {
    doc.render(data);
  } catch (error) {
    console.error("Docxtemplater render error:", error);
    throw error;
  }

  // Notes replacement
  const notesKeys = Object.keys(data);
  const notesSlideFiles = Object.keys(zip.files).filter(f =>
    f.startsWith("ppt/notesSlides/notesSlide")
  );

  console.log("Notes slides found:", notesSlideFiles.length);

  notesSlideFiles.forEach(fileName => {
    let xml = zip.files[fileName].asText();
    notesKeys.forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      xml = xml.replace(regex, data[key]);
    });
    zip.file(fileName, xml);
  });

  console.log("PPTX generation complete");
  return doc.getZip().generate({ type: "nodebuffer" });
}
