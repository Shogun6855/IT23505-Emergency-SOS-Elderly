# 🚨 Emergency SOS for Elders
*A Simple Safety Net for Our Loved Ones*

> **This is a prototype** - A college project demonstrating an emergency alert system designed to help elderly people quickly notify their caregivers during emergencies.

## What Does It Do?

Think of this as a digital panic button for seniors. When they're in trouble, they press one button and all their caregivers get instantly notified with their location and status.

### Key Features
- 🆘 **Big Red SOS Button** - One tap sends alerts to everyone
- 📱 **Real-time Notifications** - Caregivers know immediately 
- 👥 **Multiple Caregivers** - Family, friends, neighbors all get notified
- 🗺️ **Location Sharing** - Shows exactly where help is needed
- 💬 **Live Updates** - See who's online and available to help
- 📋 **Simple Dashboard** - Easy to use for all ages

## Tech Stack

**Frontend**
- React.js - User interface framework
- Tailwind CSS - Styling and responsive design
- Socket.io Client - Real-time communication

**Backend**
- Node.js - Runtime environment
- Express.js - Web application framework
- Socket.io - Real-time bidirectional communication
- JSON Web Tokens (JWT) - Authentication

**Database**
- PostgreSQL - Primary database
- Sequelize - ORM for database operations

**DevOps & Tools**
- Docker - Containerization
- npm - Package management
- Git - Version control

## How It Works

1. **Elders** get a simple dashboard with a large SOS button
2. **Caregivers** see who needs help and can respond instantly  
3. **Everyone** stays connected through real-time updates
4. **Emergencies** are tracked and can be marked as resolved

## Getting Started

### What You Need
- A computer with Node.js installed
- PostgreSQL database (or use the Docker setup)
- About 10 minutes to set everything up

### Quick Setup

```bash
# 1. Get the code
git clone <this-repository>
cd emergency-sos-elders

# 2. Install everything
cd backend && npm install
cd ../frontend && npm install

# 3. Set up the database
npm run setup-db

# 4. Start the servers
npm run dev    # This starts both backend and frontend
```

Then visit `http://localhost:3000` and create your first account!

### Using Docker (Easier)
```bash
docker-compose up
```
That's it! Everything runs automatically.

## Project Structure

```
emergency-sos-elders/
├── frontend/          # React web app (what users see)
├── backend/           # Node.js server (handles data)
├── mobile/            # Mobile app (bonus feature)
├── database/          # Database setup and migrations
└── docs/             # Additional documentation
```

## The Tech Behind It

- **Frontend**: React with Tailwind CSS (makes it pretty)
- **Backend**: Node.js with Express (handles the logic)
- **Database**: PostgreSQL (stores user data safely)
- **Real-time**: Socket.io (instant notifications)
- **Styling**: Tailwind CSS (modern, responsive design)

## Demo Accounts

For testing purposes:

**Elder Account:**
- Email: elder@demo.com
- Password: demo123

**Caregiver Account:** 
- Email: caregiver@demo.com  
- Password: demo123

## Screenshots

### 💻 Dashboard Experience

**Elder Dashboard - Main Interface**
![Elder Dashboard](screenshots/Screenshot%202025-09-23%20212537.png)
*Simple, clean interface with the prominent SOS button for emergency alerts*

**Elder Dashboard - SOS Button Active**
![Elder SOS Button](screenshots/Screenshot%202025-09-23%20212954.png)
*Large, accessible emergency button that's easy to press during stressful situations*

**Caregiver Dashboard - Monitoring View**
![Caregiver Dashboard](screenshots/Screenshot%202025-09-23%20213015.png)
*Real-time view of connected elders and active emergency situations*

### 🔐 Authentication & Setup

**Registration Form**
![Registration](screenshots/Screenshot%202025-09-23%20213040.png)
*Simple registration process with clear validation and user-friendly forms*

**Login Interface**
![Login Screen](screenshots/Screenshot%202025-09-23%20213044.png)
*Clean login page with role-based access for elders and caregivers*

### 📱 Mobile Experience

**Mobile Dashboard Interface**
![Mobile Dashboard](mobile-screenshots/WhatsApp%20Image%202025-09-23%20at%2021.36.48_c2927b16.jpg)
*Touch-friendly mobile interface optimized for elderly users*

**Mobile SOS Button & Navigation**
![Mobile SOS](mobile-screenshots/WhatsApp%20Image%202025-09-23%20at%2021.36.49_3ba6ea80.jpg)
*Large emergency button designed for quick access on smartphones*

## Current Limitations (It's a Prototype!)

- 📧 Email notifications need configuration
- 📱 SMS alerts require Twilio setup  
- 🗺️ Location tracking is simulated
- 🔒 Basic security (good enough for demo)
- 📊 Limited emergency history

## Future Ideas

- Mobile app for iOS and Android
- Integration with real emergency services
- Medication reminders
- Health status check-ins
- Video calling during emergencies
- Wearable device support

## Want to Contribute?

This is a learning project, so contributions are welcome! 

1. Fork it
2. Make it better
3. Share your improvements

## Important Notes

⚠️ **This is a prototype for educational purposes.** In real emergencies, always call your local emergency services (911, 112, etc.) first.

## Troubleshooting

**Common Issues:**
- **Can't connect to database?** Make sure PostgreSQL is running
- **Frontend won't start?** Check if port 3000 is available
- **Backend errors?** Check the `.env` file configuration
- **Socket connection fails?** Make sure both servers are running

## License
This project is for educational purposes only - no specific license applies.

---

### Credits

*This prototype was developed as part of a college Software Requirements and Project course. Special thanks to GitHub Copilot for assistance with implementation details and code optimization.* 🥀

**Built with ❤️ for making elderly care more accessible and responsive.**