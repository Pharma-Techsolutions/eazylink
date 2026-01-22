# EazyLink

> Smart connectivity platform for travelers and digital nomads

## Overview

EazyLink keeps you connected anywhere in the world by intelligently switching between WiFi, eSIM, and cellular networks. Never lose connection again.

## Features

### Mobile App (React Native)
- 📶 Real-time network detection and quality scoring
- 📡 WiFi network scanning with recommendations
- 📞 Voice calling (WiFi-to-WiFi, international)
- 🌍 Works globally on any WiFi network
- 🔒 Secure, encrypted connections

### Backend API (FastAPI)
- 🔐 Secure authentication (JWT + Argon2)
- 🛡️ Rate limiting and DDoS protection
- ✅ Input validation (SQL injection prevention)
- 🔒 Security headers (XSS, clickjacking protection)
- 📊 PostgreSQL database
- 📚 Interactive API documentation

## Tech Stack

**Mobile:**
- React Native (Expo)
- Agora.io (voice calling)
- Expo Network API

**Backend:**
- FastAPI (Python)
- PostgreSQL
- Argon2 password hashing
- JWT authentication
- SQLAlchemy ORM

## Project Status

🚧 **MVP Phase** - Active development

### Completed
- ✅ Mobile app with network detection
- ✅ WiFi scanning and quality scoring
- ✅ Voice calling (international)
- ✅ Secure backend API
- ✅ User authentication
- ✅ Rate limiting
- ✅ Security features

### Roadmap
- [ ] eSIM marketplace integration
- [ ] Premium subscriptions
- [ ] Connection history analytics
- [ ] Satellite connectivity guide
- [ ] Enterprise features

## Quick Start

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## Security

- Argon2 password hashing (more secure than bcrypt)
- JWT token authentication
- Rate limiting (prevent brute force attacks)
- Input validation and sanitization
- CORS protection
- Security headers (XSS, clickjacking prevention)
- No sensitive data in error messages

## License

Proprietary - © 2025 EazyLink

## Contact

For inquiries: contact@flowtada.com
