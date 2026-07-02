import { google } from "googleapis";
import fs from "fs";
import path from "path";

const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

async function test() {
  try {
    const res = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: "Firebase Fallback Data",
        },
      },
    });
    console.log("Spreadsheet ID:", res.data.spreadsheetId);
    fs.writeFileSync(path.join(process.cwd(), ".spreadsheet_id"), res.data.spreadsheetId || "");
  } catch (e) {
    console.error("Failed to create spreadsheet:", e);
  }
}

test();
