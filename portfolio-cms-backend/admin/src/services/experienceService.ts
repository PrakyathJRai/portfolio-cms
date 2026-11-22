
import api from './api'

export interface Experience {
  id: string
  company: string
  position: string
  employmentType: string | null
  location: string | null
  startDate: string
  endDate: string | null
  currentlyWorking: boolean
  description: string
  technologies: string[]
  companyLogo: string | null
  displayOrder: number
  createdAt?: string
  updatedAt?: string
}

export interface ExperienceFormData {
  company: string
  position: string
  employmentType: string
  location: string
  startDate: string
  endDate: string | null
  currentlyWorking: boolean
  description: string
  technologies: string[]
  companyLogo: string
  displayOrder: number
}

interface ExperienceResponse {
  success: boolean
  message?: string
  count?: number
  data: Experience | Experience[] | null
}

// GET all experiences
export const getExperiences = async (): Promise<Experience[]> => {
  const response = await api.get<ExperienceResponse>('/experience')

  return Array.isArray(response.data.data)
    ? response.data.data
    : []
}

// CREATE experience
export const createExperience = async (
  data: ExperienceFormData
): Promise<ExperienceResponse> => {
  const response = await api.post<ExperienceResponse>(
    '/experience',
    data
  )

  return response.data
}

// UPDATE experience
export const updateExperience = async (
  id: string,
  data: ExperienceFormData
): Promise<ExperienceResponse> => {
  const response = await api.put<ExperienceResponse>(
    `/experience/${id}`,
    data
  )

  return response.data
}

// DELETE experience
export const deleteExperience = async (
  id: string
): Promise<ExperienceResponse> => {
  const response = await api.delete<ExperienceResponse>(
    `/experience/${id}`
  )

  return response.data
}
