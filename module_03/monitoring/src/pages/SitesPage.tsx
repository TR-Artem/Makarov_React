import { Link } from 'react-router'
import { useMonitoring } from '../monitoring'
import { statusText } from '../status'

function SitesPage() {
  const { sites, history, loading, error } = useMonitoring()
  const last = history[0]

  if (loading) {
    return <main className="main"><p className="empty">Загрузка сайтов…</p></main>
  }

  const failing = sites.filter((site) => last?.checks.find((c) => c.id === site.id)?.ok === false).length

  return (
    <main className="main">
      {error !== '' && <p className="load-error">{error}</p>}
      {last !== undefined && (
        <p className="summary">
          {failing === 0 ? `Все ${sites.length} сайтов открываются` : `Не открываются: ${failing} из ${sites.length}`}
        </p>
      )}
      <ul className="sites">
        {sites.map((site) => {
          const check = last?.checks.find((c) => c.id === site.id)
          return (
            <li key={site.id} className={check?.ok === false ? 'site site--bad' : 'site'}>
              <span className="site__status">{statusText(check)}</span>
              <h2>
                <Link to={`/site/${site.id}`}>{site.name}</Link>
              </h2>
              <a href={site.url} target="_blank" rel="noreferrer">
                {site.url}
              </a>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

export default SitesPage
