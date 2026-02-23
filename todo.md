# Guess My Name - Project TODO

## Phase 1: Project Setup & Infrastructure
- [x] Create app logo and update branding (icon, splash, favicon)
- [x] Update app.config.ts with app name and branding
- [x] Set up database schema (users, face_embeddings, match_history, consent_logs)
- [x] Configure tRPC API structure
- [x] Set up S3 storage for user photos
- [x] Configure authentication (Manus OAuth)

## Phase 2: Backend API Development
- [x] Implement user authentication endpoints (login, verify OTP, logout)
- [x] Implement consent management endpoints (store, revoke, check)
- [x] Implement face registration endpoint (upload photo, extract embedding, store)
- [x] Implement face matching endpoint (search vector DB, return top matches)
- [x] Implement user profile endpoints (get, update, delete)
- [x] Implement photo management endpoints (list, delete)
- [x] Implement match history endpoints (log, retrieve)
- [x] Add rate limiting middleware
- [x] Add data validation and error handling
- [x] Add logging and monitoring

## Phase 3: Frontend - Mobile & Web UI
### Authentication Screens
- [x] Login screen (email input, OTP send) - handled by Manus OAuth
- [x] OTP verification screen (6-digit input, resend timer) - handled by Manus OAuth
- [x] Consent & legal screen (disclaimer, checkbox, accept button)

### Core Feature Screens
- [x] Home/Dashboard screen (welcome, recent matches, quick upload)
- [x] Upload photo screen (camera capture, gallery picker, preview)
- [ ] Processing screen (loading state, progress indicator) - handled by mutation loading state
- [x] Match results screen (name, confidence score, visualization)
- [x] Profile screen (user info, settings, logout, delete account)
- [ ] My registrations screen (list of registered photos, delete option)
- [ ] Settings screen (privacy, notifications, data deletion)

### Navigation & Layout
- [x] Tab bar navigation (Home, Profile)
- [x] Screen container with safe area handling
- [x] Responsive design for mobile and web
- [x] Dark mode support

## Phase 4: Feature Integration
- [ ] Wire up login flow (email → OTP → consent → home)
- [ ] Wire up photo upload (capture/select → preview → upload → processing)
- [ ] Wire up face matching (upload → backend analysis → results display)
- [ ] Wire up profile management (view, edit, delete account)
- [ ] Wire up registration management (list, add, delete)
- [ ] Implement error handling and user feedback
- [ ] Implement loading states and animations
- [ ] Test end-to-end user flows

## Phase 5: Advanced Features & Polish
- [ ] Implement match history tracking
- [ ] Add confidence score visualization
- [ ] Add "No match found" handling
- [ ] Implement data deletion workflow
- [ ] Add analytics/metrics tracking
- [ ] Implement rate limiting feedback
- [ ] Add offline error handling
- [ ] Optimize image processing

## Phase 6: Security & Compliance
- [ ] Implement GDPR consent workflow
- [ ] Ensure data encryption at rest
- [ ] Implement secure photo deletion
- [ ] Add audit logging for data access
- [ ] Implement anti-abuse measures
- [ ] Add legal disclaimer enforcement
- [ ] Test security vulnerabilities
- [ ] Add privacy policy and terms

## Phase 7: Testing & Deployment
- [ ] Write unit tests for backend
- [ ] Write integration tests for API
- [ ] Write component tests for UI
- [ ] Test on iOS and Android devices
- [ ] Test on web browsers
- [ ] Performance testing
- [ ] Load testing
- [ ] Create deployment configuration
- [ ] Set up CI/CD pipeline

## Phase 8: Documentation & Delivery
- [ ] Write API documentation (OpenAPI/Swagger)
- [ ] Write user guide
- [ ] Write deployment guide
- [ ] Create admin panel documentation
- [ ] Prepare project for delivery
