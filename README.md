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
- � **Medication Reminders** - Never miss important medications again
- �📋 **Simple Dashboard** - Easy to use for all ages

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
- Node-cron - Scheduled medication reminders

**Database**
- PostgreSQL - Primary database
- Sequelize - ORM for database operations

**DevOps & Tools**
- Docker - Containerization
- npm - Package management
- Git - Version control

## How It Works

1. **Elders** get a simple dashboard with a large SOS button and medication tracking
2. **Caregivers** see who needs help and monitor medication compliance
3. **Everyone** stays connected through real-time updates and health notifications
4. **Emergencies** are tracked and can be marked as resolved
5. **Medications** are scheduled with automatic reminders and missed dose alerts

## Getting Started

### Prerequisites
- **Node.js**: Make sure you have Node.js (v14 or later) installed.
- **npm**: Node Package Manager, comes with Node.js.
- **PostgreSQL**: A running instance of PostgreSQL.
- **Docker** (Optional): For an easier setup, you can use Docker and Docker Compose.

### Installation & Setup

Follow these steps to get the project running on your local machine.

**1. Clone the Repository**
```bash
git clone https://github.com/Shogun6855/IT23505-Emergency-SOS-Elderly.git
cd IT23505-Emergency-SOS-Elderly
```

**2. Backend Setup**
The backend server runs on Node.js and connects to the PostgreSQL database.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file from the example
# (You'll need to configure your database connection string here)
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
cp .env.example .env

# Run database migrations and seed initial data
npm run migrate
npm run seed

# Start the backend server
npm start
```
> The backend will be running at `http://localhost:5000`.

**3. Frontend Setup**
The frontend is a React application.

```bash
# Navigate to the frontend directory from the root
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```
> The frontend will open automatically at `http://localhost:3000`.

**4. Mobile App Setup (Expo)**
The mobile app is built with React Native and Expo.

```bash
# Navigate to the mobile directory from the root
cd mobile

# Install dependencies
npm install

# Start the Expo development server
npm start
```
> This will open the Expo developer tools in your browser. You can run the app on a simulator or scan the QR code with the Expo Go app on your phone.

### All-in-One Development Server
From the root directory, you can run both the frontend and backend concurrently for development.

```bash
# From the root project directory
npm install # Installs root-level dependencies like 'concurrently'
npm run dev
```

### Using Docker (The Easy Way)
If you have Docker and Docker Compose installed, you can get everything running with a single command.

```bash
# From the root project directory
docker-compose up --build
```
This command will:
- Build the Docker images for the frontend, backend, and database.
- Start all the services.
- Automatically handle networking between containers.

> The application will be available at `http://localhost:3000`.


## 💊 Medication Reminders Feature

### What It Does
Our medication reminder system helps elders stay on top of their health by:

- **Smart Scheduling**: Set up daily, twice daily, or custom medication schedules
- **15-Minute Advance Warnings**: Get reminded before it's time to take medicine
- **One-Tap Confirmation**: Easy "Take" or "Miss" buttons on notifications
- **Caregiver Alerts**: Family gets notified if medications are missed
- **Automatic Tracking**: System tracks adherence patterns and missed doses
- **Flexible Timing**: Support for complex medication schedules

### How to Use

**For Elders:**
1. Click the "💊 Medications" tab on your dashboard
2. Add medications with name, dosage, and time schedule
3. Get reminded 15 minutes before each dose
4. Tap "Take" when you've taken your medicine
5. View your daily medication schedule

**For Caregivers:**
1. Switch to "💊 Medication Monitoring" tab
2. See real-time alerts when elders miss medications
3. Monitor adherence patterns and health trends
4. Get instant notifications about medication compliance

### Technical Features
- **Real-time notifications** via Socket.io
- **Automatic missed detection** after 30 minutes
- **Daily schedule generation** for the next 7 days
- **Database tracking** of all medication events
- **REST API** for medication management
- **Cron-based reminders** running every minute

## Project Structure

```
emergency-sos-elders/
├── frontend/          # React web app (what users see)
│   ├── components/
│   │   ├── Elder/     # Elder dashboard with SOS & medication management
│   │   └── Caregiver/ # Caregiver monitoring and alerts
├── backend/           # Node.js server (handles data)
│   ├── controllers/   # API logic including medication controller
│   ├── services/      # Background services (medication reminders)
│   └── routes/        # API endpoints including medication routes
├── mobile/            # Mobile app (bonus feature)
├── database/          # Database setup and migrations
│   └── migrations/    # Including medication tables (005_create_medications_table.sql)
└── docs/             # Additional documentation
```

## The Tech Behind It

- **Frontend**: React with Tailwind CSS (makes it pretty)
- **Backend**: Node.js with Express (handles the logic)
- **Database**: PostgreSQL (stores user data safely)
- **Real-time**: Socket.io (instant notifications)
- **Scheduling**: Node-cron (automated medication reminders)
- **Styling**: Tailwind CSS (modern, responsive design)

## Demo Accounts

For testing purposes:

**Elder Account:**
- Email: elder@demo.com
- Password: demo123
- Features: SOS button, medication management, reminders

**Caregiver Account:** 
- Email: caregiver@demo.com  
- Password: demo123
- Features: Emergency monitoring, medication oversight, real-time alerts

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
- 💊 Medication adherence statistics are basic

## Future Ideas

- Mobile app for iOS and Android
- Integration with real emergency services
- Advanced medication adherence analytics
- Health status check-ins and vital signs tracking
- Video calling during emergencies
- Wearable device support (smartwatches, fitness trackers)
- AI-powered health pattern recognition
- Integration with pharmacy systems for automatic refills

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
- **Medication reminders not working?** Ensure the backend cron service is running

## Testing the Medication Feature

**Quick Test Steps:**
1. Login as an elder
2. Go to "💊 Medications" tab
3. Add a test medication with time 2-3 minutes from now
4. Wait for the reminder notification (15 minutes early in production, but you can test with immediate notifications)
5. Click "Take" or "Miss" to test the tracking
6. Login as a caregiver to see the alerts

**Database Commands for Testing:**
```sql
-- View all medications
SELECT * FROM medications;

-- View today's medication logs
SELECT * FROM medication_logs WHERE DATE(scheduled_time) = CURRENT_DATE;

-- Check medication reminder service status
-- Look for "Medication reminder service initialized" in backend logs
```

## License
This project is for educational purposes only - no specific license applies.

---

### Credits

*This prototype was developed as part of a college Software Requirements and Project course. Special thanks to GitHub Copilot for assistance with implementation details and code optimization.* 🥀

**Built with ❤️ for making elderly care more accessible and responsive.**