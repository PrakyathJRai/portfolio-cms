# Full-Stack Portfolio CMS

A full-stack portfolio website with a custom Admin Dashboard that allows administrators to manage portfolio content dynamically without modifying the source code.

The application includes a public portfolio website, a secure admin panel, REST APIs, and a PostgreSQL database.

## 🌐 Live Demo

| Application | URL |
|---|---|
| Public Portfolio | https://portfolio-cms-frontend-65pb.onrender.com |
| Admin Dashboard | https://portfolio-cms-admin-k91q.onrender.com |
| Backend API | https://portfolio-cms-api-8b6o.onrender.com |

**GitHub Repository:** https://github.com/PrakyathJRai/portfolio-cms

## ✨ Features

### Public Portfolio
- Responsive portfolio website.
- Dynamic About Me section.
- Skills and proficiency display.
- Projects showcase.
- Professional experience section.
- Blog listing.
- Contact form.
- Visitor registration and login interface.

### Admin Dashboard
- Secure admin authentication using JWT.
- About information management.
- Skills management.
- Project management.
- Experience management.
- Blog management.
- Media management interface.
- Contact message management.
- View and manage visitor messages.

### Backend
- RESTful API architecture.
- Node.js and Express.js.
- PostgreSQL database integration.
- Prisma ORM.
- JWT-based authentication.
- Password hashing using bcrypt.
- Input validation using Zod.
- Database migrations using Prisma.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| HTTP Client | Axios |
| Deployment | Render |
| Version Control | Git, GitHub |

## 📁 Project Structure

```text
portfolio-cms/
│
├── portfolio-cms-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── admin/
│   │   └── src/
│   │
│   ├── prisma/
│   │   └── migrations/
│   │
│   ├── scripts/
│   ├── package.json
│   └── prisma.config.ts
│
├── portfolio-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PrakyathJRai/portfolio-cms.git

cd portfolio-cms
```

### 2. Backend Setup

```bash
cd portfolio-cms-backend

npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
JWT_SECRET="your_secure_random_secret"
PORT=5000
```

Configure your PostgreSQL database and environment variables.

Generate Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the backend development server:

```bash
npm run dev
```

Backend runs locally at:

```text
http://localhost:5000
```

### 3. Admin Dashboard Setup

Open another terminal:

```bash
cd portfolio-cms-backend/admin

npm install
```

Create an `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the Admin Dashboard:

```bash
npm run dev
```

### 4. Public Frontend Setup

Open another terminal:

```bash
cd portfolio-frontend

npm install
```

Create an `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the public frontend:

```bash
npm run dev
```

Open the local URLs displayed by Vite in your terminal.

## 🚀 Deployment

The application is deployed using Render.

- **Backend:** Render Web Service.
- **Admin Dashboard:** Render Static Site.
- **Public Portfolio:** Render Static Site.
- **Database:** PostgreSQL.

The production frontend applications use the deployed backend API through the `VITE_API_URL` environment variable.

## 🔐 Security

- JWT-based authentication for protected admin routes.
- Password hashing using bcrypt.
- Environment variables for sensitive configuration.
- Input validation using Zod.
- Protected API endpoints.

Never commit `.env` files, database passwords, JWT secrets, or other credentials to GitHub.

## 📌 Future Improvements

- Image upload and media library enhancements.
- Improved analytics dashboard.
- SEO optimization.
- Additional visitor account features.
- Enhanced application security and rate limiting.
- Automated testing.

## 👨‍💻 Author

**Full-Stack Developer**

GitHub: https://github.com/PrakyathJRai

---

⭐ If you find this project interesting, consider giving the repository a star!

**Built with React.js, TypeScript, Node.js, Express.js, PostgreSQL and Prisma.**