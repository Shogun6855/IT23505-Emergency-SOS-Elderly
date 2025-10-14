# 🔐 Demo Account Credentials

## Emergency SOS for Elders - Demo Accounts

This document contains the login credentials for testing the Emergency SOS system.

---

### 👴 Elder Account

**Email:** `elder@demo.com`  
**Password:** `demo123`  
**Role:** Elder  
**Name:** John Elder  
**Phone:** +1234567890  
**Address:** 123 Main St, City, State  
**Medical Info:** Diabetes, High Blood Pressure

**Features Available:**
- 🆘 Trigger emergency SOS alerts
- 💊 Manage medications and reminders
- 📍 Share location with caregivers
- 👥 View connected caregivers
- 📜 View emergency history

---

### 👩‍⚕️ Caregiver Account

**Email:** `caregiver@demo.com`  
**Password:** `demo123`  
**Role:** Caregiver  
**Name:** Jane Caregiver  
**Phone:** +0987654321  
**Address:** 456 Oak Ave, City, State  
**Relationship:** Daughter of John Elder

**Features Available:**
- 🚨 Receive real-time emergency alerts
- 👴 Monitor connected elders
- 💊 Track medication compliance
- 📊 View elder's health status
- ✅ Mark emergencies as resolved

---

## Quick Login URLs

### Local Development
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Network Access (WiFi)
- **Frontend:** http://192.168.20.177:3000
- **Backend API:** http://192.168.20.177:5000

---

## Database Connection

**PostgreSQL Connection String:**
```
postgresql://postgres:wTXRhREDHbxiaMRzsgdAoQVuSjYTTCSf@shinkansen.proxy.rlwy.net:55982/railway
```

**psql Command:**
```bash
psql "postgresql://postgres:wTXRhREDHbxiaMRzsgdAoQVuSjYTTCSf@shinkansen.proxy.rlwy.net:55982/railway"
```

---

## Testing Workflow

### 1. Test Emergency Alert System
1. Login as **Elder** (`elder@demo.com`)
2. Click the large red **SOS** button
3. Open another browser/device
4. Login as **Caregiver** (`caregiver@demo.com`)
5. You should see the emergency alert notification
6. Caregiver can mark the emergency as resolved

### 2. Test Medication Reminders
1. Login as **Elder** (`elder@demo.com`)
2. Navigate to **💊 Medications** tab
3. Add a new medication with:
   - Name: Test Medicine
   - Dosage: 10mg
   - Frequency: Daily
   - Time: (set 2-3 minutes from now for quick testing)
4. Wait for the reminder notification
5. Click "Take" or "Miss" to log the medication
6. Login as **Caregiver** to see medication compliance alerts

### 3. Test Real-time Notifications
1. Open the app in two different browsers/devices
2. Login as Elder in one, Caregiver in another
3. Trigger an SOS from the Elder account
4. Watch the real-time notification appear on the Caregiver dashboard

---

## Important Notes

⚠️ **Security Notice:** These are demo credentials for development and testing purposes only. Do not use these in production.

📝 **Password Hash:** All passwords are securely hashed using bcrypt with a salt round of 10.

🔄 **Database Reset:** If you need to reset the database, run the `complete_schema.sql` file again.

---

## Support

For issues or questions, refer to the main [README.md](./README.md) or check the troubleshooting section.

**Last Updated:** October 14, 2025
