const defaultOrigins = [
  'http://localhost:5173',
  'https://cetmed.cl',
  'https://www.cetmed.cl',
  'https://old.cetmed.cl',
]

export function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowed = (Deno.env.get('PUBLIC_SITE_ORIGINS') || defaultOrigins.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

export function allowedOrigins() {
  return (Deno.env.get('PUBLIC_SITE_ORIGINS') || defaultOrigins.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export function assertAllowedOrigin(req: Request) {
  const origin = req.headers.get('origin') || Deno.env.get('PUBLIC_SITE_URL') || defaultOrigins[0]
  const allowed = allowedOrigins()
  if (!allowed.includes(origin)) throw new Error('ORIGIN_NOT_ALLOWED')
  return origin
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json',
    },
  })
}

export function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) })
  }
  return null
}
