# Code Review SaaS Platform

A modern, full-stack SaaS platform for automated code reviews, built with cutting-edge technologies and best practices.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.2 (React 19)
- **Styling**: 
  - Tailwind CSS
  - Radix UI Components
  - Tailwind Merge for class composition
  - Class Variance Authority for component variants
- **State Management & Forms**:
  - React Hook Form
  - Zod for validation
- **UI/UX Features**:
  - Theme support (next-themes)
  - Toast notifications (react-hot-toast, sonner)
  - PDF rendering (@react-pdf/renderer)
  - QR code generation (qrcode, qrcode.react)
  - Charts and data visualization (recharts)
  - Markdown rendering (react-markdown)
  - Carousel (embla-carousel-react)
  - Various UI components from Radix UI

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: 
  - PostgreSQL
  - Prisma ORM
- **Authentication & Security**:
  - JWT (jsonwebtoken)
  - bcrypt for password hashing
  - Helmet for security headers
  - Two-factor authentication (speakeasy)
- **External Services**:
  - Stripe for payments
  - Redis for caching (@upstash/redis, ioredis)
  - Email service (nodemailer, Resend)
  - Google Auth integration
  - Azure AI integration
- **API Features**:
  - Express validator for request validation
  - CORS support
  - File upload handling (multer)
  - Cookie parsing
  - Request logging (morgan)

## 📁 Project Structure

```
├── frontend/
│   ├── app/           # Next.js application routes
│   ├── components/    # Reusable React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and configurations
│   ├── public/       # Static assets
│   └── styles/       # Global styles and Tailwind configuration
│
├── backend/
│   ├── src/          # Backend source code
│   └── prisma/       # Database schema and migrations
│
└── prisma/           # Shared Prisma configuration
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM, featuring:

- **User Model**: Handles user authentication and profile data
- **UserSubscription Model**: Manages Stripe subscription data

## 🔐 Security Features

- Secure password hashing with bcrypt
- JWT-based authentication
- HTTP security headers with Helmet
- Two-factor authentication support
- CORS protection
- Environment variable management
- Session handling

## 💳 Payment Integration

- Stripe integration for subscription management
- Custom subscription plans
- Automated billing and invoice handling

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Set up the database:
   ```bash
   cd backend
   npx prisma migrate dev
   ```
5. Start the development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   npm run dev
   ```

## 🛠️ Development Scripts

### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run linting

### Backend
- `npm run start`: Start with nodemon
- `npm run build`: Build TypeScript
- `npm run serve`: Start production server
- `npm run db:deploy`: Deploy database migrations

## 📝 License

[MIT License](LICENSE) 