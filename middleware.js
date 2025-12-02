import { NextResponse } from 'next/server'

const USERNAME = 'convene25'
const PASSWORD = 'consumeradd'
const PUBLIC_FILE = /\.(?:js|css|ico|png|jpe?g|gif|svg|webp|avif|woff2?|ttf|eot|otf|json|map|txt|xml|pdf|mp4|mp3|ogg|wav|manifest)$/i

export default function middleware(request) {
  const { pathname } = new URL(request.url)
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next()

  const auth = request.headers.get('authorization') || ''
  if (auth.startsWith('Basic ')) {
    const credentials = auth.slice(6)
    const [user, ...rest] = atob(credentials).split(':')
    const pass = rest.join(':')
    if (user === USERNAME && pass === PASSWORD) return NextResponse.next()
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
  })
}
