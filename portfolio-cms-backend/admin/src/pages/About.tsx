
import { useEffect, useState } from 'react'
import {
  getAbout,
  createAbout,
  updateAbout,
  type About,
  type AboutFormData,
} from '../services/aboutService'

const initialForm: AboutFormData = {
  fullName: '',
  title: '',
  bio: '',
  profileImage: '',
  location: '',
  email: '',
  phone: '',
  resumeUrl: '',
}

export default function About() {
  const [form, setForm] = useState<AboutFormData>(initialForm)
  const [about, setAbout] = useState<About | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAbout()
  }, [])

  const loadAbout = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAbout()
      setAbout(data)

      if (data) {
        setForm({
          fullName: data.fullName ?? '',
          title: data.title ?? '',
          bio: data.bio ?? '',
          profileImage: data.profileImage ?? '',
          location: data.location ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          resumeUrl: data.resumeUrl ?? '',
        })
      } else {
        setForm(initialForm)
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load About information. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (saving) return

    setMessage('')
    setError('')

    if (form.fullName.trim().length < 2) {
      setError('Full name must contain at least 2 characters.')
      return
    }

    if (form.title.trim().length < 2) {
      setError('Professional title must contain at least 2 characters.')
      return
    }

    if (form.bio.trim().length < 10) {
      setError('Bio must contain at least 10 characters.')
      return
    }

    try {
      setSaving(true)

      const payload: AboutFormData = {
        fullName: form.fullName.trim(),
        title: form.title.trim(),
        bio: form.bio.trim(),
        profileImage: form.profileImage.trim(),
        location: form.location.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        resumeUrl: form.resumeUrl.trim(),
      }

      const response = about
        ? await updateAbout(payload)
        : await createAbout(payload)

      if (response.success) {
        setAbout(response.data)
        setMessage(response.message || 'About information saved successfully.')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to save About information. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">Loading About information...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          About Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and professional profile.
        </p>
      </div>

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

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the information displayed on your portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              minLength={2}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Professional Title *
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              minLength={2}
              placeholder="e.g. Full-Stack Developer"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Professional Bio *
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              required
              minLength={10}
              rows={5}
              placeholder="Write a short professional introduction..."
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-gray-400">
              Minimum 10 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Kerala, India"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="profileImage"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Profile Image URL
            </label>
            <input
              id="profileImage"
              name="profileImage"
              type="url"
              value={form.profileImage}
              onChange={handleChange}
              placeholder="https://example.com/profile.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="resumeUrl"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Resume URL
            </label>
            <input
              id="resumeUrl"
              name="resumeUrl"
              type="url"
              value={form.resumeUrl}
              onChange={handleChange}
              placeholder="https://example.com/resume.pdf"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {form.profileImage.trim() && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Profile Image Preview
            </p>
            <img
              src={form.profileImage}
              alt="Profile preview"
              className="h-24 w-24 rounded-full border border-gray-200 object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Saving...'
              : about
                ? 'Update About Information'
                : 'Create About Information'}
          </button>

          <button
            type="button"
            onClick={loadAbout}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Reload
          </button>
        </div>
      </form>
    </div>
  )
}
