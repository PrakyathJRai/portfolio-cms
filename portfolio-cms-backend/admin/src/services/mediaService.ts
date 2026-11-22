
import api from './api'

export interface Media {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  fileSize: number
  filePath: string
  createdAt: string
  updatedAt?: string
}

interface MediaResponse {
  success: boolean
  message?: string
  count?: number
  data: Media | Media[] | null
}

// Get all uploaded media
export const getMedia = async (): Promise<Media[]> => {
  const response = await api.get<MediaResponse>('/media')

  return Array.isArray(response.data.data)
    ? response.data.data
    : []
}

// Upload a new image
export const uploadMedia = async (file: File): Promise<Media> => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await api.post<MediaResponse>(
    '/media',
    formData
  )

  if (!response.data.data || Array.isArray(response.data.data)) {
    throw new Error('Invalid media upload response')
  }

  return response.data.data
}

// Delete an image
export const deleteMedia = async (id: string): Promise<void> => {
  await api.delete(`/media/${id}`)
}
