import { getAccessToken } from "./firebase";
import { AppState } from "./AppContext";

const SPREADSHEET_ID_KEY = "fallback_spreadsheet_id";

export const getOrCreateSpreadsheet = async (): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  let id = localStorage.getItem(SPREADSHEET_ID_KEY);
  if (id) return id;

  try {
    const query = encodeURIComponent("name='Firebase Fallback Data Backup' and trashed=false");
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      id = searchData.files[0].id;
      localStorage.setItem(SPREADSHEET_ID_KEY, id);
      return id;
    }
  } catch (e) {
    console.warn("Error searching Drive for existing backup:", e);
  }

  try {
    const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: "Firebase Fallback Data Backup",
        },
      }),
    });
    if (!res.ok) {
      console.error("Failed to create spreadsheet", await res.text());
      return null;
    }
    const data = await res.json();
    id = data.spreadsheetId;
    if (id) {
      localStorage.setItem(SPREADSHEET_ID_KEY, id);
      return id;
    }
  } catch (e) {
    console.error("Error creating spreadsheet", e);
  }
  return null;
};

export const syncToSheets = async (state: AppState) => {
  const token = await getAccessToken();
  if (!token) throw new Error("No access token");

  const id = await getOrCreateSpreadsheet();
  if (!id) throw new Error("Failed to get or create spreadsheet");

  const allData = [
    ["collection", "id", "data"],
    ...state.businesses.map((b: any) => ["businesses", b.id, JSON.stringify(b)]),
    ...state.investors.map((i: any) => ["investors", i.id, JSON.stringify(i)]),
    ...state.investments.map((i: any) => ["investments", i.id, JSON.stringify(i)]),
    ...state.users.map((u: any) => ["users", u.id, JSON.stringify(u)]),
    ["settings", "global", JSON.stringify(state.settings)]
  ];

  try {
    // We can clear first or just overwrite. A simple approach is just update the range
    // but to be safe against stale data we can clear first, then write.
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Sheet1!A1:C:clear`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Sheet1!A1?valueInputOption=RAW`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: allData,
      }),
    });
  } catch (e) {
    console.error("Failed to sync to sheets", e);
    throw e;
  }
};

export const fetchFromSheets = async (): Promise<Partial<AppState> | null> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Cannot fetch from sheets, no access token");
  }

  const id = await getOrCreateSpreadsheet();
  if (!id) throw new Error("Failed to get or create spreadsheet");

  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Sheet1!A2:C`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to read from sheets: ${await res.text()}`);
    }
    const result = await res.json();
    const rows = result.values || [];
    
    const businesses: any[] = [];
    const investors: any[] = [];
    const investments: any[] = [];
    const users: any[] = [];
    let settings: any = null;
    
    for (const row of rows) {
      if (row.length < 3) continue;
      const [collection, docId, dataStr] = row;
      try {
        const data = JSON.parse(dataStr);
        if (collection === "businesses") businesses.push(data);
        else if (collection === "investors") investors.push(data);
        else if (collection === "investments") investments.push(data);
        else if (collection === "users") users.push(data);
        else if (collection === "settings") settings = data;
      } catch(e) {}
    }
    
    return { businesses, investors, investments, users, settings };
  } catch (e) {
    console.error("Failed to fetch from sheets", e);
    throw e;
  }
};
