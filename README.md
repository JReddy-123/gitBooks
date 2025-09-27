# gitBooks
gitBooks &amp; More

PRODUCTION DEPENDENCIES

Web Framework:
express - Main web server framework for handling HTTP requests and responses
cors - Enables cross-origin requests from frontend applications
helmet - Adds security headers to protect against common web vulnerabilities

Security & Authentication: 
bcryptjs - Hashes passwords securely before storing in database
jsonwebtoken - Creates and verifies JWT tokens for user authentication
express-validator - Validates and sanitizes user input data

Database & Storage:
pg - PostgreSQL database client for connecting and querying the database
multer - Handles file uploads, especially images for listings
dotenv - Loads environment variables from .env file

Middleware & Utilities:
morgan - Logs HTTP requests for debugging and monitoring
express-rate-limit - Prevents spam by limiting requests per IP address

DEVELOPMENT DEPENDENCIES
nodemon - Automatically restarts server when code changes are made
jest - Testing framework for writing and running unit tests
supertest - Tests HTTP endpoints and API responses

npm start               # Run production server
npm run dev            # Run development server with auto-restart
npm test               # Run test suite

npm audit              # Check for security vulnerabilities
npm audit fix          # Fix security issues automatically
npm update            # Update packages to latest versions
npm outdated          # Show which packages need updates