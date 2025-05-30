# 🔥 Digimon Fusion Generator API

A REST API server for generating unique Digimon fusions using Google's Gemini AI. This application allows users to combine two Digimon into a brand new fusion with AI-generated descriptions and image prompts.

## 🚀 Features

- **AI-Powered Fusion Generation**: Uses Google Gemini AI to create unique Digimon fusions
- **User Authentication**: Secure registration and login with JWT tokens
<<<<<<< HEAD
- **Google Sign-In Integration**: Quick authentication using Google accounts
=======
>>>>>>> 253bd8f (chore: testing)
- **Fusion History**: Track all fusion attempts for registered users
- **External API Integration**: Fetches real Digimon data from public APIs
- **Comprehensive Testing**: 90%+ test coverage with Jest and Supertest
- **Production Ready**: Configured for AWS deployment

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
<<<<<<< HEAD
- **Authentication**: JWT with bcrypt password hashing + Google OAuth
- **AI Integration**: Google Gemini AI
- **Testing**: Jest, Supertest
- **External APIs**: Digimon API, Gemini AI API, Google Auth Library
=======
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: Google Gemini AI
- **Testing**: Jest, Supertest
- **External APIs**: Digimon API, Gemini AI API
>>>>>>> 253bd8f (chore: testing)

## 📁 Project Structure

```
server/
├── controllers/         # Request handlers
├── models/             # Sequelize models
├── routes/             # API routes
├── helpers/            # Utility functions
├── middlewares/        # Custom middleware
├── migrations/         # Database migrations
├── seeders/           # Database seeders
├── tests/             # Test files
├── config/            # Configuration files
├── app.js             # Main application file
└── package.json       # Dependencies and scripts
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Google Gemini AI API Key

### 1. Clone Repository
```bash
git clone <repository-url>
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digimon_fusion_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3000
NODE_ENV=development
<<<<<<< HEAD

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
=======
>>>>>>> 253bd8f (chore: testing)
```

### 4. Database Setup
```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate

# Seed demo data (optional)
npm run db:seed
```

### 5. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
<<<<<<< HEAD
- `POST /auth/login/google` - Google Sign-In authentication
=======
>>>>>>> 253bd8f (chore: testing)

### Digimon Data
- `GET /digimon` - Get all available Digimon

### Fusion Generation
- `POST /fusion` - Generate new Digimon fusion
- `GET /fusion/history` - Get user's fusion history (requires auth)

### API Documentation

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "trainer@digimon.com",
  "password": "password123",
  "username": "DigiTrainer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "trainer@digimon.com",
  "password": "password123"
}
```

<<<<<<< HEAD
#### Google Sign-In
```http
POST /auth/login/google
Content-Type: application/json

{
  "id_token": "google_jwt_id_token_here"
}
```

**Response (New User):**
```json
{
  "message": "Google account registered successfully",
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "username": "Google User"
  }
}
```

**Response (Existing User):**
```json
{
  "message": "Google login successful",
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "username": "ExistingUser"
  }
}
```

=======
>>>>>>> 253bd8f (chore: testing)
#### Generate Fusion
```http
POST /fusion
Content-Type: application/json

{
  "digimon1": "Agumon",
  "digimon2": "Gabumon"
}
```

#### Get Fusion History
```http
GET /fusion/history
Authorization: Bearer <jwt_token>
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

The project maintains 90%+ test coverage across all modules.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | Database host | Yes |
| `DB_PORT` | Database port | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USERNAME` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
<<<<<<< HEAD
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy the Client ID to your `.env` file

=======
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |

>>>>>>> 253bd8f (chore: testing)
## 🚀 Deployment

### AWS Deployment
1. Set up AWS RDS PostgreSQL instance
2. Configure environment variables in AWS
3. Deploy using AWS Elastic Beanstalk or EC2
4. Update database connection string for production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Digimon API](https://digimon-api.vercel.app/) for providing Digimon data
- [Google Gemini AI](https://ai.google.dev/) for AI content generation
- Hacktiv8 for the learning opportunity

## 📞 Support

For support, please contact [your-email@example.com] or create an issue in the repository.
