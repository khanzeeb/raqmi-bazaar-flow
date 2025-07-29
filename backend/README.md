# Raqmi Backend API

A complete Express.js backend for the Raqmi Inventory Management System with authentication, real-time features, and comprehensive security.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access
- 📦 **Product Management** - Full CRUD with stock tracking
- 👥 **Customer Management** - Customer profiles and credit management
- 🧾 **Invoice System** - Invoice generation and payment tracking
- 📊 **Real-time Updates** - Socket.IO for live inventory updates
- 🔒 **Security** - Input validation, rate limiting, file upload security
- 📁 **File Management** - Secure file uploads with image processing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: Joi + express-validator
- **File Upload**: Multer + Sharp
- **Security**: Helmet, CORS, bcrypt

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create product (Admin/Manager)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin/Manager)

### Real-time Events
- `inventory_update` - Stock level changes
- `order_update` - New orders and status changes
- `notification` - System notifications

## Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Secure file uploads
- JWT token authentication
- Role-based authorization

## Deployment

1. Set production environment variables
2. Run migrations: `npm run migrate`
3. Start server: `npm start`

## Contributing

1. Follow the existing code structure
2. Add proper validation for new endpoints
3. Include tests for new features
4. Update documentation