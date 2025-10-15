import { defineEventHandler } from 'h3'
import { resolveSession } from '../../utils/session'

export default defineEventHandler(event => {
  const session = resolveSession(event)
  if (!session) {
    return { authenticated: false }
  }

  return {
    authenticated: true,
    user: {
      id: session.user_id,
      username: session.username
    }
  }
})
