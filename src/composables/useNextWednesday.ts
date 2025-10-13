export function nextWednesday(base = new Date()) {
  const d = new Date(base)
  const day = d.getDay() // 0 Sun ... 3 Wed
  const diff = (3 - day + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  d.setHours(9,0,0,0)
  return d
}

export function formatDateTR(d: Date) {
  return new Intl.DateTimeFormat('tr-TR').format(d)
}
