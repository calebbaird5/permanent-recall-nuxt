export default defineEventHandler(async (event) => {
  const session = getCookie(event, 'auth-session')
  
  if (session === 'authenticated') {
    return {
      authenticated: true,
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User'
      }
    }
  }

  return {
    authenticated: false,
    user: null
  }
}) 