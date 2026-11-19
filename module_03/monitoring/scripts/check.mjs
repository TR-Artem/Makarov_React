import { readFile, writeFile } from 'node:fs/promises'

const SITES = 'public/data/sites.json'
const RESULTS = 'public/data/results.json'

async function notify(text) {
  const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = process.env
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Секреты Telegram не заданы, сообщение не отправлено')
    return
  }
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  })
  console.log('Telegram:', response.status)
}

const sites = JSON.parse(await readFile(SITES, 'utf8'))
let history = []
try {
  history = JSON.parse(await readFile(RESULTS, 'utf8')).history
} catch {
  // Первый запуск: файла с результатами ещё нет.
}

const checks = []
for (const site of sites) {
  const check = { id: site.id, ok: false, status: 0, ms: 0, error: '' }
  const start = Date.now()
  try {
    const response = await fetch(site.url, { signal: AbortSignal.timeout(15000) })
    check.status = response.status
    check.ok = response.ok
  } catch (e) {
    check.error = e.message
  }
  check.ms = Date.now() - start
  console.log(`${check.ok ? 'OK  ' : 'FAIL'} ${check.status} ${check.ms} мс ${site.url}`)
  checks.push(check)
}

history = [{ time: new Date().toISOString(), checks }, ...history].slice(0, 30)
await writeFile(RESULTS, JSON.stringify({ history }, null, 2) + '\n')

const previous = history[1]
const changes = []
for (const check of checks) {
  const site = sites.find((s) => s.id === check.id)
  const before = previous?.checks.find((c) => c.id === check.id)
  if (!check.ok && (before === undefined || before.ok)) {
    changes.push(`🔴 Не открывается: ${site.name} · ${check.status || check.error}\n${site.url}`)
  }
  if (check.ok && before !== undefined && !before.ok) {
    changes.push(`🟢 Снова работает: ${site.name}\n${site.url}`)
  }
}

if (changes.length === 0) {
  console.log('Изменений нет, сообщение не отправлено')
} else {
  await notify(`Ночная проверка сайтов\n\n${changes.join('\n\n')}`)
}
