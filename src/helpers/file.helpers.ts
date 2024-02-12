import fs from "fs";
import path from "path";
import { PDFExtract, PDFExtractOptions } from "pdf.js-extract";

const tempDirectory = path.resolve(__dirname, "../tmp/");

export const generateRandomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
export const folderGuard = () => {
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
  }
};
export const extractTextFromPdf = async (filename: string) => {
  const pdfExtract = new PDFExtract();
  const options: PDFExtractOptions = {}; /* see below */
  const data = await pdfExtract.extract(
    path.resolve(tempDirectory, filename),
    options
  );
  let rawText = "";
  for (const page of data.pages) {
    for (const content of page.content) {
      rawText += content.str + " ";
    }
  }
  return rawText;
};
export const deleteFile = async (filename: string) => {
  console.log("deleting : " + path.resolve(tempDirectory, filename));
  fs.unlinkSync(path.resolve(tempDirectory, filename));
};
