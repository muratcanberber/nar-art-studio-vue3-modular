import bcrypt from 'bcryptjs'
import { defineEventHandler, readBody, createError } from 'h3'
import { useDatabase } from '../../utils/db'
import { createSession } from '../../utils/session'

type LoginBody = {
  username?: string
  password?: string
}

export default defineEventHandler(async event => {
  const body = (await readBody(event)) as LoginBody

  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Kullanıcı adı ve şifre gerekli.' })
  }

  const db = useDatabase()

  const user = db
    .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
    .get(body.username) as { id: number; username: string; password_hash: string } | undefined

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Geçersiz kullanıcı adı veya şifre.' })
  }

  const passwordMatches = await bcrypt.compare(body.password, user.password_hash)

  if (!passwordMatches) {
    throw createError({ statusCode: 401, statusMessage: 'Geçersiz kullanıcı adı veya şifre.' })
  }

  createSession(event, user.id)

  return {
    id: user.id,
    username: user.username
  }
})
