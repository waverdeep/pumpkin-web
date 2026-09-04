/**
 * pumpkin.zzam.today Worker.
 *
 * 정적 에셋(dist)은 Cloudflare 가 바로 서빙하고, /api/* 만 여기로 들어와 Cloud Run 으로 프록시한다.
 * 프론트와 API 가 같은 출처가 되어 CORS 가 없고, 주인 쿠키도 그대로 오간다.
 */
interface Env {
  ASSETS: Fetcher
  API_ORIGIN: string
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request)
    }

    if (!env.API_ORIGIN) {
      return Response.json({ detail: 'API 주소가 아직 설정되지 않았어' }, { status: 503 })
    }

    const target = new URL(url.pathname + url.search, env.API_ORIGIN)

    const headers = new Headers(request.headers)
    headers.delete('host')
    // 서버의 속도 제한이 실제 클라이언트 IP 를 보도록
    const ip = request.headers.get('CF-Connecting-IP')
    if (ip) headers.set('X-Forwarded-For', ip)
    headers.set('X-Forwarded-Host', url.host)
    headers.set('X-Forwarded-Proto', 'https')

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    })

    // Set-Cookie 를 포함한 응답 헤더를 그대로 넘긴다
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    })
  },
} satisfies ExportedHandler<Env>
