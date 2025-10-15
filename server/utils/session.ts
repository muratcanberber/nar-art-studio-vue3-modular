import { randomBytes } from 'node:crypto'
import { H3Event, setCookie, deleteCookie, getCookie } from 'h3'
import { useDatabase } from './db'

const SESSION_COOKIE = 'nar_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function createSession(event: H3Event, userId: number) {
  const db = useDatabase()
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + SESSION_TTL_MS

  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt)

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  })
}

export function destroySession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return

  const db = useDatabase()
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)

  deleteCookie(event, SESSION_COOKIE)
}

export function resolveSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const db = useDatabase()

  const session = db
    .prepare(
      `
      SELECT s.token, s.expires_at, u.id as user_id, u.username
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
    `
    )
    .get(token) as { token: string; expires_at: number; user_id: number; username: string } | undefined

  if (!session) return null

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    deleteCookie(event, SESSION_COOKIE)
    return null
  }

  return session
}
