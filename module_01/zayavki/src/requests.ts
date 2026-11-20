export type Status = 'Новая' | 'В работе' | 'Готово'

export type Category = 'Сантехника' | 'Электрика' | 'Мебель' | 'Интернет'

export type RequestItem = {
  id: number
  title: string
  room: string
  category: Category
  details: string
  status: Status
}

export type NewRequest = {
  title: string
  room: string
  category: Category
  details: string
}

export function nextStatus(status: Status): Status {
  if (status === 'Новая') {
    return 'В работе'
  }
  return 'Готово'
}

export const initialRequests: RequestItem[] = [
  {
    id: 1,
    title: 'Течёт кран в умывальнике',
    room: '214',
    category: 'Сантехника',
    details: 'Капает горячая вода, раковина в ванной.',
    status: 'Новая',
  },
  {
    id: 2,
    title: 'Не работает розетка',
    room: '308',
    category: 'Электрика',
    details: 'Розетка у кровати не даёт напряжения.',
    status: 'В работе',
  },
  {
    id: 3,
    title: 'Сломан стул',
    room: '112',
    category: 'Мебель',
    details: 'Ножка стула расшаталась.',
    status: 'Готово',
  },
]
