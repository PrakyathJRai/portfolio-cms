
import api from './api'

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  category: string | null
  tags: string[]
  published: boolean
  publishedAt: string | null
  displayOrder: number
  createdAt?: string
  updatedAt?: string
}

export interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  published: boolean
  publishedAt: string | null
  displayOrder: number
}

interface BlogResponse {
  success: boolean
  message?: string
  count?: number
  data: Blog | Blog[] | null
}

// GET all blogs
export const getBlogs = async (): Promise<Blog[]> => {
  const response = await api.get<BlogResponse>('/blogs')
  return Array.isArray(response.data.data) ? response.data.data : []
}

// CREATE blog
export const createBlog = async (
  data: BlogFormData
): Promise<Blog> => {
  const response = await api.post<BlogResponse>('/blogs', data)

  if (!response.data.data || Array.isArray(response.data.data)) {
    throw new Error('Invalid blog creation response')
  }

  return response.data.data
}

// UPDATE blog
export const updateBlog = async (
  id: string,
  data: BlogFormData
): Promise<Blog> => {
  const response = await api.put<BlogResponse>(`/blogs/${id}`, data)

  if (!response.data.data || Array.isArray(response.data.data)) {
    throw new Error('Invalid blog update response')
  }

  return response.data.data
}

// DELETE blog
export const deleteBlog = async (id: string): Promise<void> => {
  await api.delete(`/blogs/${id}`)
}
