export {}

// Menü létrehozása
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-smart-marks",
    title: "Save to Smart Marks",
    contexts: ["selection"]
  });
});

// Mentés funkció direkt HTTP kéréssel (nem kell SDK!)
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "save-to-smart-marks" && info.selectionText) {
    
    // IDE ÍRD BE A SAJÁT ADATAIDAT
    const SUPABASE_URL = "https://your-project.supabase.co"
    const SUPABASE_KEY = "your-anon-key"

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          content: info.selectionText
        })
      })
      console.log("Mentés sikeres!");
    } catch (err) {
      console.error("Hiba történt:", err);
    }
  }
});