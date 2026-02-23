# Guess My Name - Mobile & Web App Design

## Overview
A privacy-first face recognition application where users voluntarily register with their photos and names, then use the app to identify other registered users by uploading their photos.

---

## Screen List

### Authentication Screens
1. **Login Screen** - Email + OTP authentication
2. **OTP Verification Screen** - Enter OTP code
3. **Consent & Legal Screen** - GDPR-style consent before registration

### Core Feature Screens
4. **Home/Dashboard Screen** - Main navigation hub
5. **Upload Photo Screen** - Camera capture or gallery selection
6. **Processing Screen** - Loading state during face analysis
7. **Match Results Screen** - Display identified person with confidence score
8. **Profile Screen** - User account info and settings

### User Management Screens
9. **My Registrations Screen** - View all photos user has registered
10. **Settings Screen** - Privacy, notifications, data deletion
11. **Admin Dashboard** (optional) - View metrics and flagged accounts

---

## Primary Content and Functionality

### 1. Login Screen
- **Content:** Email input field, "Send OTP" button
- **Functionality:** 
  - Email validation
  - Send OTP via email
  - Navigation to OTP verification

### 2. OTP Verification Screen
- **Content:** OTP input (6 digits), resend timer, verify button
- **Functionality:**
  - Validate OTP
  - Create/retrieve user session
  - Navigate to consent screen on first login

### 3. Consent & Legal Screen
- **Content:** 
  - Legal disclaimer about ethical use
  - Consent checkbox for data storage
  - Data deletion policy
  - "Accept & Continue" button
- **Functionality:**
  - Store consent status in database
  - Prevent app access without consent
  - Allow users to revoke consent anytime

### 4. Home/Dashboard Screen
- **Content:**
  - Welcome message with user name
  - Large "Upload Photo" button
  - Recent match history (last 5 matches)
  - Quick stats: "Matches found this week"
  - Navigation tabs: Home, My Registrations, Profile
- **Functionality:**
  - Display user's recent activity
  - Quick navigation to upload
  - Show match success rate

### 5. Upload Photo Screen
- **Content:**
  - Camera preview or gallery picker
  - "Take Photo" button
  - "Choose from Gallery" button
  - Preview of selected photo
  - "Analyze Face" button
- **Functionality:**
  - Capture photo from device camera
  - Select photo from gallery
  - Validate image quality
  - Display face detection preview
  - Send to backend for analysis

### 6. Processing Screen
- **Content:**
  - Loading spinner
  - "Analyzing your photo..." message
  - Progress indicator (if available)
- **Functionality:**
  - Show real-time processing status
  - Handle timeout scenarios
  - Allow cancellation

### 7. Match Results Screen
- **Content:**
  - Matched person's name (large, prominent)
  - Confidence score (Low/Medium/High with percentage)
  - Similarity score visualization (0-100%)
  - User's registered photo (if available)
  - "Try Another Photo" button
  - "Save to Favorites" button (optional)
  - "Report False Match" button
- **Functionality:**
  - Display top match with confidence threshold
  - Show "No confident match found" if below threshold
  - Allow user to try again
  - Log match attempt for analytics

### 8. Profile Screen
- **Content:**
  - User name and email
  - Account creation date
  - Total photos registered
  - Privacy settings toggle
  - "Edit Profile" button
  - "Delete Account & All Data" button
  - "Logout" button
- **Functionality:**
  - Display user information
  - Allow profile updates
  - Trigger full data deletion workflow
  - Logout and clear session

### 9. My Registrations Screen
- **Content:**
  - List of all registered photos (grid or list)
  - Each item shows: photo thumbnail, registration date
  - Delete button for each photo
  - "Add New Registration" button
- **Functionality:**
  - Display all user's registered faces
  - Allow deletion of individual photos
  - Navigate to registration form

### 10. Settings Screen
- **Content:**
  - Privacy policy link
  - Terms of service link
  - Data deletion option
  - Notification preferences
  - App version info
- **Functionality:**
  - Open external links
  - Manage notification settings
  - Trigger data deletion

---

## Key User Flows

### Flow 1: User Registration & Onboarding
1. User opens app → **Login Screen**
2. Enters email → **OTP Verification Screen**
3. Enters OTP → **Consent & Legal Screen**
4. Accepts consent → **Home/Dashboard Screen**
5. Taps "Upload Photo" → **Upload Photo Screen**
6. Captures/selects photo → **Processing Screen**
7. Backend validates and stores face embedding → **Home/Dashboard Screen** (success)

### Flow 2: Identify Someone
1. User on **Home/Dashboard Screen**
2. Taps "Upload Photo" → **Upload Photo Screen**
3. Selects photo of target person → **Processing Screen**
4. Backend extracts embedding, searches vector DB → **Match Results Screen**
5. Shows matched name with confidence
6. User can "Try Another Photo" or navigate back to home

### Flow 3: Manage Registrations
1. User on **Home/Dashboard Screen**
2. Taps "My Registrations" → **My Registrations Screen**
3. Views all registered photos
4. Can delete individual photos or add new ones
5. Taps "Add New Registration" → **Upload Photo Screen** (registration mode)

### Flow 4: Account Deletion
1. User on **Profile Screen**
2. Taps "Delete Account & All Data"
3. Confirmation dialog
4. Backend deletes all user data, photos, embeddings
5. User logged out, redirected to **Login Screen**

---

## Color Choices

### Brand Palette (Privacy-First, Trustworthy)
- **Primary:** `#0066CC` (Trust Blue) - Main actions, buttons
- **Secondary:** `#6B21A8` (Purple) - Accent, highlights
- **Success:** `#10B981` (Green) - Match found, confirmations
- **Warning:** `#F59E0B` (Amber) - Low confidence, cautions
- **Error:** `#EF4444` (Red) - Errors, deletions
- **Background:** `#FFFFFF` (Light) / `#0F172A` (Dark)
- **Surface:** `#F3F4F6` (Light) / `#1E293B` (Dark)
- **Text Primary:** `#111827` (Light) / `#F1F5F9` (Dark)
- **Text Secondary:** `#6B7280` (Light) / `#94A3B8` (Dark)

### Design Principles
- **Minimalist:** Clean, spacious layouts
- **Accessible:** High contrast, readable fonts
- **Trustworthy:** Professional, secure appearance
- **Responsive:** Works on mobile portrait (9:16) and web

---

## Technical Constraints

### Mobile (Portrait 9:16)
- Single-column layouts
- Bottom navigation tabs
- Safe area handling (notch, home indicator)
- Touch-friendly buttons (min 44pt)

### Web
- Responsive grid layouts
- Sidebar navigation
- Desktop-optimized spacing
- Keyboard navigation support

### Privacy & Security
- All face embeddings stored server-side
- Photos encrypted at rest
- User consent required before storage
- Data deletion must be permanent
- Rate limiting on API endpoints
- No bulk querying allowed
