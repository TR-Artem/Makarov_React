/** @OnlyCurrentDoc */

const SHEET = 'news'

function doGet() {
  const [head, ...rows] = SpreadsheetApp.getActive().getSheetByName(SHEET).getDataRange().getValues()
  const news = rows.map((row) => Object.fromEntries(head.map((name, i) => [name, row[i]])))
  return json({ news })
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents)
  if (body.key !== PropertiesService.getScriptProperties().getProperty('KEY')) {
    return json({ error: 'Неверный ключ' })
  }
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET)
  const known = new Set(sheet.getRange('A:A').getValues().flat())
  const fresh = body.news.filter((item) => !known.has(item.id))
  for (const item of fresh) {
    sheet.appendRow([item.id, item.date, item.source, item.title, item.summary, item.tags.join(', '), item.link])
  }
  return json({ added: fresh.length })
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)
}
