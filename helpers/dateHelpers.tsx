export const dateNowIsoFormat = () => {
  const now = new Date()
  return now.toISOString()
}

export const formatDate = (isoString: string): string => {
  if (isoString) {
    const date = new Date(isoString)

    const day = String(date.getUTCDate()).padStart(2, "0")
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const year = date.getUTCFullYear()

    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    const seconds = String(date.getUTCSeconds()).padStart(2, "0")

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }
  return isoString
}
