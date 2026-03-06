export {} 
// Ez a függvény figyeli, hogy mit jelöltél ki az egérrel
window.addEventListener("mouseup", () => {
  const selectedText = window.getSelection()?.toString()
  if (selectedText) {
    // Elküldjük a kijelölt szöveget a háttérnek/popupnak
    chrome.runtime.sendMessage({ type: "SET_SELECTION", text: selectedText })
  }
})