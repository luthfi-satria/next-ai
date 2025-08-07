export const ALLOWED_MIME_TYPES = [
  "application/pdf", // PDF
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "text/plain",
  "text/csv",
]

export const MAX_FILE_SIZE = 5 // Bytes
export const DEFAULT_UPLOAD_DIR = process.env.UPLOAD_DIR
export const MAX_TEXT_LENGTH = 1000
export const PLAGIARISM_PROMPT = `Analyze the following document for potential plagiarism or extensive paraphrasing, provide a plagiarism score (e.g., 0-100%) if possible, identify any suspicious sections, and suggest original sources if you recognize them from your general knowledge base.If the text appears original, state that. \n\nDocument Content:\n`
