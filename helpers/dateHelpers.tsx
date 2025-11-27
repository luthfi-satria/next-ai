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
export const addDays = (dateObj: Date, days: number) => {
  const newDate = new Date(dateObj.getTime())

  const currentDay = newDate.getDate()

  newDate.setDate(currentDay + days)

  return newDate
}

export const formatDateToYYYYMMDD = (dateObj: Date) => {
  const year = dateObj.getFullYear()

  const month = dateObj.getMonth() + 1

  const day = dateObj.getDate()

  const padToTwoDigits = (num) => {
    return num.toString().padStart(2, "0")
  }

  return `${year}-${padToTwoDigits(month)}-${padToTwoDigits(day)}`
}
