export default defineEventHandler(async (event) => {
  // Clear the session cookie
  setCookie(event, 'auth-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  })

  return {
    success: true
  }
}) 