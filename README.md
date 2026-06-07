# Aero Studio

A local-first, privacy-focused workspace for managing and transforming your media files directly in the browser. 100% offline-capable via PWA. No uploads, no servers—just your browser and your data.

---

### Core Features

#### 1. Image Studio
Tools for organizing, managing, and editing your photo library locally.

* **Media Gallery & Albums**
  Manage your entire photo collection with a database-backed grid, album categorization, and batch operations.
 <img width="1495" height="908" alt="with side panel" src="https://github.com/user-attachments/assets/d9dab30f-7179-449e-bb65-d392e28767a8" />

 <img width="1119" height="907" alt="albums" src="https://github.com/user-attachments/assets/a2b3eec4-cabb-40b6-a281-e7b31baad570" />



  



* **Crop & Transform**
  Perform precise geometric edits including rotation and flipping, cropping using native canvas processing.
  <img width="843" height="892" alt="crop and rotate" src="https://github.com/user-attachments/assets/55784d2f-359d-412a-a975-270da97d48fe" />




#### 2. Document Suite (Coming Soon)
* **PDF Studio**
  Local-first tools for viewing, merging, and splitting PDF documents without third-party services.

#### 3. Video Lab (Coming Soon)
* **Video Studio**
  Local video management and frame-capture utilities.

---

### Why Offline-First?
Aero Studio is built as a **Progressive Web App (PWA)**. Once you load the site once, it installs to your device and functions entirely without an internet connection. Your media never leaves your hardware, providing true data sovereignty.

### Tech Stack
* **React + Vite:** Modern, reactive UI architecture.
* **Dexie.js:** High-performance local IndexedDB storage.
* **HTML5 Canvas:** Hardware-accelerated client-side image processing.
* **React Router:** URL-driven state management for deep-linking.

---

### Privacy Commitment
Your data is yours. Since all processing occurs within your browser's sandboxed environment, your files are never transmitted to a server.
