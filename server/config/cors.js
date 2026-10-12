const DEFAULT_PRODUCTION_ORIGINS = ['https://luxx.uz', 'https://www.luxx.uz']

const parseList = (value) => String(value || '')
  .split(',')
  .map((item) => item.trim().replace(/\/+$/, ''))
  .filter(Boolean)

// Allowed browser origins. Only exact matches are accepted: no wildcard hosting domains.
export const getAllowedOrigins = (env = process.env) => {
  const extra = [...parseList(env.CORS_ORIGINS), ...parseList(env.CLIENT_URL)]
  return [...new Set([...DEFAULT_PRODUCTION_ORIGINS, ...extra])]
}

export const createOriginChecker = (env = process.env) => {
  const allowed = getAllowedOrigins(env)
  const isProduction = env.NODE_ENV === 'production'

  return (origin, callback) => {
    // Non-browser clients (curl, server-to-server, same-origin) send no Origin header.
    if (!origin) return callback(null, true)
    if (!isProduction) return callback(null, true)
    if (allowed.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  }
}
