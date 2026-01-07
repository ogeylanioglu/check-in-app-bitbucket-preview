const USERNAME = 'convene25'
const PASSWORD = 'personalwonder'

function isStaticAsset(pathname) {
  if (pathname.startsWith('/assets/')) return true
  return /\.(?:png|jpg|jpeg|svg|ico|css|js)$/i.test(pathname)
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url)
  if (isStaticAsset(pathname)) {
    return fetch(request)
  }

  const authHeader = request.headers.get('authorization') || ''
  if (authHeader.startsWith('Basic ')) {
    const encoded = authHeader.slice(6)
    let decoded = ''
    try {
      decoded = atob(encoded)
    } catch (error) {
      decoded = ''
    }

  const separatorIndex = decoded.indexOf(':')
    if (separatorIndex !== -1) {
      const user = decoded.slice(0, separatorIndex)
      const pass = decoded.slice(separatorIndex + 1)
      if (user === USERNAME && pass === PASSWORD) {
        return fetch(request)
      }
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
  })
}
