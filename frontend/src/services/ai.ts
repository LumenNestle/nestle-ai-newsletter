import axios from 'axios'

export type ImproveTextRequest = {
  text: string
}

export type ImproveTextResponse = {
  originalText: string
  improvedText: string
  provider: 'nestle' | 'gemini'
  model: string
}

export type GeneratedNewsletterBlock = {
  id: string
  name: string
  text: string
  backgroundColor: string
}

export type GenerateNewsletterRequest = {
  area: 'COMUNICACION_INTERNA' | 'COMUNICACION_CORPORATIVA'
  templateId: string
  topic: string
  objective: string
  audience: string
  keyMessages: string[]
  tone: string
  relevantDates?: string
  cta?: string
  contact?: string
  linksOrSources: string[]
  additionalContext?: string
  assetIds: string[]
}

export type GenerateNewsletterResponse = {
  blocks: GeneratedNewsletterBlock[]
  provider: 'nestle' | 'gemini'
  model: string
}

export type UploadedAiAsset = {
  id: string
  name: string
  url: string
  type: 'IMAGE' | 'ICON' | 'LOGO' | 'SHAPE' | 'LOCKUP' | 'KEYWORD'
}

export type UploadAiAssetsResponse = {
  assets: UploadedAiAsset[]
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function improveText(
  request: ImproveTextRequest,
): Promise<ImproveTextResponse> {
  const response = await axios.post<ImproveTextResponse>(
    `${apiBaseUrl}/ai/improve-text`,
    request,
  )


  return response.data
}

export async function uploadAiAssets(files: File[]): Promise<UploadAiAssetsResponse> {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await axios.post<UploadAiAssetsResponse>(
    `${apiBaseUrl}/ai/assets`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export async function generateNewsletter(
  request: GenerateNewsletterRequest,
): Promise<GenerateNewsletterResponse> {
  const response = await axios.post<GenerateNewsletterResponse>(
    `${apiBaseUrl}/ai/generate-newsletter`,
    request,
  )

  return response.data
}
