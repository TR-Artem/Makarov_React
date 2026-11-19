import { useLocation } from 'react-router'

function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <main className="main">
      <h2>Страница не найдена</h2>
      <p>Адреса {pathname} в приложении нет.</p>
    </main>
  )
}

export default NotFoundPage
