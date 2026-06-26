# URL Shortener API

A Node.js and Express backend for creating, managing, and redirecting shortened URLs. The project uses PostgreSQL for persistence, Drizzle ORM for schema management, JWT-based authentication, and Zod for request validation.

## Features

- User signup and login
- JWT authentication with Bearer tokens
- Create short URLs with generated or custom short codes
- List all short URLs owned by the authenticated user
- Delete short URLs owned by the authenticated user
- Public redirect endpoint for short codes
- PostgreSQL schema managed with Drizzle Kit
- Request validation with Zod

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Schema tooling:** Drizzle Kit
- **Authentication:** JSON Web Tokens
- **Validation:** Zod
- **Package manager:** pnpm

## Project Structure

```text
.
├── db/
│   └── index.js              # Drizzle database client
├── middleware/
│   └── auth.middleware.js    # JWT parsing and auth guard
├── models/
│   ├── index.js              # Drizzle schema exports
│   ├── url.model.js          # URLs table schema
│   └── user.model.js         # Users table schema
├── routes/
│   ├── url.route.js          # URL shortener routes
│   └── user.routes.js        # Auth routes
├── services/
│   ├── url.service.js
│   └── user.service.js
├── utils/
│   ├── hash.js               # Password hashing helpers
│   └── token.js              # JWT helpers
├── validation/
│   ├── req.validation.js     # Request body schemas
│   └── token.validation.js   # Token payload schema
├── docker-compose.yml        # Local PostgreSQL service
├── drizzle.config.js         # Drizzle Kit configuration
├── index.js                  # Express app entry point
└── package.json
```

## Prerequisites

- Node.js
- pnpm
- Docker, if you want to run PostgreSQL locally with `docker-compose`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rohitranjanyadav/URL-Shortener
cd Project-URL-Shortener
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=8000
DATABASE_URL=postgres://postgres:admin@localhost:5432/postgres
JWT_SECRET=your_jwt_secret
```

| Variable | Description |
| --- | --- |
| `PORT` | Port used by the Express server. Defaults to `8000` if not set. |
| `DATABASE_URL` | PostgreSQL connection string used by Drizzle. |
| `JWT_SECRET` | Secret key used to sign and verify JWT access tokens. |

### 4. Start PostgreSQL

Using Docker:

```bash
docker compose up -d
```

This starts a PostgreSQL 17 container with:

```text
user: postgres
password: admin
database: postgres
port: 5432
```

### 5. Push the database schema

```bash
pnpm db:push
```

Drizzle reads the schema exports from `models/index.js` and creates or updates the database tables.

### 6. Start the development server

```bash
pnpm dev
```

The API will be available at:

```text
http://localhost:8000
```

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Starts the Express server with Node watch mode. |
| `pnpm db:push` | Pushes the Drizzle schema to PostgreSQL. |
| `pnpm db:studio` | Opens Drizzle Studio for inspecting database data. |

## API Reference

### Health Check

```http
GET /
```

Response:

```json
{
  "status": "Server is up and running..."
}
```

## Authentication

Authenticated endpoints require an `Authorization` header:

```http
Authorization: Bearer <token>
```

### Sign Up

```http
POST /user/signup
```

Request body:

```json
{
  "firstname": "Jane",
  "lastname": "Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "data": {
    "userId": "user_uuid"
  }
}
```

Validation rules:

- `firstname` is required.
- `lastname` is optional.
- `email` must be a valid email address.
- `password` must be at least 6 characters.

### Login

```http
POST /user/login
```

Request body:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "jwt_token"
}
```

## URL Endpoints

### Create Short URL

```http
POST /shorten
Authorization: Bearer <token>
```

Request body:

```json
{
  "url": "https://example.com/articles/backend-engineering",
  "code": "backend-guide"
}
```

`code` is optional. If it is not provided, the API generates an 8-character code with `nanoid`.

Response:

```json
{
  "id": "url_uuid",
  "shortCode": "backend-guide",
  "targetURL": "https://example.com/articles/backend-engineering"
}
```

### List My Short URLs

```http
GET /codes
Authorization: Bearer <token>
```

Response:

```json
{
  "codes": [
    {
      "id": "url_uuid",
      "shortCode": "backend-guide",
      "targetURL": "https://example.com/articles/backend-engineering",
      "userId": "user_uuid",
      "createdAt": "2026-06-24T10:00:00.000Z",
      "updatedAt": null
    }
  ]
}
```

### Delete Short URL

```http
DELETE /:id
Authorization: Bearer <token>
```

Deletes a short URL only when it belongs to the authenticated user.

Response:

```json
{
  "deleted": true
}
```

### Redirect Short URL

```http
GET /:shortCode
```

Example:

```text
GET /backend-guide
```

If the short code exists, the API redirects to the original target URL.

If the short code does not exist:

```json
{
  "error": "Invalid URL"
}
```

## Database Schema

### `users`

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key, generated automatically. |
| `first_name` | varchar(55) | User first name. |
| `last_name` | varchar(55) | Optional user last name. |
| `email` | varchar(255) | Unique user email. |
| `password` | text | Hashed password. |
| `salt` | text | Password salt. |
| `created_at` | timestamp | Creation timestamp. |
| `updated_at` | timestamp | Update timestamp. |

### `urls`

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key, generated automatically. |
| `code` | varchar(155) | Unique short code. |
| `target_url` | text | Original URL. |
| `user_id` | UUID | Owner of the short URL. References `users.id`. |
| `created_at` | timestamp | Creation timestamp. |
| `updated_at` | timestamp | Update timestamp. |

## Example Flow

1. Sign up a user with `POST /user/signup`.
2. Log in with `POST /user/login`.
3. Copy the returned JWT token.
4. Create a short URL with `POST /shorten`.
5. Open `http://localhost:8000/<shortCode>` in the browser to redirect.

## Notes for Development

- All table schemas must be exported from `models/index.js` so Drizzle Kit can discover them.
- Protected routes use `ensureAuthenticated`.
- The global authentication middleware parses the Bearer token, attaches the payload to `req.user`, and lets public routes continue without a token.
- Custom short codes must be unique because the `urls.code` column has a unique constraint.

## License

ISC
