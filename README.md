# LostLink
LostLink Full-Stack App
A modern, full-stack LostLink application designed to help users within an Organization (officlecollege) easily register lost or found items, upload images directly into MongoDB, and connect with claimants via integrated chat. Featuring robust user authentication, admin moderation, and seamless image handling without relying on external storage.

🌐 Live: Successfully deployed on Vercel for fast, reliable, and scalable hosting.

🚀 Features
User Authentication: Secure login and signup with JWT tokens stored in HTTP-only cookies.

Item Management: Users can add found items with detailed descriptions, location, and images.

Image Storage: Images up to 16 MB are directly stored as binary data in MongoDB and served as Base64 data URLs — no external file storage or cloud needed.

Admin Dashboard: Moderators can approve items, manage claims, and update statuses.

Real-time Chat: Users can chat about items with claimants through a dedicated chatbox.

Profile Page: Users view and manage their listed items with images and status.

SSR and CSR Support: Smooth server-side and client-side rendering with Next.js.

📁 Project Structure Highlights
models/itemModel.ts — Mongoose schema updated to store images as binary buffers and MIME types.

API Routes — Modular Next.js API endpoints for all CRUD, authentication, and image-serving.

Pages — React/Next.js components for Add Item form, Admin dashboard, Home page, Profile page, and Chatbox.

Authentication Helpers — Centralized token and user session utilities for secure access.

💡 Why This Project?
This app serves as a modern, Organization-oriented lost & found portal:

Simplifies image uploads by storing them directly in the database.

Provides a moderated environment through admin approvals.

Enhances user communication with chat integration.

Ensures secure and reliable authentication.

Built with performance and scalability in mind.

⚙️ Tech Stack
Framework: Next.js + React

Database: MongoDB with Mongoose

Auth: JWT + HTTP-only cookies

Image Handling: MongoDB Binary Buffers + Base64 URLs

Hosting: Vercel (live and fully functional)

Styling: Tailwind CSS

📚 Getting Started
Prerequisites
Node.js >= 18.x

MongoDB database Atlas (cloud)

Experience it live! Check out the fully deployed LostLink app on Vercel — https://lost-link-eta.vercel.app/   🚀
