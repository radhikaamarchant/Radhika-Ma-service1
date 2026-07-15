const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBTxYk3BAvRbcaSQlhNVas1vWoR33Rj1DiirE2fLvpsqhGg4CuaQ9ax5aGt4PUtt9f/exec";

export const fetchFromAppsScript = async () => {
  if (!SCRIPT_URL) {
    console.warn("Apps Script URL is not set");
    return null;
  }
  
  try {
    const res = await fetch(SCRIPT_URL);
    if (!res.ok) throw new Error("Failed to fetch from Apps Script");
    const data = await res.json();
    
    return {
      businesses: data.businesses || [],
      investors: data.investors || [],
      investments: data.investments || [],
      users: data.users || [],
      settings: data.settings || null
    };
  } catch (error) {
    console.warn("Apps Script fetch error:", error);
    throw error;
  }
};

export const syncToAppsScript = async (action: 'ADD' | 'UPDATE' | 'DELETE', collection: string, id: string, data?: any) => {
  if (!SCRIPT_URL) return;
  
  try {
    // Fire and forget, no need to await and block
    fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain", // Text/plain avoids CORS preflight OPTIONS request
      },
      body: JSON.stringify({ action, collection, id, data })
    }).catch(e => console.warn("Apps script sync error", e));
  } catch (error) {
    console.warn("Apps Script post error:", error);
  }
};
