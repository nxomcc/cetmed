function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export async function generateGetnetAuth() {
  const login = Deno.env.get('GETNET_LOGIN')
  const secretKey = Deno.env.get('GETNET_SECRET_KEY')
  if (!login || !secretKey) throw new Error('Faltan GETNET_LOGIN o GETNET_SECRET_KEY')

  const seed = new Date().toISOString()
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16))
  const nonce = bytesToBase64(nonceBytes)

  const seedBytes = new TextEncoder().encode(seed)
  const secretBytes = new TextEncoder().encode(secretKey)
  const digestInput = new Uint8Array(nonceBytes.length + seedBytes.length + secretBytes.length)
  digestInput.set(nonceBytes, 0)
  digestInput.set(seedBytes, nonceBytes.length)
  digestInput.set(secretBytes, nonceBytes.length + seedBytes.length)

  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', digestInput))
  return { login, tranKey: bytesToBase64(digest), nonce, seed }
}

export function getnetEndpoint() {
  return Deno.env.get('GETNET_ENDPOINT') || 'https://checkout.getnet.cl'
}
