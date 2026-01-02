# VeganBite - Vegan Food Review Website

A bilingual (Japanese/English) vegan food review platform built with React, Go, and PostgreSQL.

## Tech Stack

### Frontend
- React 19 + TypeScript 5.9
- Vite 7
- Tailwind CSS v4
- shadcn/ui components
- React Router v7

### Backend
- Go 1.25
- Echo framework
- GORM
- PostgreSQL 18
- Google OAuth 2.0 + JWT

### Infrastructure
- Docker & Docker Compose

## Getting Started

### Prerequisites
- Docker Desktop installed and running
- Git

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd vegan-review-app
```

2. Copy environment file and configure
```bash
cp .env.example .env
```

Edit `.env` with your Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-jwt-secret-key
```

3. Build and start containers
```bash
docker compose build
docker compose up -d
```

4. Run migrations
```bash
docker compose exec backend migrate -path ./migrations -database "postgres://postgres:postgres@db:5432/vegan_review?sslmode=disable" up
```

5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Admin: http://localhost:5173/admin/login

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/api/auth/google/callback`
   - `http://localhost:8080/api/auth/admin/google/callback`

## Project Structure

```
vegan-review-app/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── admin/       # Admin components
│   │   │   ├── auth/        # Auth callback components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── data/            # Mock data
│   │   └── App.tsx          # Main app with routing
│   ├── Dockerfile
│   └── package.json
├── backend/                  # Go backend
│   ├── main.go              # API server with OAuth
│   ├── Dockerfile
│   └── go.mod
├── migrations/              # SQL migrations
├── docs/                    # Documentation
│   └── DATABASE_SCHEMA.md   # DB設計・将来の拡張計画
├── docker-compose.yml
├── .env.example             # Environment template
└── README.md
```

## Documentation

- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - データベース設計、将来のEC拡張計画

## Database

### Current Tables (6)
- `admins` - 管理者
- `users` - 一般ユーザー
- `categories` - カテゴリ
- `products` - 商品
- `reviews` - レビュー
- `favorites` - お気に入り

### Future Tables (EC拡張)
詳細は [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) を参照

## Pages

### User Pages
- `/` - Product listing
- `/product/:id` - Product detail with reviews
- `/login` - User login
- `/mypage` - User profile, reviews, favorites

### Admin Pages
- `/admin/login` - Admin login
- `/admin/products` - Product management
- `/admin/products/new` - Add new product
- `/admin/products/:id/edit` - Edit product
- `/admin/reviews` - Review management

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/google | User Google OAuth login |
| GET | /api/auth/google/callback | User OAuth callback |
| GET | /api/auth/admin/google | Admin Google OAuth login |
| GET | /api/auth/admin/google/callback | Admin OAuth callback |
| GET | /api/auth/me | Get current user (Protected) |
| POST | /api/auth/logout | Logout (Protected) |

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/categories | List categories |
| GET | /api/products | List products |
| GET | /api/products/:id | Get product |
| GET | /api/products/:id/reviews | List product reviews |

### Protected Endpoints (Require Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| POST | /api/products/:id/reviews | Create review |
| DELETE | /api/reviews/:id | Delete review |
| GET | /api/users/:id/favorites | List user favorites |
| POST | /api/users/:id/favorites | Add favorite |
| DELETE | /api/users/:id/favorites/:productId | Remove favorite |

## License

MIT
