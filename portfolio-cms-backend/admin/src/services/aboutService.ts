
import api from './api'

export interface About {
  id: string
  fullName: string
  title: string
  bio: string
  profileImage: string | null
  location: string | null
  email: string | null
  phone: string | null
  resumeUrl: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AboutFormData {
  fullName: string
  title: string
  bio: string
  profileImage: string
  location: string
  email: string
  phone: string
  resumeUrl: string
}

interface AboutResponse {
  success: boolean
  message?: string
  data: About | null
}

export const getAbout = async (): Promise<About | null> => {
  const response = await api.get<AboutResponse>('/about')
  return response.data.data
}

export const createAbout = async (
  data: AboutFormData
): Promise<AboutResponse> => {
  const response = await api.post<AboutResponse>('/about', data)
  return response.data
}

export const updateAbout = async (
  data: AboutFormData
): Promise<AboutResponse> => {
  const response = await api.put<AboutResponse>('/about', data)
  return response.data
}
