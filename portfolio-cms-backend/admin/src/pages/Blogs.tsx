
import { useEffect, useMemo, useState } from 'react'
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  type Blog,
  type BlogFormData,
} from '../services/blogService'

const emptyForm: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  tags: [],
  published: false,
  publishedAt: null,
  displayOrder: 0,
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [form, setForm] = useState<BlogFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [tagInput, setTagInput] = useState('')
  const [manualSlug, setManualSlug] = useState(false)

  const loadBlogs = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getBlogs()
      setBlogs(data)
    } catch (err) {
      setError('Failed to load blogs. Please check your backend server.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBlogs()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setTagInput('')
    setManualSlug(false)
    setError('')
  }

  const handleTitleChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: manualSlug ? previous.slug : createSlug(value),
    }))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag) return

    if (form.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setTagInput('')
      return
    }

    setForm((previous) => ({
      ...previous,
      tags: [...previous.tags, tag],
    }))
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    setForm((previous) => ({
      ...previous,
      tags: previous.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id)
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? '',
      content: blog.content,
      coverImage: blog.coverImage ?? '',
      category: blog.category ?? '',
      tags: blog.tags ?? [],
      published: blog.published,
      publishedAt: blog.publishedAt
        ? blog.publishedAt.slice(0, 10)
        : null,
      displayOrder: blog.displayOrder,
    })
    setManualSlug(true)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.title.trim().length < 2) {
      setError('Please enter a blog title with at least 2 characters.')
      return
    }

    if (form.slug.trim().length < 2) {
      setError('Please enter a valid blog slug.')
      return
    }

    if (form.content.trim().length < 10) {
      setError('Blog content must contain at least 10 characters.')
      return
    }

    try {
      setSaving(true)

      const payload: BlogFormData = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        coverImage: form.coverImage.trim(),
        category: form.category.trim(),
        tags: form.tags,
        publishedAt: form.published
          ? form.publishedAt || new Date().toISOString()
          : null,
        displayOrder: Number(form.displayOrder) || 0,
      }

      if (editingId) {
        await updateBlog(editingId, payload)
        setSuccess('Blog updated successfully!')
      } else {
        await createBlog(payload)
        setSuccess('Blog created successfully!')
      }

      resetForm()
      await loadBlogs()
    } catch (err: any) {
      console.error(err)
      setError(
        err.response?.data?.message ||
          'Unable to save blog. Please check your information.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this blog? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')
      await deleteBlog(id)
      setSuccess('Blog deleted successfully!')
      if (editingId === id) resetForm()
      await loadBlogs()
    } catch (err) {
      console.error(err)
      setError('Failed to delete blog.')
    }
  }

  const handleTogglePublished = async (blog: Blog) => {
    try {
      setError('')
      setSuccess('')

      await updateBlog(blog.id, {
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt ?? '',
        content: blog.content,
        coverImage: blog.coverImage ?? '',
        category: blog.category ?? '',
        tags: blog.tags ?? [],
        published: !blog.published,
        publishedAt: !blog.published
          ? blog.publishedAt || new Date().toISOString()
          : null,
        displayOrder: blog.displayOrder,
      })

      setSuccess(
        blog.published
          ? 'Blog moved to drafts.'
          : 'Blog published successfully!'
      )

      await loadBlogs()
    } catch (err) {
      console.error(err)
      setError('Failed to update blog status.')
    }
  }

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.category?.toLowerCase().includes(search.toLowerCase()) ||
        blog.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        )

      const matchesFilter =
        filter === 'all' ||
        (filter === 'published' && blog.published) ||
        (filter === 'draft' && !blog.published)

      return matchesSearch && matchesFilter
    })
  }, [blogs, search, filter])

  const publishedCount = blogs.filter((blog) => blog.published).length
  const draftCount = blogs.length - publishedCount

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Blog Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, edit, publish and manage your blog posts.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
          >
            + New Blog
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Blogs</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {blogs.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Published</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Drafts</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {draftCount}
            </p>
          </div>
        </div>

        <section className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit Blog' : 'Create New Blog'}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Cancel editing
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Blog Title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Enter blog title"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  URL Slug *
                </label>
                <input
                  required
                  value={form.slug}
                  onChange={(event) => {
                    setManualSlug(true)
                    setForm((previous) => ({
                      ...previous,
                      slug: createSlug(event.target.value),
                    }))
                  }}
                  placeholder="my-first-blog"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Automatically generated from the title. You can edit it.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  placeholder="e.g. Web Development"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(event) =>
                    setForm({ ...form, coverImage: event.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Short Excerpt
              </label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(event) =>
                  setForm({ ...form, excerpt: event.target.value })
                }
                placeholder="Write a short summary of your blog..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Blog Content *
              </label>
              <textarea
                required
                rows={9}
                value={form.content}
                onChange={(event) =>
                  setForm({ ...form, content: event.target.value })
                }
                placeholder="Write your complete blog content here..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Minimum 10 characters.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tags
              </label>

              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Enter a tag"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="font-bold hover:text-red-600"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      displayOrder: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-7">
                <input
                  id="published"
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) =>
                    setForm({ ...form, published: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <label
                  htmlFor="published"
                  className="text-sm font-medium text-gray-700"
                >
                  Publish this blog immediately
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t pt-5">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Blog'
                    : 'Save Blog'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Form
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              All Blog Posts
            </h2>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search blogs..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
            />
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {['all', 'published', 'draft'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                  filter === item
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item === 'all' ? 'All Blogs' : item}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="py-10 text-center text-gray-500">
              Loading blogs...
            </p>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <p className="font-medium">No blogs found.</p>
              <p className="mt-1 text-sm">
                Create your first blog using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row"
                >
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-36 w-full rounded-lg object-cover sm:w-48"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center rounded-lg bg-gray-100 text-4xl sm:w-48">
                      📝
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {blog.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          blog.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {blog.category || 'Uncategorized'} · /{blog.slug}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {blog.excerpt || blog.content}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(blog)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePublished(blog)}
                        className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                      >
                        {blog.published ? 'Move to Draft' : 'Publish'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(blog.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
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
    </div>
  )
}
