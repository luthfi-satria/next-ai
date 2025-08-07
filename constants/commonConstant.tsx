export const SALT_LENGTH = 10

// JWT CONFIGURATION
export const ACCESS_TOKEN_SECRET =
  process.env.JWT_SECRET ?? "dahid6tUWYGB3@3249dga--dsh"
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "dhfueaf#7fyeu9auediaHDHJ"
export const JWT_EXPIRED = process.env.JWT_EXPIRED ?? 7200
export const REFRESH_INTERVAL = 7 // in second
