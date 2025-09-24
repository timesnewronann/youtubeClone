## ** YouTube Clone - Video Processing & Authentication**

A full-stack **YouTube Clone** using **Next.js, Firebase, Google Cloud Storage, Cloud Run, and FFmpeg** for **video processing** and **user authentication**.

### ** Features**

 **User Authentication** - Google Sign-In with Firebase Auth  
 **Video Processing Service** - Converts videos to 360p before upload  
 **Google Cloud Storage** - Stores raw and processed videos  
 **Cloud Functions** - Automatically stores user data in Firestore on sign-up  
 **Next.js Frontend** - Fully responsive UI with authentication & video management  
 **Dockerized Backend** - FFmpeg video processing runs inside containers

---

## **Project Structure**

```
youtubeClone/
├── yt-web-client/        # Frontend (Next.js)
│   ├── app/
│   │   ├── firebase/     # Firebase authentication & Firestore config
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Next.js pages
│   ├── public/           # Static assets
│   ├── .env.local        # Environment variables (NOT COMMITTED)
│   ├── .gitignore        # Git ignore list (secrets & build files)
│   ├── package.json      # Frontend dependencies
│
├── yt-api-service/       # Backend API (Google Cloud Functions)
│   ├── functions/src/    # Firebase Functions (user creation, video handling)
│   ├── .env.local        # Firebase API keys (NOT COMMITTED)
│   ├── package.json      # Backend dependencies
│
├── video-processing-service/  # Dockerized FFmpeg Video Processing
│   ├── src/             # Video processing logic
│   ├── Dockerfile       # Docker setup
│   ├── cloud-run.yaml   # Google Cloud Run deployment
│
├── README.md            # This file (Project Overview)
└── .gitignore           # Ignore sensitive files
```

---

## ** Tech Stack**

| **Technology**           | **Purpose**                                 |
| ------------------------ | ------------------------------------------- |
| **Next.js**              | Frontend UI (React-based)                   |
| **Firebase Auth**        | Google authentication                       |
| **Firestore**            | Stores user profiles & video metadata       |
| **Google Cloud Storage** | Stores raw & processed videos               |
| **Cloud Functions (v2)** | Before user creation event handling         |
| **FFmpeg**               | Video conversion to 360p                    |
| **Docker**               | Containerized video processing              |
| **Google Cloud Run**     | Runs FFmpeg processing in a managed service |

---

## **🔧 Setup & Installation**

### **1️ Clone the Repository**

```bash
git clone https://github.com/your-username/youtubeClone.git
cd youtubeClone
```

### **2️ Install Dependencies**

####  **Frontend (Next.js)**

```bash
cd yt-web-client
npm install
```

####  **Backend (Firebase Functions)**

```bash
cd yt-api-service/functions
npm install
```

####  **Video Processing Service**

```bash
cd video-processing-service
docker build -t video-processing-service .
```

---

## ** Environment Variables (`.env.local`)**

Each service requires environment variables stored in `.env.local`.  
**DO NOT COMMIT** these files.

 **Frontend (`yt-web-client/.env.local`)**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

 **Backend (`yt-api-service/.env.local`)**

```env
FIREBASE_ADMIN_SDK_KEY=your-firebase-admin-key
FIREBASE_DATABASE_URL=your-database-url
```

---

## ** Running the Project**

### **Frontend (Next.js)**

```bash
cd yt-web-client
npm run dev
```

 Runs at: **`http://localhost:3000`**

### **Backend (Firebase Functions)**

```bash
cd yt-api-service/functions
firebase emulators:start
```

 Opens Firebase Emulator UI at **`http://localhost:4000`**

### **Dockerized Video Processing**

```bash
cd video-processing-service
docker run -p 3000:3000 video-processing-service
```

 Runs **FFmpeg Video Processing** inside a Docker container.

---

## ** Core Functionalities**

### ** User Authentication**

 Users can log in with **Google Sign-In**  
 **Firestore** stores user info when an account is created  
 **Uses `beforeUserCreated` Cloud Function**

### ** Video Upload & Processing**

 Raw videos are uploaded to **Google Cloud Storage**  
 **Cloud Function triggers** `process-video` in Cloud Run  
 FFmpeg **converts the video to 360p** before storing

---

## ** Deployment**

### ** Firebase Functions**

```bash
firebase deploy --only functions
```

### ** Cloud Run Deployment**

```bash
gcloud run deploy video-processing-service \
  --image us-west2-docker.pkg.dev/yt-clone/video-processing-repo/video-processing-service:latest \
  --platform managed --region us-west2
```

---

## ** Common Issues & Fixes**

### **1️ `.env.local` Not Working?**

- Run:
  ```bash
  git check-ignore -v yt-web-client/.env.local
  ```
- If `.env.local` is NOT ignored, add it to `.gitignore` and remove it from Git.

### **2️ Firebase User Not Created in Firestore?**

- Ensure `beforeUserCreated` function is **enabled in Firebase Console → Authentication → Blocking Functions**.
- Run `firebase logs` to check errors.

### **3️ Docker Build Issues?**

- If `amd64` errors occur, try:
  ```bash
  docker buildx build --platform linux/amd64 -t video-processing-service .
  ```

---

## ** Future Features**

 **[ ] Video Thumbnails** - Generate thumbnails during processing  
 **[ ] Video Playback** - Implement a player with seeking & buffering  
 **[ ] Video Metadata** - Store more details in Firestore  
 **[ ] Comments & Likes** - Allow users to interact with videos

---

## ** Contributors**

- **@timesnewronan** - Backend & Cloud Infrastructure

---

## ** License**

 This project is **MIT Licensed** – Feel free to use, modify, and distribute.
