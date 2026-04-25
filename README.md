# Luxe - Premium E-commerce Application

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Lucide React
- **Backend**: Node.js 22 (Express 5), Mongoose 8
- **Database**: MongoDB (Atlas)
- **Auth**: JWT with RBAC (Roles: user, admin, manager)

## API Endpoints

### Auth
- `POST /api/auth/register`: Register user
- `POST /api/auth/login`: Login & get JWT
- `GET /api/auth/users`: List users (Admin only)

### Products
- `GET /api/products`: List products. Response: `{ success, data: [Product] }`
- `POST /api/products`: Create product. Body: `{ name, price, category, images: [{url}] }`. Required: Admin/Manager.

### Orders
- `POST /api/orders`: Create order. Body: `{ customer: {name, phone, address}, items: [] }`.
- `GET /api/orders/all`: List all orders. Required: Admin/Manager.

### Orders
- `POST /api/orders`: Create order & notify Telegram
- `GET /api/orders/all`: List all orders (Admin/Manager only)

## Setup & Deployment
1. `npm install` in both client and server folders.
2. Configure `.env` in the server folder.
3. `npm start` to run.

## Production Optimization
- **Core Web Vitals**: Metrics are logged to the console via `reportWebVitals`. Performance target > 80.
- **Docker Deployment**: Run `docker build -t luxe-app .` followed by `docker run -p 3003:3003 luxe-app`.
- **CI/CD**: GitHub Actions workflow included in `.github/workflows/main.yml`.