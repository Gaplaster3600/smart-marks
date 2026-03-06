import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

function IndexPopup() {
  const [note, setNote] = useState("")
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState([]) 
  const [showList, setShowList] = useState(false) 
  const [summaries, setSummaries] = useState<{[key: string]: string}>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 1. Jegyzetek lekérése az adatbázisból
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error(error)
    else setNotes(data)
  }

  // 2. Automatikus szövegbeillesztés az oldalról megnyitáskor
  useEffect(() => {
    fetchNotes()
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => window.getSelection().toString()
        }, (results) => {
          if (results && results[0].result) {
            setNote(results[0].result)
          }
        })
      }
    })
  }, [])

  // 3. Jegyzet mentése
  const saveNote = async () => {
    if (!note) return;
    setStatus("Saving...")

    const { data, error } = await supabase
      .from('notes')
      .insert([{ content: note }])

    if (error) {
      console.error(error)
      setStatus("Error! ❌")
    } else {
      setNote("")
      setStatus("Saved! ✅")
      fetchNotes() // Frissítjük a listát mentés után
      setTimeout(() => setStatus(""), 2000)
    }
  }

  // 4. Jegyzet törlése
  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
  
    if (error) console.error(error)
    else fetchNotes()
  }

  // 5. AI Összefoglaló készítése (Hugging Face - Ingyenes verzió)
  const summarizeNote = async (id: string, text: string) => {
    setLoadingId(id);
    try {
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Brutálisan okos és gyors modell
          messages: [
            {
              role: "system",
              content: "Te egy segítőkész magyar asszisztens vagy. Foglald össze a szöveget maximum 15 szóban, magyarul."
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 100
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Hiba a Groq API hívásban");
      }

      const summaryText = data.choices[0].message.content;
      setSummaries(prev => ({ ...prev, [id]: summaryText }));

    } catch (error: any) {
      console.error("Groq hiba:", error);
      alert("AI Hiba: " + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{
      width: "300px", backgroundColor: "#0f172a", color: "white",
      padding: "20px", display: "flex", flexDirection: "column", gap: "16px",
      fontFamily: "sans-serif", minHeight: "350px"
    }}>
      {/* Fejléc */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#3b82f6", margin: "0" }}>
          Smart Marks
        </h1>
        <button 
          onClick={() => setShowList(!showList)}
          style={{ background: "none", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: "4px", cursor: "pointer", fontSize: "10px", padding: "4px 8px" }}
        >
          {showList ? "← Back" : "View All"}
        </button>
      </div>

      {!showList ? (
        /* MENTÉS NÉZET */
        <>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Select text on page..."
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #1e293b", backgroundColor: "#1e293b", color: "white", minHeight: "150px", resize: "none" }}
          />
          <button onClick={saveNote} style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            {status || "Save Selection"}
          </button>
        </>
      ) : (
/* LISTA NÉZET - ÚJ, JAVÍTOTT DESIGN */
<div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "400px", paddingRight: "5px" }}>
{notes.length === 0 ? <p style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center" }}>No notes yet.</p> : null}
{notes.map((n) => (
  <div key={n.id} style={{ 
    backgroundColor: "#1e293b", padding: "14px", borderRadius: "12px", 
    position: "relative", fontSize: "13px", border: "1px solid #334155",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  }}>
    {/* Dátum és Idő kis ikonnal */}
    <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
      <span>📅</span>
      {new Date(n.created_at).toLocaleDateString('hu-HU')} {new Date(n.created_at).toLocaleTimeString('hu-HU', {hour: '2-digit', minute:'2-digit'})}
    </div>
    
    {/* Jegyzet szövege, jobb olvashatósággal */}
    <p style={{ margin: "0 25px 8px 0", lineHeight: "1.6", color: "#f1f5f9", wordBreak: "break-word" }}>
      {n.content}
    </p>

    {/* AI Összefoglaló modern buborékban */}
    <div style={{ marginTop: "12px" }}>
      {summaries[n.id] ? (
        <div style={{ 
          backgroundColor: "rgba(59, 130, 246, 0.1)", 
          padding: "10px", 
          borderRadius: "8px", 
          borderLeft: "3px solid #3b82f6"
        }}>
          <p style={{ margin: "0", fontSize: "12px", color: "#93c5fd", lineHeight: "1.4" }}>
            <span style={{ marginRight: "6px" }}>✨</span>
            {summaries[n.id]}
          </p>
        </div>
      ) : (
        <button 
          onClick={() => summarizeNote(n.id, n.content)}
          disabled={loadingId === n.id}
          style={{ 
            background: loadingId === n.id ? "transparent" : "rgba(59, 130, 246, 0.1)", 
            border: "1px solid #3b82f6", 
            color: "#3b82f6", 
            fontSize: "11px", 
            cursor: loadingId === n.id ? "default" : "pointer", 
            padding: "6px 12px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.2s"
          }}
        >
          {loadingId === n.id ? "⏳ Thinking..." : "✨ AI Summary"}
        </button>
      )}
    </div>

    {/* Tisztább törlés gomb */}
    <button 
      onClick={() => deleteNote(n.id)}
      style={{ 
        position: "absolute", top: "12px", right: "12px", background: "transparent", 
        border: "none", color: "#475569", cursor: "pointer", fontSize: "18px"
      }}
    >
      ×
    </button>
  </div>
))}
</div>
)}

      <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", marginTop: "auto" }}>
        Smart Marks AI v1.0
      </div>
    </div>
  )
}

export default IndexPopup