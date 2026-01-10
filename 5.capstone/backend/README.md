# TaskFlow Backend API

A complete Node.js + Express + MongoDB backend for a user authentication and task management system. This project demonstrates essential backend concepts including REST API design, authentication, authorization, and database management.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Core Concepts Explained](#core-concepts-explained)
- [Running the Application](#running-the-application)

---

## 🎯 Project Overview

**TaskFlow** is a full-stack application that allows users to:

1. **Sign up and log in** with secure password hashing
2. **Create, read, update, and delete (CRUD)** personal tasks
3. **Manage task status** (todo, in-progress, completed)
4. **Access only their own tasks** (authorization)

### Key Features

✅ JWT-based authentication  
✅ Bcrypt password hashing  
✅ MongoDB integration with Mongoose  
✅ Protected routes and endpoints  
✅ Error handling middleware  
✅ Input validation  
✅ Responsive REST API  
✅ Clean, professional code structure

---

## 🛠 Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - JSON Web Tokens for authentication
- **Bcryptjs** - Password hashing
- **Cors** - Cross-origin resource sharing
- **Dotenv** - Environment variables

---

## 📁 Project Structure

```
backend/
├── config/
│   └── env.js                 # Environment variables
├── controllers/
│   ├── authController.js      # Authentication logic (register, login)
│   ├── userController.js      # User management logic
│   └── taskController.js      # Task CRUD operations
├── middleware/
│   ├── auth.js                # JWT verification middleware
│   └── errorHandler.js        # Global error handling middleware
├── models/
│   ├── User.js                # User schema with validation
│   └── Task.js                # Task schema with validation
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   ├── userRoutes.js          # User endpoints
│   ├── taskRoutes.js          # Task endpoints
│   └── protectedRoutes.js     # Protected endpoints demo
├── utils/
│   └── errorUtils.js          # Error utilities
├── .env                       # Environment variables (dev)
├── .env.example               # Example env file
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
└── server.js                  # Main server file
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas connection string)
- npm or yarn

### Steps

1. **Clone and navigate to backend folder:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create `.env` file** (copy from `.env.example`):

```bash
cp .env.example .env
```

4. **Update `.env` with your MongoDB URI:**

```env
MONGO_URI=mongodb://localhost:27017/taskflow
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/taskflow
```

5. **Verify all dependencies are installed:**

```bash
npm list
```

---

## 🔐 Environment Variables

| Variable      | Description               | Example                              |
| ------------- | ------------------------- | ------------------------------------ |
| `PORT`        | Server port               | `3000`                               |
| `MONGO_URI`   | MongoDB connection string | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET`  | Secret key for JWT tokens | `your-secret-key`                    |
| `CORS_ORIGIN` | Frontend URL for CORS     | `http://localhost:5173`              |

---

## 📡 API Routes

### Authentication Routes

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`

```json
{
  "message": "Registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Task Routes (Protected - Requires Auth Token)

#### Get All Tasks

```http
GET /api/tasks
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "count": 3,
  "tasks": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Learn MongoDB",
      "description": "Study MongoDB concepts",
      "status": "in-progress",
      "createdAt": "2025-12-26T10:00:00.000Z",
      "updatedAt": "2025-12-26T10:00:00.000Z"
    }
  ]
}
```

#### Get Single Task

```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the taskflow project",
  "status": "todo"
}
```

**Response:** `201 Created`

#### Update Task

```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}
```

#### Delete Task

```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

---

## 🧠 Core Concepts Explained

### 1. **Routing & Controllers**

Routes define URL endpoints. Controllers contain the business logic.

**Example:**

```javascript
// route: /api/tasks/:id (GET)
// controller: getTask() - fetches a single task

// Separation: Routes are clean, controllers have logic
```

### 2. **Middleware**

Functions that process requests before they reach controllers.

**Example:**

```javascript
// auth.js middleware
- Extracts JWT token from headers
- Verifies the token
- Attaches user data to request
- Passes to next handler
```

### 3. **MongoDB & Mongoose**

**Collections** store documents (like tables in SQL):

- `users` - stores user data
- `tasks` - stores task data

**Schemas** define data structure:

```javascript
// Task schema has fields: title, description, status, userId
// Validates: required fields, enum values, string lengths
```

**Models** interact with database:

```javascript
const task = await Task.findOne({ _id: id, userId });
// Finds task matching ID and user ID
```

### 4. **Authentication & Authorization**

**Authentication:** Verify who the user is

```javascript
// Check password matches hash
const ok = await bcrypt.compare(password, user.passwordHash);
```

**Authorization:** Verify user can access resource

```javascript
// User can only access their own tasks
const task = await Task.findOne({ _id: id, userId });
// Returns null if task doesn't belong to user
```

### 5. **Password Hashing (Bcrypt)**

```javascript
// Registration: Hash password before storing
const passwordHash = await bcrypt.hash(password, 10);

// Login: Compare plain password with hash
const ok = await bcrypt.compare(password, user.passwordHash);
```

**Why:** If database is compromised, passwords are still safe

### 6. **JWT Tokens**

```javascript
// After login, create token with user info
const token = signJwt({ userId, email });

// Token sent to frontend, included in auth header
// Backend verifies token on protected routes
```

### 7. **Error Handling**

Global error middleware catches all errors:

```javascript
// Validation errors
// Duplicate key errors
// Invalid token errors
// 404 errors
// Server errors
```

All return consistent error response format.

### 8. **Environment Variables**

Sensitive data stored in `.env`:

```
MONGO_URI - never commit to git
JWT_SECRET - never commit to git
```

Uses `dotenv` package to load at startup.

---

## ▶️ Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

Output:

```
✅ MongoDB connected
🚀 Server running on port 3000
```

### Production Mode

```bash
npm start
```

---

## 📊 Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  passwordHash: String (required),
  createdAt: Date (default: now)
}
```

### Task Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (optional),
  status: String (enum: todo, in-progress, completed),
  userId: ObjectId (reference to User),
  createdAt: Date (default: now),
  updatedAt: Date (auto-updated)
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get tasks (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Create a new collection
2. Set up auth/register endpoint
3. Copy token from response
4. Set Authorization header: `Bearer {token}`
5. Test task endpoints

---

## 🔍 Key Features in Code

### Pre-save Hook (Auto-update timestamp)

```javascript
taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
```

### Validation Rules

```javascript
title: {
  required: [true, 'Title is required'],
  minlength: [1, 'Cannot be empty'],
  maxlength: [200, 'Too long']
}
```

### Protected Routes

```javascript
router.use(authenticateToken); // All routes below require auth
router.get("/", getTasks); // Only works if token is valid
```

---

## 📚 Interview Talking Points

> "This project shows how a real backend works. Users authenticate securely with bcrypt hashing and JWT tokens. Data is stored in MongoDB with proper schema validation using Mongoose. Tasks are protected so users can only access their own data. Errors are handled globally for consistency."

---

## 🐛 Troubleshooting

**MongoDB connection error:**

- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`

**JWT token errors:**

- Ensure token is included in Authorization header
- Format: `Authorization: Bearer <token>`

**CORS errors:**

- Update `CORS_ORIGIN` in `.env`
- Restart server after changes

---

## 📝 License

ISC

---

## 🎓 What You Learned

✅ Node.js and Express fundamentals  
✅ RESTful API design  
✅ MongoDB and Mongoose  
✅ Authentication with JWT  
✅ Password hashing with Bcrypt  
✅ Middleware and error handling  
✅ Environment variables and configuration  
✅ Protected routes and authorization  
✅ Professional code structure  
✅ Input validation and security

---

**Happy coding! 🚀**
