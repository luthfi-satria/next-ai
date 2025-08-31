// app/dashboard/plagiarism-tools/page.tsx
"use client"
import React, { FormEvent, useState } from "react"
import { CloudUploadIcon } from "@heroicons/react/outline"
import { ALLOWED_MIME_TYPES } from "@/constants/uploadConstant"

type PlagiarismAnalysisResult = {
  fileName: string
  status: "Success" | "Error"
  analysis?: string
  message?: string
  filePath?: string
}

type APIresponse = {
  success: boolean
  message: string
  data: PlagiarismAnalysisResult | null
}

export default function PlagiarismPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [response, setResponse] = useState<APIresponse | undefined>()
  const [fileInputKey, setFileInputKey] = useState(Date.now())
  const [plagiarismResults, setPlagiarismResults] = useState<
    PlagiarismAnalysisResult[]
  >([])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const allowedMimeTypes = ALLOWED_MIME_TYPES
    const filteredFiles = files.filter((file) =>
      allowedMimeTypes.includes(file.type),
    )

    setUploadedFiles((prevFiles) => [...prevFiles, ...filteredFiles])

    if (filteredFiles.length < files.length) {
      setMessage("Some files were not added because their type is not allowed.")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    const allowedMimeTypes = ALLOWED_MIME_TYPES
    const filteredFiles = files.filter((file) =>
      allowedMimeTypes.includes(file.type),
    )

    setUploadedFiles((prevFiles) => [...prevFiles, ...filteredFiles])
    console.log("Selected files:", filteredFiles)
    if (filteredFiles.length < files.length) {
      setMessage("Some files were not added because their type is not allowed.")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const uploadFiles = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (uploadedFiles.length === 0) {
      setMessage(`You don't have any files to be uploaded`)
      return
    }

    const formData = new FormData()
    uploadedFiles.forEach((file) => {
      formData.append("files", file)
    })

    try {
      setIsUploading(true)
      const apiResponse = await fetch("/api/plagiarism", {
        method: "POST",
        body: formData,
      })

      const data = await apiResponse.json()
      if (apiResponse.ok) {
        setMessage("Files has been uploaded successfully!")
        setUploadedFiles([])
        setFileInputKey(Date.now())
        if (data.data) {
          setPlagiarismResults(data.data as PlagiarismAnalysisResult[])
        }
      } else {
        setMessage(
          `Upload failed: ${data.error || data.message || "An unknown error occurred"}`,
        )
        setPlagiarismResults([])
      }

      setResponse(data)

      setTimeout(() => {
        setIsUploading(false)
        setMessage("")
        setResponse(undefined)
      }, 3000)
    } catch (error: unknown) {
      console.error(`Error when uploading: `, error)
      setMessage("Internal server error during upload.")
      setResponse({
        success: false,
        message: "Internal server error",
        data: null,
      })
      setTimeout(() => {
        setIsUploading(false)
        setMessage("")
        setResponse(undefined)
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row mt-6 px-6 gap-6">
        {/* Left Section: File Upload and List */}
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          {/* Info Bar */}
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
            role="alert"
          >
            <p className="font-bold">
              put the document in the box to check the authenticity of the
              document
            </p>
          </div>

          {/* Success/Error Message */}
          {isUploading && message && (
            <div
              className={`${response?.success ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"} border-l-4 p-4 mb-6`}
              role="alert"
            >
              <p className="font-bold">
                {message || (isUploading ? "Uploading files..." : "")}
              </p>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative w-full h-80 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500
              ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
            `}
          >
            <CloudUploadIcon className="h-20 w-20 text-blue-500 mb-4" />
            <p className="text-lg font-semibold">Drag & Drop files or</p>
            <input
              key={fileInputKey}
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.csv"
            />
            <button className="mt-2 text-blue-600 font-bold hover:underline">
              Browse
            </button>
          </div>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <form onSubmit={uploadFiles}>
                <div className="flex gap-4 mb-4 items-center">
                  <h3 className="text-lg font-semibold w-1/5">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="grow w-4/5 text-right">
                    <button
                      type="submit"
                      className="p-2 w-[100px] bg-teal-500 text-white font-bold rounded-md hover:bg-teal-600"
                      disabled={isUploading || uploadedFiles.length === 0}
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 border rounded-md bg-white shadow-xs"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          )}

          {/* New Section: Plagiarism Check Results */}
          {plagiarismResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                Plagiarism Check Results
              </h3>
              <div className="space-y-4">
                {plagiarismResults.map((result, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-md shadow-xs bg-gray-50"
                  >
                    <p className="font-bold text-lg">{result.fileName}</p>
                    {result.status === "Success" ? (
                      <div>
                        <p className="text-green-600 font-medium">
                          Status: Success
                        </p>
                        <div className="mt-2 p-3 bg-white border rounded-md text-sm whitespace-pre-wrap">
                          {result.analysis}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-600 font-medium">
                          Status: Error
                        </p>
                        <p className="text-sm text-gray-700">
                          Message: {result.message}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
