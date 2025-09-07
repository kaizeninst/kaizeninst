# Kaizeninst E-Commerce Platform

An e-commerce platform for industrial and electrical equipment.
This project is built with a **monorepo architecture** that contains both the frontend (Next.js) and backend (Express.js).
The backend is connected to a **MySQL database** using Sequelize ORM with migration support.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (JavaScript)
- **Backend**: [Express.js](https://expressjs.com/) (JavaScript, REST API)
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM & Migrations**: [Sequelize](https://sequelize.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Environment Management**: dotenv
- **Linting & Formatting**: ESLint, Prettier, Prettier Plugin for TailwindCSS
- **Deployment**: Node.js server or Docker (see Deployment section)

---

## 📂 File Structure

```bash
kaizeninst/
├── apps/
│   ├── api/                 # Backend (Express.js)
│   │   ├── src/
│   │   │   ├── db/          # Database connection (Sequelize)
│   │   │   ├── models/      # Sequelize models
│   │   │   ├── routes/      # Express routes (API endpoints)
│   │   │   └── index.js     # Entry point for backend server
│   │   ├── migrations/      # Sequelize migration files
│   │   ├── seeders/         # Data seeders
│   │   ├── .env             # Environment variables (not committed to git)
│   │   └── package.json
│   │
│   └── web/                 # Frontend (Next.js)
│       ├── app/             # Next.js app directory
│       ├── public/          # Static assets
│       └── package.json
│
├── package.json             # Root monorepo config
├── pnpm-workspace.yaml      # pnpm workspaces setup
└── README.md                # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (>= 18)
- pnpm (>= 8)
- MySQL (>= 8)

### Clone Repository

```bash
git clone https://github.com/your-username/kaizeninst.git
cd kaizeninst
```

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Create `.env` in `apps/api/`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=kaizeninst
DB_USER=kaizen_user
DB_PASS=your_password_here
```

### Database Migration

Run migrations to create database schema:

```bash
cd apps/api
pnpm run db:migrate
```

(Optional) Seed initial data:

```bash
pnpm run db:seed
```

---

## ▶️ Running the Project

### Development

Start backend and frontend together:

```bash
pnpm dev
```

- API → [http://localhost:4000](http://localhost:4000)
- Frontend → [http://localhost:3000](http://localhost:3000)

### Production

Build and start:

```bash
# Frontend
cd apps/web
pnpm build
pnpm start

# Backend
cd apps/api
pnpm start
```

### Docker (Optional)

You can containerize the app using Docker Compose (MySQL + API + Frontend).
See `docker-compose.yml` (to be created).

---

## 📡 API Documentation (Basic)

### Health Check

```http
GET /health
```

**Response**

```json
{ "ok": true, "db": true }
```

### Users

```http
GET /api/users
POST /api/users
```

**Response Example**

```json
{
  "data": [
    { "user_id": 1, "name": "Alice", "email": "alice@example.com" },
    { "user_id": 2, "name": "Bob", "email": "bob@example.com" }
  ]
}
```

### Products

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Categories

- `GET /api/categories`
- `POST /api/categories`

### Orders

- `GET /api/orders`
- `POST /api/orders`

### Quotes

- `GET /api/quotes`
- `POST /api/quotes`

### Staff

- `GET /api/staff`
- `POST /api/staff`

---

## 🧑‍💻 Usage Example

### Fetch Users (Frontend Example)

```js
async function fetchUsers() {
  const res = await fetch("/api/users");
  const data = await res.json();
  console.log(data);
}
```

### Create User

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com"}'
```

---

## 🧪 Testing

⚠️ Testing framework not yet integrated. Recommended: **Jest**

Run tests (once implemented):

```bash
pnpm test
```

---

## ☁️ Deployment

### Option 1: Node.js Server

- Build frontend (`pnpm build`) and serve with `pnpm start`
- Run backend with `node src/index.js` or process manager (e.g., PM2)

### Option 2: Docker

Create a `docker-compose.yml` with:

- MySQL service
- API service
- Web service

Run:

```bash
docker compose up -d
```

### Option 3: Cloud Platforms

- Frontend → Vercel / Netlify
- Backend → Render / Railway / AWS ECS / GCP Cloud Run

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch

   ```bash
   git checkout -b feature/new-feature
   ```

3. Commit changes

   ```bash
   git commit -m 'Add new feature'
   ```

4. Push to branch

   ```bash
   git push origin feature/new-feature
   ```

5. Create Pull Request
