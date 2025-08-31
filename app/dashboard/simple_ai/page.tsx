// pages/index.tsx
"use client"
import { useState } from "react"

// Penting: Pastikan styles/globals.css Anda mengimpor Tailwind CSS
// dan tailwind.config.js Anda memiliki konfigurasi yang relevan (warna, shadows, animations)

export default function Home() {
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState(
    "Your summarized text will appear here. Start by entering some text above!",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!inputText.trim()) {
      setSummary("Please enter some text to summarize.")
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    setSummary("")

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textToSummarize: inputText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || "Something went wrong during summarization.",
        )
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`Error: `, err.message)
        setError(err.message)
        setSummary("Failed to summarize text. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setInputText("")
    setSummary(
      "Your summarized text will appear here. Start by entering some text above!",
    )
    setError(null)
  }

  return (
    <>
      <div
        className={`flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12 font-sans bg-linear-to-br from-blue-50 via-gray-50 to-green-50`}
      >
        <div className="bg-white p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl w-full max-w-3xl border border-gray-100 transform transition-transform duration-300 ease-out hover:scale-[1.005]">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-gray-800 tracking-tight">
            AI Text Summarizer
          </h1>
          <div className="flex flex-col gap-4 px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                // Penyesuaian padding di sini
                className="w-full p-5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[220px] text-gray-800 text-lg placeholder-gray-400 transition-all duration-200 ease-in-out hover:border-gray-400 shadow-xs"
                placeholder="Paste your article, document, or any text you want to summarize here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                name="textToSummarize"
                disabled={isLoading}
              ></textarea>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {" "}
                {/* Penambahan mb-8 di sini */}
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 ease-in-out disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold shadow-lg hover:shadow-xl"
                  disabled={isLoading || inputText.trim().length === 0}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-6 w-6 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Summarize Text"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-medium shadow-md hover:shadow-lg"
                  disabled={isLoading || !inputText.trim()}
                >
                  Clear
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-8 p-5 bg-red-50 border border-red-300 text-red-700 rounded-lg text-base transition-opacity duration-300 animate-fade-in">
                <p className="font-semibold mb-2">
                  Oops, something went wrong:
                </p>
                <p>{error}</p>
              </div>
            )}

            <div className="mt-8 p-8 bg-blue-50 border border-blue-200 rounded-xl shadow-inner-lg w-full min-h-[180px]">
              <h2 className="text-3xl font-bold mb-5 text-blue-800">
                Summary Result
              </h2>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                {summary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
