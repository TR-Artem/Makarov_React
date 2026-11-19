import type { Category, Status } from '../requests'

type RequestCardProps = {
  title: string
  room: string
  category: Category
  details: string
  status: Status
  onNext: () => void
  onRemove: () => void
}

const NEXT_LABEL: Record<Status, string> = {
  Новая: 'Взять в работу',
  'В работе': 'Завершить',
  Готово: 'Готово',
}

function RequestCard({ title, room, category, details, status, onNext, onRemove }: RequestCardProps) {
  return (
    <article className="card">
      <div className="card__top">
        <span className="card__room">
          комн. {room} · {category}
        </span>
        <span className="card__status">{status}</span>
      </div>
      <h3>{title}</h3>
      {details !== '' && <p>{details}</p>}
      <div className="card__actions">
        <button onClick={onNext} disabled={status === 'Готово'}>
          {NEXT_LABEL[status]}
        </button>
        {status === 'Готово' && (
          <button className="card__more" onClick={onRemove}>
            Убрать
          </button>
        )}
      </div>
    </article>
  )
}

export default RequestCard
