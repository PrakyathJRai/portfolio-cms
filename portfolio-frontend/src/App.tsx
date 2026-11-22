

import { useEffect, useState, type FormEvent } from 'react'
import VisitorAuth from './VisitorAuth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

type Item = Record<string, any>

type PortfolioData = {
  about: Item | null
  skills: Item[]
  projects: Item[]
  experience: Item[]
  blogs: Item[]
  testimonials: Item[]
  services: Item[]
}

const emptyData: PortfolioData = {
  about: null,
  skills: [],
  projects: [],
  experience: [],
  blogs: [],
  testimonials: [],
  services: [],
}

async function fetchCollection(endpoint: string): Promise<Item[]> {
  try {
    const response = await fetch(`${API}/${endpoint}`)
    if (!response.ok) return []

    const result = await response.json()
    const data = result.data ?? result

    if (Array.isArray(data)) return data
    if (data && typeof data === 'object') return [data]

    return []
  } catch {
    return []
  }
}

async function fetchAbout(): Promise<Item | null> {
  try {
    const response = await fetch(`${API}/about`)
    if (!response.ok) return null

    const result = await response.json()
    const data = result.data ?? result

    return data && !Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

function textValue(item: Item, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = item?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return fallback
}

function getTitle(item: Item, fallback: string): string {
  return textValue(item, ['title', 'name', 'skillName', 'role'], fallback)
}

function getDescription(item: Item): string {
  return textValue(item, [
    'description',
    'excerpt',
    'summary',
    'content',
    'details',
  ])
}

function SectionTitle({
  label,
  title,
}: {
  label: string
  title: string
}) {
  return (
    <div className="mb-10">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
        {label}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
    </div>
  )
}

function App() {
  const [data, setData] = useState<PortfolioData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)

  // Contact form states
  const [sending, setSending] = useState(false)
  const [contactStatus, setContactStatus] = useState('')
  const [contactError, setContactError] = useState('')

  // Contact form submission
  const handleContactSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    }

    setSending(true)
    setContactStatus('')
    setContactError('')

    try {
      const response = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to send your message.'
        )
      }

      setContactStatus(
        'Your message has been sent successfully!'
      )

      form.reset()
    } catch (error) {
      setContactError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSending(false)
    }
  }

  // Load portfolio data
  useEffect(() => {
    async function loadPortfolio() {
      const [
        about,
        skills,
        projects,
        experience,
        blogs,
        testimonials,
        services,
      ] = await Promise.all([
        fetchAbout(),
        fetchCollection('skills'),
        fetchCollection('projects'),
        fetchCollection('experience'),
        fetchCollection('blogs'),
        fetchCollection('testimonials'),
        fetchCollection('services'),
      ])

      setData({
        about,
        skills,
        projects,
        experience,
        blogs,
        testimonials,
        services,
      })

      setLoading(false)
    }

    void loadPortfolio()
  }, [])

  const about = data.about ?? {}

  const name = textValue(
    about,
    ['name', 'fullName', 'title'],
    'Your Name'
  )

  const role = textValue(
    about,
    ['designation', 'jobTitle', 'role', 'headline'],
    'Full-Stack Developer'
  )

  const introduction = textValue(
    about,
    ['shortBio', 'bio', 'description', 'about'],
    'I build modern, responsive and user-friendly web applications using modern frontend and backend technologies.'
  )

  const email = textValue(about, ['email', 'contactEmail'])
  const location = textValue(about, ['location', 'address'], 'India')

  const navigationItems = [
    'About',
    'Skills',
    'Projects',
    'Experience',
    'Blogs',
    'Contact',
    'Account',
  ]

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100">

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b14]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">

          <a href="#home" className="text-xl font-bold tracking-tight">
            <span className="text-cyan-400">&lt;</span>
            {name}
            <span className="text-cyan-400"> /&gt;</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            {navigationItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="transition hover:text-cyan-400"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg border border-white/20 px-3 py-2 text-sm md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? 'Close' : 'Menu'}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenu && (
          <div className="space-y-3 border-t border-white/10 px-5 py-4 md:hidden">
            {navigationItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenu(false)}
                className="block text-sm text-slate-300 transition hover:text-cyan-400"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>

        {/* Hero */}
        <section
          id="home"
          className="mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-center px-5 py-20 lg:px-8"
        >
          <div className="max-w-4xl">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Available for opportunities
            </div>

            <p className="mb-5 text-lg text-cyan-400">
              Hello, I'm
            </p>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
              {name}
              <span className="text-cyan-400">.</span>
            </h1>

            <h2 className="mt-5 text-2xl font-semibold text-slate-300 sm:text-4xl">
              {role}
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              {introduction}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#projects"
                className="rounded-lg bg-cyan-400 px-7 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                View My Work
              </a>

              <a
                href="#contact"
                className="rounded-lg border border-white/20 px-7 py-3 font-semibold transition hover:border-cyan-400 hover:text-cyan-400"
              >
                Contact Me
              </a>
            </div>

            <p className="mt-10 text-sm text-slate-500">
              {location} · Building digital experiences
            </p>

          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t border-white/10 bg-[#0c1120]">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

            <SectionTitle label="Introduction" title="About Me" />

            <div className="max-w-3xl">
              <p className="text-lg leading-9 text-slate-300">
                {textValue(
                  about,
                  ['description', 'bio', 'about', 'shortBio'],
                  introduction
                )}
              </p>

              {email && (
                <p className="mt-6 text-slate-400">
                  Email:{' '}
                  <a className="text-cyan-400" href={`mailto:${email}`}>
                    {email}
                  </a>
                </p>
              )}
            </div>

          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

          <SectionTitle label="My Expertise" title="Technical Skills" />

          {data.skills.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.skills.map((skill, index) => (
                <div
                  key={skill.id ?? index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-cyan-400/50"
                >
                  <h3 className="font-semibold text-white">
                    {getTitle(skill, 'Skill')}
                  </h3>

                  {getDescription(skill) && (
                    <p className="mt-2 text-sm text-slate-400">
                      {getDescription(skill)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">
              {loading
                ? 'Loading skills...'
                : 'Skills will appear here once published.'}
            </p>
          )}

        </section>

        {/* Projects */}
        <section id="projects" className="border-t border-white/10 bg-[#0c1120]">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

            <SectionTitle label="Selected Work" title="Featured Projects" />

            {data.projects.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.projects.map((project, index) => {
                  const image = textValue(project, [
                    'coverImage',
                    'image',
                    'imageUrl',
                    'thumbnail',
                  ])

                  const link = textValue(project, [
                    'liveUrl',
                    'projectUrl',
                    'githubUrl',
                    'url',
                  ])

                  return (
                    <article
                      key={project.id ?? index}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] transition hover:-translate-y-1 hover:border-cyan-400/40"
                    >
                      {image && (
                        <img
                          src={
                            image.startsWith('/uploads/')
                              ? `http://localhost:5000${image}`
                              : image
                          }
                          alt={getTitle(project, 'Project')}
                          className="h-48 w-full object-cover"
                        />
                      )}

                      <div className="p-6">
                        <h3 className="text-xl font-bold">
                          {getTitle(project, 'Project')}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          {getDescription(project) || 'Explore this project.'}
                        </p>

                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-5 inline-block text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-500">
                {loading
                  ? 'Loading projects...'
                  : 'Projects will appear here once published.'}
              </p>
            )}

          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

          <SectionTitle label="My Journey" title="Experience" />

          {data.experience.length ? (
            <div className="space-y-5">
              {data.experience.map((item, index) => (
                <article
                  key={item.id ?? index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-xl font-bold">
                    {getTitle(item, 'Experience')}
                  </h3>

                  <p className="mt-2 text-sm text-cyan-400">
                    {textValue(item, ['company', 'organization'])}
                  </p>

                  <p className="mt-3 leading-7 text-slate-400">
                    {getDescription(item)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">
              {loading
                ? 'Loading experience...'
                : 'Experience will appear here once published.'}
            </p>
          )}

        </section>

        {/* Blogs */}
        <section id="blogs" className="border-t border-white/10 bg-[#0c1120]">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

            <SectionTitle label="Latest Writing" title="Blog & Articles" />

            {data.blogs.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.blogs.map((blog, index) => (
                  <article
                    key={blog.id ?? index}
                    className="rounded-xl border border-white/10 bg-[#111827] p-6"
                  >
                    <h3 className="text-xl font-bold">
                      {getTitle(blog, 'Article')}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {getDescription(blog).slice(0, 180)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">
                {loading
                  ? 'Loading articles...'
                  : 'Articles will appear here once published.'}
              </p>
            )}

          </div>
        </section>

        {/* Services */}
        {data.services.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

            <SectionTitle label="What I Do" title="Services" />

            <div className="grid gap-5 md:grid-cols-3">
              {data.services.map((service, index) => (
                <article
                  key={service.id ?? index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-lg font-bold">
                    {getTitle(service, 'Service')}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {getDescription(service)}
                  </p>
                </article>
              ))}
            </div>

          </section>
        )}

        {/* Testimonials */}
        {data.testimonials.length > 0 && (
          <section className="border-t border-white/10 bg-[#0c1120]">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

              <SectionTitle label="Feedback" title="Testimonials" />

              <div className="grid gap-5 md:grid-cols-2">
                {data.testimonials.map((item, index) => (
                  <article
                    key={item.id ?? index}
                    className="rounded-xl border border-white/10 bg-[#111827] p-6"
                  >
                    <p className="leading-8 text-slate-300">
                      "{getDescription(item)}"
                    </p>

                    <p className="mt-4 font-semibold text-cyan-400">
                      {textValue(
                        item,
                        ['name', 'author', 'clientName'],
                        'Client'
                      )}
                    </p>
                  </article>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* Contact Form */}
        <section id="contact" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

          <SectionTitle label="Get In Touch" title="Let's Work Together" />

          <div className="grid gap-12 lg:grid-cols-2">

            <div>
              <h3 className="text-2xl font-bold text-white">
                Let's discuss your project
              </h3>

              <p className="mt-5 leading-8 text-slate-400">
                Have an opportunity, project or idea? I'd love to hear from you.
                Fill out the form and I'll get back to you.
              </p>

              {email && (
                <p className="mt-6 text-slate-400">
                  Email:{' '}
                  <a
                    href={`mailto:${email}`}
                    className="text-cyan-400 hover:underline"
                  >
                    {email}
                  </a>
                </p>
              )}

              <p className="mt-4 text-slate-400">
                Location: {location}
              </p>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >

              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Your Name
                </label>

                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Email Address
                </label>

                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  maxLength={255}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder="Enter subject"
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full resize-y rounded-lg border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              {contactStatus && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-sm text-green-400"
                >
                  {contactStatus}
                </p>
              )}

              {contactError && (
                <p role="alert" className="text-sm text-red-400">
                  {contactError}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Sending Message...' : 'Send Message'}
              </button>

            </form>
          </div>
        </section>

        {/* Visitor Authentication */}
        <VisitorAuth />

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {name}. Built with React, TypeScript and Tailwind CSS.
      </footer>

    </div>
  )
}

export default App
