export function catchError(error: unknown): string {
  let errorMsg = "Unkown error"
  if (error instanceof Error) {
    errorMsg = error.message
  }
  return errorMsg
}
