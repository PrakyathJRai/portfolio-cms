
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  getMedia,
  uploadMedia,
  deleteMedia,
  type Media as MediaItem,
} from '../services/mediaService'

const API_ORIGIN = (
  import.meta.env.VITE_API_URL as string
).replace(/\/api\/?$/, '')

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function Media() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load media from backend
  const loadMedia = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getMedia()
      setMedia(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load media. Please check your backend server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMedia()
  }, [])

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  // Handle file selection
  const handleFileChange = (file: File | undefined) => {
    setError('')
    setSuccess('')

    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WebP and GIF images are allowed.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image size must not exceed 5 MB.')
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  // Clear selected image
  const clearSelection = () => {
    setSelectedFile(null)
    setPreview('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload image
  const handleUpload = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!selectedFile) {
      setError('Please select an image first.')
      return
    }

    try {
      setUploading(true)
      setError('')
      setSuccess('')

      await uploadMedia(selectedFile)

      setSuccess('Image uploaded successfully!')
      clearSelection()

      await loadMedia()
    } catch (err: any) {
      console.error(err)
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to upload image.'
      )
    } finally {
      setUploading(false)
    }
  }

  // Delete image
  const handleDelete = async (item: MediaItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${item.originalName}"?\n\nThis will remove the image file and its database record.`
    )

    if (!confirmed) return

    try {
      setDeletingId(item.id)
      setError('')
      setSuccess('')

      await deleteMedia(item.id)

      setMedia((currentMedia) =>
        currentMedia.filter((image) => image.id !== item.id)
      )

      setSuccess(`"${item.originalName}" deleted successfully!`)
    } catch (err: any) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to delete image.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  // Copy image URL
  const copyImageUrl = async (filePath: string) => {
    const imageUrl = `${API_ORIGIN}${filePath}`

    try {
      await navigator.clipboard.writeText(imageUrl)
      setSuccess('Image URL copied successfully!')
      setError('')
    } catch (err) {
      console.error(err)
      setError('Unable to copy URL. Please copy it manually.')
    }
  }

  // Search media
  const filteredMedia = useMemo(() => {
    return media.filter((item) =>
      item.originalName.toLowerCase().includes(search.toLowerCase())
    )
  }, [media, search])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Media Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Upload, preview and manage images for your portfolio.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Images</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {media.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Storage Used</p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {formatFileSize(
                media.reduce((total, item) => total + item.fileSize, 0)
              )}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Upload Section */}
        <section className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Upload New Image
          </h2>

          <form onSubmit={handleUpload} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0])
                }
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Supported formats: JPEG, PNG, WebP and GIF. Maximum size: 5 MB.
              </p>
            </div>

            {preview && (
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Image Preview
                </p>

                <img
                  src={preview}
                  alt="Selected image preview"
                  className="max-h-64 max-w-full rounded-lg object-contain"
                />

                <p className="mt-3 text-sm text-gray-600">
                  {selectedFile?.name}
                </p>

                <p className="text-xs text-gray-400">
                  {selectedFile
                    ? formatFileSize(selectedFile.size)
                    : ''}
                </p>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove selected image
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </section>

        {/* Media Gallery */}
        <section className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Media Library
            </h2>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search images..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
            />
          </div>

          {loading ? (
            <p className="py-10 text-center text-gray-500">
              Loading media...
            </p>
          ) : filteredMedia.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <p className="font-medium">No images found.</p>

              <p className="mt-1 text-sm">
                Upload your first image using the form above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMedia.map((item) => {
                const imageUrl = `${API_ORIGIN}${item.filePath}`

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex h-48 items-center justify-center bg-gray-100 p-3">
                      <img
                        src={imageUrl}
                        alt={item.originalName}
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    </div>

                    <div className="space-y-2 p-4">
                      <h3
                        className="truncate font-semibold text-gray-800"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {item.mimeType}
                      </p>

                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.fileSize)}
                      </p>

                      <p className="break-all text-xs text-gray-400">
                        {item.filePath}
                      </p>

                      {/* Copy Image URL */}
                      <button
                        type="button"
                        onClick={() => void copyImageUrl(item.filePath)}
                        className="w-full rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        Copy Image URL
                      </button>

                      {/* Delete Image */}
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId !== null}
                        className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === item.id
                          ? 'Deleting...'
                          : 'Delete Image'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
