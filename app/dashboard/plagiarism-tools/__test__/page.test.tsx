import { POST } from "@/app/api/plagiarism/route"
import { DEFAULT_UPLOAD_DIR, MAX_FILE_SIZE } from "@/constants/uploadConstant"
import path from "path"
import fs from "fs/promises"
import { NextRequest } from "next/server"

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: jest.fn(() => ({
            generateContent: jest.fn(() => ({
                response: {
                    text: () => 'Mock Gemini Analysis Result'
                }
            })),
        })),
    })),
}))

jest.mock('formidable', () => {
    const MOCK_MAX_FILE_SIZE_CODE = 'maxFileSize'
    const MOCK_UNSUPPORTED_FILE_CODE = 'unsupportedFileType'

    const mockFormidableErrors = {
        maxFileSize: MOCK_MAX_FILE_SIZE_CODE,
        biggerThanMaxFileSize: MOCK_MAX_FILE_SIZE_CODE,
        unsupportedFileType: MOCK_UNSUPPORTED_FILE_CODE,
    }
    return {
        // Mock the IncomingForm class
        IncomingForm: jest.fn(() => ({
          // Mock metode parse
          parse: jest.fn((req, cb) => {
              const mockFiles = {
                  files: [{ 
                      filepath: `${DEFAULT_UPLOAD_DIR}plagiarism-uploads/test_document.pdf`,
                      originalFilename: 'test_document.pdf',
                      size: 100,
                      mimetype: 'application/pdf',
                  }]
              };
              const mockFields = {}; 

              cb(null, mockFields, mockFiles);
          }),
          on: jest.fn(),
        })),
        errors: mockFormidableErrors,
    };
})

jest.mock('@/library/documentExtractor', () => ({
    extractTextFromFile: jest.fn(() => 'Mock extracted text from pdf')
}))

jest.mock('fs/promises', () => ({
    ...jest.requireActual('fs/promises'),
    unlink: jest.fn(() => Promise.resolve())
}))

describe('Plagiarism API route', () => {
    const TEST_UPLOAD_DIR = path.join(process.cwd(), DEFAULT_UPLOAD_DIR, 'test-plagiarism-upload')
    const BASEURL = process.env.BASEURL ?? 'http://localhost:3000'
    const PLAGIARISM_URL = path.join(BASEURL, 'api/plagiarism')
    beforeAll(async() => {
        await fs.mkdir(TEST_UPLOAD_DIR, { recursive: true })
    })

    afterAll(async() => {
        await fs.rm(TEST_UPLOAD_DIR, { recursive: true, force: true })
    })

    beforeEach(async() => {
        jest.clearAllMocks()
    })

    test('should process a pdf file and return analysis', async() => {
        const testFilePath = path.join(TEST_UPLOAD_DIR, 'test_document.pdf')
        await fs.writeFile(testFilePath, 'this is a test pdf content')

        const formData = new FormData()
        formData.append('files', new Blob(['This is a test pdf content'], { type: 'application/pdf' }), 'test_document.pdf')

        const MockRequest = new NextRequest(PLAGIARISM_URL, {
            method: "POST",
            body: formData
        })
        const response = await POST(MockRequest)
        const jsonResponse = await response.json()

        expect(response.status).toBe(200)
        expect(jsonResponse.success).toBe(true)
        expect(jsonResponse.message).toBe('Files processed for plagiarism check!')
        expect(jsonResponse.data).toHaveLength(1)
        expect(jsonResponse.data[0].fileName).toBe('test_document.pdf')
        expect(jsonResponse.data[0].analysis).toBe('Mock Gemini Analysis Result')
        expect(jsonResponse.data[0].status).toBe('Success')
        expect(jsonResponse.data[0].filePath).toMatch(/test_document\.pdf$/)

        expect(require('@/library/documentExtractor').extractTextFromFile).toHaveBeenCalledTimes(1)
        expect(require('@google/generative-ai').GoogleGenerativeAI).toHaveBeenCalledTimes(1)

    })

    /*
    test('should handle unsupported file types', async() => {
        const formData = new FormData()
        const formBody = '<html><body>Hello</body></html>'
        formData.append('files', new Blob([formBody], { type: 'text/html' }), 'unsupported.html')

        const mockRequest = new NextRequest(PLAGIARISM_URL, {
            method: 'POST',
            body: formData
        })

        const response = await POST(mockRequest)
        const test = await response.json()
        expect(response.status).toBe(500)
        expect(test.success).toBe(false)
        expect(test.message).toBe('Plagiarism check failed!')
        expect(test.error).toContain('Unsupported file type')

        expect(require('@/library/documentExtractor').extractTextFromFile).toHaveBeenCalledTimes(1)
        expect(require('@google/generative-ai').GoogleGenerativeAI).toHaveBeenCalledTimes(1)

    })*/
})

