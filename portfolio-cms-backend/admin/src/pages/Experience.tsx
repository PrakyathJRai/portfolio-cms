
import { useEffect, useState } from 'react'
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  type Experience,
  type ExperienceFormData,
} from '../services/experienceService'

interface ExperienceProps {
  onBack: () => void
}

const initialForm: ExperienceFormData = {
  company: '',
  position: '',
  employmentType: 'Internship',
  location: '',
  startDate: '',
  endDate: null,
  currentlyWorking: false,
  description: '',
  technologies: [],
  companyLogo: '',
  displayOrder: 0,
}

function ExperiencePage({ onBack }: ExperienceProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [form, setForm] = useState<ExperienceFormData>(initialForm)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [technologyInput, setTechnologyInput] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadExperiences()
  }, [])

  // Load experiences
  const loadExperiences = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getExperiences()
      setExperiences(data)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load experience information.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle form fields
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'displayOrder'
          ? Number(value)
          : value,
    }))
  }

  // Handle currently working checkbox
  const handleCurrentlyWorking = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked

    setForm((previous) => ({
      ...previous,
      currentlyWorking: checked,
      endDate: checked ? null : previous.endDate,
    }))
  }

  // Add technology
  const addTechnology = () => {
    const technology = technologyInput.trim()

    if (!technology) return

    if (
      form.technologies.some(
        (item) => item.toLowerCase() === technology.toLowerCase()
      )
    ) {
      setError('This technology has already been added.')
      return
    }

    setForm((previous) => ({
      ...previous,
      technologies: [...previous.technologies, technology],
    }))

    setTechnologyInput('')
    setError('')
  }

  // Remove technology
  const removeTechnology = (technology: string) => {
    setForm((previous) => ({
      ...previous,
      technologies: previous.technologies.filter(
        (item) => item !== technology
      ),
    }))
  }

  // Reset form
  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    setTechnologyInput('')
    setError('')
    setMessage('')
  }

  // Edit experience
  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id)

    setForm({
      company: experience.company,
      position: experience.position,
      employmentType: experience.employmentType ?? '',
      location: experience.location ?? '',
      startDate: experience.startDate
        ? experience.startDate.slice(0, 10)
        : '',
      endDate: experience.endDate
        ? experience.endDate.slice(0, 10)
        : null,
      currentlyWorking: experience.currentlyWorking,
      description: experience.description,
      technologies: experience.technologies ?? [],
      companyLogo: experience.companyLogo ?? '',
      displayOrder: experience.displayOrder ?? 0,
    })

    setError('')
    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Submit experience
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (saving) return

    setError('')
    setMessage('')

    if (form.company.trim().length < 2) {
      setError('Company name must contain at least 2 characters.')
      return
    }

    if (form.position.trim().length < 2) {
      setError('Position must contain at least 2 characters.')
      return
    }

    if (!form.startDate) {
      setError('Please select a start date.')
      return
    }

    if (
      !form.currentlyWorking &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      setError('End date cannot be earlier than the start date.')
      return
    }

    if (form.description.trim().length < 10) {
      setError('Description must contain at least 10 characters.')
      return
    }

    if (form.technologies.length === 0) {
      setError('Please add at least one technology.')
      return
    }

    try {
      setSaving(true)

      const payload: ExperienceFormData = {
        company: form.company.trim(),
        position: form.position.trim(),
        employmentType: form.employmentType.trim(),
        location: form.location.trim(),
        startDate: form.startDate,
        endDate: form.currentlyWorking
          ? null
          : form.endDate || null,
        currentlyWorking: form.currentlyWorking,
        description: form.description.trim(),
        technologies: form.technologies,
        companyLogo: form.companyLogo.trim(),
        displayOrder: Number(form.displayOrder),
      }

      const response = editingId
        ? await updateExperience(editingId, payload)
        : await createExperience(payload)

      if (response.success) {
        setMessage(
          response.message ||
            'Experience information saved successfully.'
        )

        resetForm()
        await loadExperiences()
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to save experience information.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Delete experience
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this experience? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      setError('')
      setMessage('')

      const response = await deleteExperience(id)

      if (response.success) {
        setMessage(
          response.message || 'Experience deleted successfully.'
        )

        if (editingId === id) {
          resetForm()
        }

        await loadExperiences()
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to delete experience.'
      )
    }
  }

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'Present'

    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen space-y-6 bg-slate-100 p-5 sm:p-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Experience Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your professional experience and internships.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Experience Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {editingId ? 'Edit Experience' : 'Add New Experience'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter your employment and internship details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Company */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Company Name *
            </label>

            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              minLength={2}
              placeholder="e.g. Inventron Technologies"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Position */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Position *
            </label>

            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              minLength={2}
              placeholder="e.g. Trainee Data Analyst Intern"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Employment Type
            </label>

            <select
              name="employmentType"
              value={form.employmentType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-violet-500"
            >
              <option value="">Select employment type</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Training">Training</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Mangalore, Karnataka"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Start Date *
            </label>

            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={form.endDate ?? ''}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  endDate: event.target.value || null,
                }))
              }
              disabled={form.currentlyWorking}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500 disabled:bg-gray-100"
            />
          </div>

          {/* Currently Working */}
          <div className="flex items-center gap-3 md:col-span-2">
            <input
              id="currentlyWorking"
              type="checkbox"
              checked={form.currentlyWorking}
              onChange={handleCurrentlyWorking}
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />

            <label
              htmlFor="currentlyWorking"
              className="text-sm font-medium text-gray-700"
            >
              I am currently working in this position
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description *
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              minLength={10}
              rows={5}
              placeholder="Describe your responsibilities, contributions and achievements..."
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          {/* Technologies */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Technologies Used *
            </label>

            <div className="flex flex-wrap gap-2">
              <input
                value={technologyInput}
                onChange={(event) =>
                  setTechnologyInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTechnology()
                  }
                }}
                placeholder="Enter a technology"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500"
              />

              <button
                type="button"
                onClick={addTechnology}
                className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Add
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {form.technologies.map((technology) => (
                <span
                  key={technology}
                  className="flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700"
                >
                  {technology}

                  <button
                    type="button"
                    onClick={() => removeTechnology(technology)}
                    aria-label={`Remove ${technology}`}
                    className="font-bold hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Company Logo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Company Logo URL
            </label>

            <input
              type="url"
              name="companyLogo"
              value={form.companyLogo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Display Order
            </label>

            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleChange}
              min={0}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-violet-500"
            />
          </div>

        </div>

        {/* Form Buttons */}
        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Experience'
                : 'Create Experience'}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Clear Form
          </button>

        </div>
      </form>

      {/* Experience List */}
      <section className="space-y-5">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Experience
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your saved professional experience.
            </p>
          </div>

          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            {experiences.length} Records
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            Loading experience records...
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              No experience records found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your first professional experience using the form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {experiences.map((experience) => (
              <article
                key={experience.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">

                  {experience.companyLogo ? (
                    <img
                      src={experience.companyLogo}
                      alt={`${experience.company} logo`}
                      className="h-14 w-14 rounded-xl border border-gray-200 object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xl font-bold text-violet-700">
                      {experience.company.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {experience.position}
                    </h3>

                    <p className="mt-1 font-medium text-violet-700">
                      {experience.company}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {experience.employmentType || 'Employment'}
                      {experience.location
                        ? ` • ${experience.location}`
                        : ''}
                    </p>
                  </div>

                  {experience.currentlyWorking && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Current
                    </span>
                  )}

                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(experience.startDate)} –{' '}
                    {experience.currentlyWorking
                      ? 'Present'
                      : formatDate(experience.endDate)}
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {experience.description}
                  </p>

                  {experience.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {experience.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">

                    <button
                      type="button"
                      onClick={() => handleEdit(experience)}
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(experience.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
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

export default ExperiencePage
