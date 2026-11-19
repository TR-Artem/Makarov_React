import { useState, type FormEvent } from 'react'
import type { Category, NewRequest } from '../requests'

const CATEGORIES: Category[] = ['Сантехника', 'Электрика', 'Мебель', 'Интернет']

type RequestFormProps = {
  onAdd: (data: NewRequest) => void
}

function RequestForm({ onAdd }: RequestFormProps) {
  const [title, setTitle] = useState('')
  const [room, setRoom] = useState('')
  const [category, setCategory] = useState<Category>('Сантехника')
  const [details, setDetails] = useState('')
  const [formError, setFormError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (title.trim() === '' || room.trim() === '') {
      setFormError('Заполните название и комнату.')
      return
    }
    setFormError('')
    onAdd({ title: title.trim(), room: room.trim(), category, details: details.trim() })
    setTitle('')
    setRoom('')
    setDetails('')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Новая заявка</h2>
      {formError !== '' && <p className="form__error">{formError}</p>}
      <label>Название</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, течёт кран" />
      <label>Комната</label>
      <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Например, 214" />
      <label>Категория</label>
      <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <label>Подробности</label>
      <textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
      <button type="submit">Отправить заявку</button>
    </form>
  )
}

export default RequestForm
