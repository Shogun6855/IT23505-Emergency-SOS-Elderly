# 🚨 Emergency SOS for Elders

> **A college project prototype** - An emergency alert system helping elderly people quickly notify caregivers during emergencies.

## Key Features

- 🆘 **SOS Button** - One-tap emergency alerts to all caregivers
- 📱 **Real-time Notifications** - Instant alerts via Socket.io
- 👥 **Multiple Caregivers** - Connect with family, friends, and neighbors
- � **Medication Reminders** - Automated medication tracking and alerts
- � **Simple Dashboard** - Easy-to-use interface for all ages
- ✅ **Check-ins** - Regular wellness monitoring
- � **Battery Alerts** - Low battery notifications

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express.js, Socket.io, JWT Authentication
- **Database**: PostgreSQL
- **Real-time**: Socket.io for instant notifications
- **Scheduling**: Node-cron for medication reminders

## Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- npm

### Installation

**1. Clone and Setup Database**
```bash
git clone https://github.com/Shogun6855/IT23505-Emergency-SOS-Elderly.git
cd IT23505-Emergency-SOS-Elderly
npm install
npm run setup-db
```

**2. Configure Backend**
Create `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/emergency_sos"
JWT_SECRET="your-secret-key-here"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

**3. Install Dependencies & Run**
```bash
npm run install-deps
npm run dev
```

The app will be available at `http://localhost:3000`


## Demo Accounts

- **Elder**: `elder@demo.com` / `demo123`
- **Caregiver**: `caregiver@demo.com` / `demo123`

## Project Structure

```
emergency-sos-elders/
├── backend/           # Node.js server
│   ├── controllers/   # API logic
│   ├── services/      # Background services
│   ├── routes/        # API endpoints
│   └── database/      # Schema & migrations
├── frontend/          # React web app
│   └── components/    # UI components
└── mobile/           # React Native app (optional)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to database | Ensure PostgreSQL is running on port 5432 |
| Backend won't start | Check `backend/.env` file exists with correct credentials |
| Port already in use | Change PORT in backend or frontend config |
| Missing dependencies | Run `npm run install-deps` from root |

For detailed setup help, see [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)

## License

Educational project - no specific license

---

**Built with ❤️ for making elderly care more accessible**