export default defineNuxtRouteMiddleware(async to => {
  if (to.path === '/login') {
    return
  }

  if (process.server) {
    return
  }

  const userState = useState('auth-user', () => null as null | { id: number; username: string })

  if (userState.value) {
    return
  }

  const { data, error } = await useFetch('/api/auth/session')

  if (error.value || !data.value?.authenticated) {
    userState.value = null
    return navigateTo('/login')
  }

  userState.value = data.value.user
})
