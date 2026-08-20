// ============================================================
//  Centre Culturel Les Bambous — Google Apps Script API
//  Instructions de déploiement en bas de ce fichier.
// ============================================================

const SHEET_NAME = "Evenements";

// ─── Colonnes dans Google Sheets ───────────────────────────
// id | title | category | date | time | description | image | status

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var events = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    // Calculer le statut dynamiquement selon la date
    var eventDate = new Date(obj["date"]);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    obj["status"] = eventDate < today ? "recent" : "upcoming";
    events.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify(events))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data = JSON.parse(e.postData.contents);

    // Calculer statut
    var eventDate = new Date(data.date);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    var status = eventDate < today ? "recent" : "upcoming";

    // Ajouter la ligne
    sheet.appendRow([
      data.id || Date.now(),
      data.title || "",
      data.category || "",
      data.date || "",
      data.time || "",
      data.description || "",
      data.image || "",
      status
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
//  INSTRUCTIONS DE DÉPLOIEMENT
// ============================================================
//
//  1. Ouvrez https://sheets.google.com → Créez une nouvelle feuille
//  2. Nommez la feuille : "Evenements"
//  3. Ajoutez ces en-têtes en ligne 1 (A1 à H1) :
//     id | title | category | date | time | description | image | status
//  4. Dans le menu Google Sheets : Extensions → Apps Script
//  5. Collez ce code dans l'éditeur et sauvegardez
//  6. Cliquez "Déployer" → "Nouveau déploiement"
//     - Type      : Application Web
//     - Exécuter  : En tant que moi
//     - Accès     : Tout le monde (anonyme)
//  7. Copiez l'URL de déploiement et collez-la dans .env
//     VITE_SHEETS_API_URL=https://script.google.com/macros/s/XXXXX/exec
//
// ============================================================
