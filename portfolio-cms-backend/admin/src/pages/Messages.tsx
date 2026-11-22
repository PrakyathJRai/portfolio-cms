
import { useEffect, useState } from 'react'
import api from '../services/api'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

interface MessagesProps {
  onBack: () => void
}

function Messages({ onBack }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/messages')
      setMessages(response.data.data || [])
    } catch (err) {
      console.error('Fetch messages error:', err)
      setError('Unable to load messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/messages/${id}/read`)

      setMessages((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      )

      setActionMessage('Message marked as read.')
    } catch (err) {
      console.error('Mark as read error:', err)
      setActionMessage('Unable to update this message.')
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this message?'
    )

    if (!confirmed) return

    try {
      await api.delete(`/messages/${id}`)

      setMessages((previous) =>
        previous.filter((item) => item.id !== id)
      )

      setActionMessage('Message deleted successfully.')
    } catch (err) {
      console.error('Delete message error:', err)
      setActionMessage('Unable to delete this message.')
    }
  }

  const unreadCount = messages.filter(
    (item) => !item.isRead
  ).length

  return (
    <div className="min-h-screen bg-slate-100 p-5 sm:p-8">
      <button
        onClick={onBack}
        className="mb-6 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        ← Back to Dashboard
      </button>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Contact Messages
          </h1>
          <p className="mt-2 text-slate-500">
            View and manage messages submitted through your portfolio.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Messages</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {messages.length}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Unread Messages</p>
          <h2 className="mt-2 text-3xl font-bold text-violet-600">
            {unreadCount}
          </h2>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-5 rounded-lg bg-violet-50 p-4 text-sm text-violet-700">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="font-medium text-violet-600">
            Loading messages...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-red-700">
          <p>{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-3 font-semibold underline"
          >
            Try Again
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <div className="mb-3 text-5xl">📭</div>
          <h2 className="text-xl font-bold text-slate-800">
            No messages yet
          </h2>
          <p className="mt-2 text-slate-500">
            Messages submitted through your contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {messages.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {item.name}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isRead
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>

                  <a
                    href={`mailto:${item.email}`}
                    className="mt-1 inline-block text-sm text-violet-600 hover:underline"
                  >
                    {item.email}
                  </a>
                </div>

                <p className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="font-semibold text-slate-800">
                  {item.subject}
                </h3>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                  {item.message}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Mark as Read
                  </button>
                )}

                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Messages
