import { createError, defineEventHandler, sendRedirect } from 'h3'
import { resolveSession } from '../utils/session'

const PUBLIC_PATHS = new Set(['/login', '/api/auth/login', '/api/auth/session'])

export default defineEventHandler(async event => {
  const path = event.path || '/'

  if (
    path.startsWith('/_nuxt') ||
    path.startsWith('/__nuxt') ||
    path.startsWith('/_ipx') ||
    path.startsWith('/favicon') ||
    path.startsWith('/public') ||
    PUBLIC_PATHS.has(path)
  ) {
    return
  }

  const session = resolveSession(event)

  if (!session) {
    if (path.startsWith('/api')) {
      throw createError({ statusCode: 401, statusMessage: 'Oturum gerekli.' })
    }
    return sendRedirect(event, '/login')
  }

  event.context.user = {
    id: session.user_id,
    username: session.username
  }
})
