# Aero Studio

A local-first, privacy-focused workspace for managing and transforming your media files directly in the browser. 100% offline-capable via PWA. No uploads, no servers—just your browser and your data.

---

### Core Features

#### 1. Image Studio
Tools for organizing, managing, and editing your photo library locally.

* **Media Gallery & Albums**
  Manage your entire photo collection with a database-backed grid, album categorization, and batch operations.
  <img width="1888" height="910" alt="photos" src="https://github.com/user-attachments/assets/01cac91c-ebc4-4bbc-98a8-d1ce0679edd2" />
  <img width="1885" height="915" alt="Albums" src="https://github.com/user-attachments/assets/2b7b5545-a995-4312-8d04-94e10f965155" />


  

* **Crop & Transform**
  Perform precise geometric edits including rotation and flipping, cropping using native canvas processing.
  <img width="1872" height="911" alt="Crop" src="https://github.com/user-attachments/assets/3c7ea3ce-082c-464b-bce5-9e008088aed4" />



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
