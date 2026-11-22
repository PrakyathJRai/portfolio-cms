
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import axios from 'axios'
import api from '../services/api'

interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
  experience: number | null
  icon: string | null
  displayOrder: number
}

interface SkillForm {
  name: string
  category: string
  proficiency: number
  experience: string
  icon: string
  displayOrder: number
}

interface SkillsProps {
  onBack: () => void
}

const initialForm: SkillForm = {
  name: '',
  category: 'Frontend',
  proficiency: 80,
  experience: '',
  icon: '',
  displayOrder: 0,
}

const categories = [
  'Frontend',
  'Backend',
  'Database',
  'Programming Languages',
  'Tools',
  'Other',
]

function Skills({ onBack }: SkillsProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [form, setForm] = useState<SkillForm>(initialForm)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch all skills
  const fetchSkills = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/skills')

      setSkills(response.data.data)
    } catch (err: unknown) {
      console.error('Skills loading error:', err)

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          'Unable to load skills. Please try again.'
        )
      } else {
        setError('Something went wrong while loading skills.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSkills()
  }, [])

  // Handle input changes
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'proficiency' || name === 'displayOrder'
          ? Number(value)
          : value,
    }))
  }

  // Create or update skill
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setError('')
    setSuccess('')

    const trimmedName = form.name.trim()
    const trimmedIcon = form.icon.trim()
    const experienceText = String(form.experience ?? '').trim()

    const experienceValue =
      experienceText !== ''
        ? Number(experienceText)
        : undefined

    // Validate form values
    if (trimmedName.length < 2) {
      setError('Skill name must contain at least 2 characters.')
      setSaving(false)
      return
    }

    if (
      !Number.isInteger(form.proficiency) ||
      form.proficiency < 0 ||
      form.proficiency > 100
    ) {
      setError('Proficiency must be a whole number between 0 and 100.')
      setSaving(false)
      return
    }

    if (
      experienceValue !== undefined &&
      (!Number.isFinite(experienceValue) || experienceValue < 0)
    ) {
      setError('Experience must be a valid non-negative number.')
      setSaving(false)
      return
    }

    if (
      !Number.isInteger(form.displayOrder) ||
      form.displayOrder < 0
    ) {
      setError('Display order must be a non-negative whole number.')
      setSaving(false)
      return
    }

    // Prepare API data
    const skillData = {
      name: trimmedName,
      category: form.category,
      proficiency: form.proficiency,
      displayOrder: form.displayOrder,
      ...(experienceValue !== undefined
        ? { experience: experienceValue }
        : {}),
      ...(trimmedIcon !== ''
        ? { icon: trimmedIcon }
        : {}),
    }

    try {
      if (editingId) {
        await api.put(`/skills/${editingId}`, skillData)
        setSuccess('Skill updated successfully!')
      } else {
        await api.post('/skills', skillData)
        setSuccess('Skill created successfully!')
      }

      setForm(initialForm)
      setEditingId(null)
      setShowForm(false)

      await fetchSkills()
    } catch (err: unknown) {
      console.error('Skill save error:', err)

      if (axios.isAxiosError(err)) {
        console.error('Server response:', err.response?.data)

        setError(
          err.response?.data?.message ||
          `Request failed with status ${err.response?.status || 'unknown'}`
        )
      } else {
        setError('Something went wrong while saving the skill.')
      }
    } finally {
      setSaving(false)
    }
  }

  // Edit skill
  const handleEdit = (skill: Skill) => {
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      experience:
        skill.experience !== null
          ? String(skill.experience)
          : '',
      icon: skill.icon || '',
      displayOrder: skill.displayOrder,
    })

    setEditingId(skill.id)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  // Delete skill
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this skill?'
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await api.delete(`/skills/${id}`)

      setSuccess('Skill deleted successfully!')

      await fetchSkills()
    } catch (err: unknown) {
      console.error('Skill deletion error:', err)

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          'Unable to delete skill. Please try again.'
        )
      } else {
        setError('Something went wrong while deleting the skill.')
      }
    }
  }

  // Cancel form
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
            Skills Management
          </h1>

          <p className="mt-2 text-slate-500">
            Add, update and manage your technical skills.
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
          + Add Skill
        </button>

      </header>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Skill Form */}
      {showForm && (
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingId ? 'Edit Skill' : 'Add New Skill'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >

            {/* Skill Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Skill Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                placeholder="React.js"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Proficiency (%) *
              </label>

              <input
                name="proficiency"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.proficiency}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter a value between 0 and 100.
              </p>
            </div>

            {/* Experience */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Experience (Years)
              </label>

              <input
                name="experience"
                type="number"
                min="0"
                step="0.5"
                value={form.experience}
                onChange={handleChange}
                placeholder="1.5"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Skill Icon (Optional)
              </label>

              <input
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="javascript"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Display Order
              </label>

              <input
                name="displayOrder"
                type="number"
                min="0"
                step="1"
                value={form.displayOrder}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            {/* Form Buttons */}
            <div className="flex flex-wrap gap-3 md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Skill'
                    : 'Create Skill'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

            </div>

          </form>
        </section>
      )}

      {/* Skills List */}
      <section className="rounded-xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

          <h2 className="text-xl font-bold text-slate-900">
            All Skills
          </h2>

          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            {skills.length} Skills
          </span>

        </div>

        {loading ? (
          <p className="py-10 text-center text-slate-500">
            Loading skills...
          </p>
        ) : skills.length === 0 ? (
          <div className="py-12 text-center">

            <p className="text-4xl">💻</p>

            <h3 className="mt-4 font-bold text-slate-800">
              No skills found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Click Add Skill to create your first skill.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {skills.map((skill) => (
              <article
                key={skill.id}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-violet-300 hover:shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {skill.icon ? `${skill.icon} ` : ''}
                      {skill.name}
                    </h3>

                    <p className="mt-1 text-sm text-violet-600">
                      {skill.category}
                    </p>
                  </div>

                  <span className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700">
                    {skill.proficiency}%
                  </span>

                </div>

                {/* Proficiency Bar */}
                <div className="mt-5">

                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>Proficiency</span>
                    <span>{skill.proficiency}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, skill.proficiency))}%`,
                      }}
                    />
                  </div>

                </div>

                {/* Skill Details and Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                  <p className="text-xs text-slate-500">
                    {skill.experience !== null
                      ? `${skill.experience} years experience`
                      : 'Experience not specified'}
                  </p>

                  <div className="flex gap-2">

                    <button
                      onClick={() => handleEdit(skill)}
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </div>
  )
}

export default Skills
