# Guess My Name

A modern face recognition application that identifies registered users by their photos. Built with React Native, Expo, Node.js, and AI-powered face detection.

## 🎯 Overview

**Guess My Name** is a privacy-first face recognition system designed for voluntary user identification. Users register their photos with consent, and the app can match query photos against the registered database using LLM-powered face analysis.

### Key Features

- **📸 Face Registration** - Users upload photos with their name for registration
- **🔍 Face Matching** - Upload a photo to find matches against registered users
- **🛡️ Privacy First** - GDPR-compliant with full data deletion support
- **✅ Consent Management** - Explicit user consent before storing any photos
- **📊 Match Confidence** - Similarity scores and confidence levels for each match
- **⏱️ Rate Limiting** - Protection against abuse (5 registrations/hour, 20 matches/hour)
- **📱 Cross-Platform** - Works on iOS, Android, and Web
- **🔐 Secure Storage** - S3-encrypted photo storage with audit logging

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React Native 0.81 with Expo SDK 54
- React 19 with TypeScript
- NativeWind (Tailwind CSS for React Native)
- Expo Router for navigation
- React Query for server state management
- tRPC client for type-safe API calls

**Backend:**
- Node.js with Express
- tRPC for type-safe API
- PostgreSQL with Drizzle ORM
- pgvector for vector embeddings
- Manus LLM API for face detection and matching
- AWS S3 for photo storage
- Manus OAuth for authentication

**Database Schema:**
- `users` - User accounts with OAuth integration
- `consent_logs` - GDPR consent tracking
- `face_registrations` - Registered photos with metadata
- `match_history` - Query history and results
- `rate_limit_logs` - Rate limiting enforcement
- `audit_logs` - Comprehensive activity logging

## 📁 Project Structure

```
guess-my-name/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation (Home, Profile)
│   │   └── index.tsx            # Home/Dashboard screen
│   ├── consent.tsx              # GDPR consent screen
│   ├── upload.tsx               # Photo upload screen
│   ├── results.tsx              # Match results screen
│   ├── profile.tsx              # User profile screen
│   └── _layout.tsx              # Root layout with providers
├── server/
│   ├── routers.ts               # tRPC API endpoints
│   ├── db.ts                    # Database query helpers
│   ├── storage.ts               # S3 storage integration
│   ├── _core/
│   │   ├── llm.ts               # LLM API integration
│   │   ├── trpc.ts              # tRPC setup
│   │   └── cookies.ts           # Session management
│   └── _core/index.ts           # Server entry point
├── drizzle/
│   └── schema.ts                # Database schema definitions
├── components/
│   ├── screen-container.tsx     # SafeArea wrapper
│   ├── themed-view.tsx          # Theme-aware view
│   └── ui/
│       └── icon-symbol.tsx      # Icon mapping
├── hooks/
│   ├── use-auth.ts              # Authentication hook
│   ├── use-colors.ts            # Theme colors hook
│   └── use-color-scheme.ts      # Dark mode detection
├── lib/
│   ├── trpc.ts                  # tRPC client setup
│   └── utils.ts                 # Utility functions
├── theme.config.js              # Tailwind color tokens
├── tailwind.config.js           # Tailwind configuration
├── app.config.ts                # Expo configuration
├── package.json                 # Dependencies
└── tests/
    └── api.test.ts              # Unit tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (for native testing)
- Manus account with API access

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd guess-my-name
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file with:
   ```env
   MANUS_API_KEY=your_api_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/guess_my_name
   S3_BUCKET=your-s3-bucket
   S3_REGION=us-east-1
   S3_ACCESS_KEY=your_access_key
   S3_SECRET_KEY=your_secret_key
   ```

4. **Initialize the database:**
   ```bash
   pnpm db:push
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

   This will start both the Expo Metro bundler (port 8081) and the Node.js API server (port 3000).

### Testing

Run the test suite:
```bash
pnpm test
```

Run type checking:
```bash
pnpm check
```

## 📱 Usage

### For Users

1. **Sign In** - Authenticate with Manus OAuth
2. **Accept Consent** - Review and accept the privacy policy
3. **Register Photos** - Upload photos with your name (up to 5 per hour)
4. **Find Matches** - Upload a photo to search for registered users (up to 20 per hour)
5. **View Results** - See matched person with confidence score

