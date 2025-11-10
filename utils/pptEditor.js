import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function generateJeopardyPPTX({ categories, questions }) {
  const templatePath = path.resolve("ppt/jeopardy_template.pptx");
  const content = fs.readFileSync(templatePath);

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  const data = {};
  categories.forEach((cat, i) => { data[`CATEGORY_${i + 1}`] = cat; });
  questions.forEach(q => {
    const catIndex = categories.indexOf(q.category) + 1;
    data[`Q${catIndex}_${q.value}`] = q.question;
    data[`A${catIndex}_${q.value}`] = q.answer;
  });

  doc.render(data);

  // Replace notes placeholders
  const notesKeys = Object.keys(data);
  const notesSlideFiles = Object.keys(zip.files).filter(f => f.startsWith("ppt/notesSlides/notesSlide"));
  notesSlideFiles.forEach(fileName => {
    const xml = zip.files[fileName].asText();
    let newXml = xml;
    notesKeys.forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      newXml = newXml.replace(regex, data[key]);
    });
    zip.file(fileName, newXml);
  });

  return doc.getZip().generate({ type: "nodebuffer" });
}

