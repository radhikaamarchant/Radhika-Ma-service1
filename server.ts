import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

let SPREADSHEET_ID = ""; // We will need to store this somewhere or create it once.

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// We need a way to initialize or get the spreadsheet ID. We can use a local file for now.
import fs from "fs";
const SPREADSHEET_ID_FILE = path.join(process.cwd(), ".spreadsheet_id");

async function getSpreadsheetId() {
  if (SPREADSHEET_ID) return SPREADSHEET_ID;
  if (fs.existsSync(SPREADSHEET_ID_FILE)) {
    SPREADSHEET_ID = fs.readFileSync(SPREADSHEET_ID_FILE, "utf-8");
    return SPREADSHEET_ID;
  }
  
  // Create a new spreadsheet
  try {
    const res = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: "Firebase Fallback Data",
        },
      },
    });
    SPREADSHEET_ID = res.data.spreadsheetId || "";
    fs.writeFileSync(SPREADSHEET_ID_FILE, SPREADSHEET_ID);
    return SPREADSHEET_ID;
  } catch (e) {
    console.error("Error creating spreadsheet", e);
    throw e;
  }
}

app.post("/api/sheets/sync", async (req, res) => {
  try {
    const id = await getSpreadsheetId();
    const { businesses, investors, investments, settings } = req.body;
    
    // Convert to 2D arrays
    const businessesData = [
      ["id", "data"],
      ...businesses.map((b: any) => [b.id, JSON.stringify(b)])
    ];
    
    const investorsData = [
      ["id", "data"],
      ...investors.map((i: any) => [i.id, JSON.stringify(i)])
    ];
    
    const investmentsData = [
      ["id", "data"],
      ...investments.map((i: any) => [i.id, JSON.stringify(i)])
    ];
    
    const settingsData = [
      ["id", "data"],
      ["global", JSON.stringify(settings)]
    ];
    
    // Clear and update each sheet (we can just use Sheet1, Sheet2, etc., but better to create them or just put everything in one sheet with different ranges, or clear and write)
    // Actually, writing JSON strings to a single sheet with structure:
    // Collection, ID, JSONData
    const allData = [
      ["collection", "id", "data"],
      ...businesses.map((b: any) => ["businesses", b.id, JSON.stringify(b)]),
      ...investors.map((i: any) => ["investors", i.id, JSON.stringify(i)]),
      ...investments.map((i: any) => ["investments", i.id, JSON.stringify(i)]),
      ["settings", "global", JSON.stringify(settings)]
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: allData
      }
    });
    
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/sheets", async (req, res) => {
  try {
    const id = await getSpreadsheetId();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: "Sheet1!A2:C",
    });
    
    const rows = result.data.values || [];
    const businesses: any[] = [];
    const investors: any[] = [];
    const investments: any[] = [];
    let settings: any = null;
    
    for (const row of rows) {
      if (row.length < 3) continue;
      const [collection, docId, dataStr] = row;
      try {
        const data = JSON.parse(dataStr);
        if (collection === "businesses") businesses.push(data);
        else if (collection === "investors") investors.push(data);
        else if (collection === "investments") investments.push(data);
        else if (collection === "settings") settings = data;
      } catch(e) {}
    }
    
    res.json({ businesses, investors, investments, settings });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
