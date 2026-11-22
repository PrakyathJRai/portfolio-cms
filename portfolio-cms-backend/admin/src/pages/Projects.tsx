
import { useEffect, useState } from 'react'
import api from '../services/api'


interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  thumbnail: string
  liveUrl: string
  githubUrl: string
  technologies: string[]
  category: string
  featured: boolean
  displayOrder: number
}

interface ProjectForm {
  title: string
  slug: string
  shortDescription: string
  description: string
  thumbnail: string
  liveUrl: string
  githubUrl: string
  technologies: string
  category: string
  featured: boolean
  displayOrder: number
}

const initialForm: ProjectForm = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  thumbnail: '',
  liveUrl: '',
  githubUrl: '',
  technologies: '',
  category: '',
  featured: false,
  displayOrder: 0,
}

interface ProjectsProps {
  onBack: () => void
}

function Projects({ onBack }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState<ProjectForm>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/projects')
      setProjects(response.data.data)
    } catch (err) {
      console.error('Projects loading error:', err)
      setError('Unable to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value)
            : value,
    }))
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    const projectData = {
      ...form,
      technologies: form.technologies
        .split(',')
        .map((technology) => technology.trim())
        .filter(Boolean),
    }

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, projectData)
        setSuccess('Project updated successfully!')
      } else {
        await api.post('/projects', projectData)
        setSuccess('Project created successfully!')
      }

      setForm(initialForm)
      setEditingId(null)
      setShowForm(false)

      await fetchProjects()
    } catch (err) {
      console.error('Project save error:', err)

setError('Unable to save project. Please check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (project: Project) => {
    setForm({
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription || '',
      description: project.description,
      thumbnail: project.thumbnail || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      technologies: project.technologies.join(', '),
      category: project.category || '',
      featured: project.featured,
      displayOrder: project.displayOrder,
    })

    setEditingId(project.id)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await api.delete(`/projects/${id}`)
      setSuccess('Project deleted successfully!')

      await fetchProjects()
    } catch (err) {
      console.error('Project deletion error:', err)
      setError('Unable to delete project. Please try again.')
    }
  }

  const handleCancel = () => {
    setForm(initialForm)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-100 p-5 sm:p-8">

      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-3 text-sm font-semibold text-violet-600 hover:text-violet-800"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Projects Management
          </h1>

          <p className="mt-2 text-slate-500">
            Create, update and manage your portfolio projects.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(initialForm)
            setEditingId(null)
            setShowForm(true)
            setError('')
            setSuccess('')
          }}
          className="rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          + Add Project
        </button>
      </header>

      {/* Notifications */}
      {error && (
        <div role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Project Form */}
      {showForm && (
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingId ? 'Edit Project' : 'Create New Project'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold">Project Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="Portfolio Website"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Project Slug *</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="portfolio-website"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Short Description</label>
              <input
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="A short summary of your project"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Full Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                minLength={10}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="Describe your project..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Thumbnail URL</label>
              <input
                name="thumbnail"
                type="url"
                value={form.thumbnail}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="https://example.com/image.png"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="Web Development"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Live Demo URL</label>
              <input
                name="liveUrl"
                type="url"
                value={form.liveUrl}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">GitHub URL</label>
              <input
                name="githubUrl"
                type="url"
                value={form.githubUrl}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="https://github.com/username/project"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Technologies * (comma-separated)
              </label>
              <input
                name="technologies"
                value={form.technologies}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Display Order</label>
              <input
                name="displayOrder"
                type="number"
                value={form.displayOrder}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            <label className="flex items-center gap-3 self-center">
              <input
                name="featured"
                type="checkbox"
                checked={form.featured}
                onChange={handleChange}
                className="h-4 w-4 accent-violet-600"
              />
              <span className="text-sm font-semibold">Featured Project</span>
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Projects List */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">
            All Projects
          </h2>

          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            {projects.length} Projects
          </span>
        </div>

        {loading ? (
          <p className="py-10 text-center text-slate-500">
            Loading projects...
          </p>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl">📁</p>
            <h3 className="mt-4 font-bold text-slate-800">
              No projects found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Click Add Project to create your first portfolio project.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 p-5 md:flex-row md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {project.title}
                    </h3>

                    {project.featured && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {project.shortDescription || project.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-md bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-shrink-0 gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

export default Projects
