const toPositiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

export const getPagination = (query = {}, options = {}) => {
  const defaultLimit = options.defaultLimit || 20
  const maxLimit = options.maxLimit || 100
  const page = toPositiveInt(query.page, 1, 100000)
  const limit = toPositiveInt(query.limit, defaultLimit, maxLimit)

  return {
    page,
    limit,
    skip: (page - 1) * limit
  }
}

export const getSort = (sortValue, allowedSorts = {}, fallback = { createdAt: -1 }) => {
  if (!sortValue || typeof sortValue !== 'string') return fallback

  const direction = sortValue.startsWith('-') ? -1 : 1
  const field = sortValue.startsWith('-') ? sortValue.slice(1) : sortValue
  const dbField = allowedSorts[field]

  if (!dbField) return fallback
  return { [dbField]: direction }
}