### For Developers

#### API Endpoints

**Consent Management:**
```typescript
POST /trpc/consent.record
GET /trpc/consent.check
```

**Face Registration:**
```typescript
POST /trpc/face.register
GET /trpc/face.listMy
DELETE /trpc/face.delete
```

**Face Matching:**
```typescript
POST /trpc/match.find
GET /trpc/match.history
```

**User Profile:**
```typescript
GET /trpc/user.profile
DELETE /trpc/user.deleteAccount
```

#### Example: Register a Face

```typescript
const result = await trpc.face.register.mutate({
  photoBase64: "base64_encoded_image",
  registeredName: "John Doe",
  mimeType: "image/jpeg"
});
```

#### Example: Find a Match

```typescript
const result = await trpc.match.find.mutate({
  photoBase64: "base64_encoded_image",
  mimeType: "image/jpeg"
});

// Response
{
  matched: true,
  matchedName: "Jane Smith",
  similarityScore: 0.87,
  confidenceLevel: "high"
}
```

## 🔐 Security & Privacy

### Data Protection

- **Encryption at Rest:** All photos stored in S3 with encryption
- **Encryption in Transit:** HTTPS for all API calls
- **Access Control:** OAuth-based authentication with session tokens
- **Rate Limiting:** Prevents abuse and DoS attacks
- **Audit Logging:** All actions logged for compliance

### GDPR Compliance

- **Explicit Consent:** Users must accept privacy policy before registration
- **Data Deletion:** Users can delete their account and all data anytime
- **Data Portability:** User data can be exported on request
- **Consent Tracking:** All consent decisions logged with timestamps
- **Right to be Forgotten:** Complete data removal within 24 hours

### Ethical Guidelines

This app is designed for **voluntary face registration only**. It must not be used for:
- Surveillance without consent
- Identifying individuals without permission
- Discriminatory profiling
- Unauthorized tracking

## 📊 Database Schema

### users
```sql
id, email, name, lastSignedIn, createdAt
```

### consent_logs
```sql
id, userId, consentGiven, ipAddress, userAgent, createdAt
```

### face_registrations
```sql
id, userId, photoUrl, registeredName, qualityScore, faceDetected, metadata, createdAt
```

### match_history
```sql
id, userId, queryPhotoUrl, matchedUserId, matchedName, similarityScore, confidenceLevel, createdAt
```

### rate_limit_logs
```sql
id, userId, action, count, windowStart, windowEnd
```

### audit_logs
```sql
id, userId, action, resource, details, timestamp
```

## 🧪 Testing

The project includes comprehensive unit tests for:
- Database functions (consent, registration, matching)
- API validation (input types, ranges)
- Error handling (missing consent, rate limits, no faces)
- Rate limiting logic

Run tests with:
```bash
pnpm test
```

## 🚢 Deployment

### Building for Production

**Web:**
```bash
pnpm build
pnpm start
```

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

### Environment Variables

Set these in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `MANUS_API_KEY` - Manus API key
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` - AWS S3 credentials
- `NODE_ENV` - Set to "production"

## 📝 API Documentation

### Response Format

All API responses follow the tRPC format:
```typescript
{
  result: {
    data: T  // Success response
  }
}
```

Error responses:
```typescript
{
  error: {
    message: string,
    code: string
  }
}
```

### Rate Limits

- **Face Registration:** 5 per hour per user
- **Face Matching:** 20 per hour per user
- **API Calls:** 100 per minute per user

## 🐛 Troubleshooting

### Common Issues

**"No face detected"**
- Ensure the photo clearly shows a face
- Try a different angle or lighting
- Ensure the face is at least 50x50 pixels

**"Rate limit exceeded"**
- Wait for the rate limit window to reset (1 hour)
- Check your usage with `trpc.user.profile.useQuery()`

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network connectivity

**"S3 upload failed"**
- Verify AWS credentials
- Check S3 bucket permissions
- Ensure bucket exists in the specified region

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@guessmy.name
- Documentation: https://docs.guessmy.name

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Powered by [Manus](https://manus.im) AI and infrastructure
- Styled with [NativeWind](https://www.nativewind.dev)
- Type-safe APIs with [tRPC](https://trpc.io)

---

**Last Updated:** February 2026
**Version:** 1.0.0
