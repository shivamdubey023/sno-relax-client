# SNO-RELAX — Client

**SNO-RELAX** — AI-Assisted Mental Health & Wellness Platform

**Module:** Client (User-facing web application)

**Status:** Final Year Project — Final submission ready

---

## Project Summary
The Client is a React-based single-page application that provides the main user experience: mood tracking and visualization, an AI-guided chatbot for non-dependent guidance, community groups (posting and replies), report upload & summarization, and small engagement features (games). The app implements a global theme system (Brand / Dark / Light) that persists user preference and updates all pages immediately.

> **Academic Declaration:** This module is part of the Final Year Project "SNO-RELAX" and is prepared for academic submission.

---

## Key Features
- Mood tracking with weekly/monthly analytics and charts
- AI chatbot (Cohere-backed) for supportive, non-clinical guidance
- Community groups with real-time messaging (Socket.IO)
- Hospital report upload and AI-based summarization
- Optimistic messaging and therapist notes UX with retry behavior
- Theme system using CSS tokenization and `ThemeContext`

---

## Technology Stack
- React (Create React App)
- Chart.js for data visualization
- Socket.IO client for real-time updates
- Axios / fetch for API communication
- CSS variables (theme tokens) for consistent theming

---

## Quick Start (Development)
1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm start
```

3. Environment variables
Create a `.env` file in the root if you need to override defaults:
- `REACT_APP_API_BASE` — Backend API base URL (default: https://sno-relax-server.onrender.com)

---

## Production
Build the app:
```bash
npm run build
```
Serve the `build/` directory using a static server or hosting provider.

---

## Tests
Run unit and integration tests (Jest + React Testing Library):
```bash
npm test
```

---

## Theming
The client uses a single `ThemeContext` mounted at the application root. Theme selection is persisted to `localStorage` (key: `sno_theme`). Contributors should use CSS variables (eg. `var(--bg-primary)`) rather than hard-coded colors.

---

## Contribution & Contacts
- **Lead Developer / Creator:** Shivam Kumar Dubey — GitHub: https://github.com/shivamdubey023
- **Co-Creator:** Suryakant Mishra

For academic/reuse inquiries contact the authors via repository contact details.

---

## License & Usage
This module is prepared for academic and educational use. For reuse beyond academic review, please contact the project authors.

---
For full academic documentation and architecture details, see the top-level `SNO-RELAX/` folder in this repository.
