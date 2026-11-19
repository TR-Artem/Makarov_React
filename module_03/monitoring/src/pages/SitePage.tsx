import { Link, useParams } from 'react-router'
import { useMonitoring } from '../monitoring'
import { statusText } from '../status'

function SitePage() {
  const { sites, history, loading, error } = useMonitoring()
  const { id } = useParams()

  if (loading) {
    return <main className="main"><p className="empty">Загрузка сайта…</p></main>
  }

  if (error !== '') {
    return (
      <main className="main">
        <Link to="/" className="back">← Все сайты</Link>
        <p className="load-error">{error}</p>
      </main>
    )
  }

  const site = sites.find((s) => s.id === id)
  if (site === undefined) {
    return (
      <main className="main">
        <Link to="/" className="back">← Все сайты</Link>
        <p className="empty">Сайта с номером {id} нет в списке.</p>
      </main>
    )
  }

  const checks = history.map((run) => ({ time: run.time, check: run.checks.find((c) => c.id === site.id) }))
  const okCount = checks.filter((c) => c.check?.ok).length
  const last = checks[0]?.check

  return (
    <main className="main">
      <Link to="/" className="back">← Все сайты</Link>
      <h2>{site.name}</h2>
      <a href={site.url} target="_blank" rel="noreferrer">{site.url}</a>
      <p>Открывался в {okCount} из {checks.length} последних проверок · {statusText(last)}</p>
      <table className="history">
        <thead>
          <tr>
            <th>Время</th>
            <th>Результат</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((row) => (
            <tr key={row.time} className={row.check?.ok === false ? 'row--bad' : ''}>
              <td>{new Date(row.time).toLocaleString('ru')}</td>
              <td>{statusText(row.check)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default SitePage
