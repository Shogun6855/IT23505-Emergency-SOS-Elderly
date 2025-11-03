# Database Setup Guide

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
npm run setup-db
```

OR

```bash
node setup-local-database.js
```

OR (Windows)

```bash
setup-local-database.bat
```

### Option 2: Manual Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/
   - Remember your password for the `postgres` user

2. **Start PostgreSQL Service**
   - Windows: Services → PostgreSQL → Start
   - Linux/Mac: `sudo service postgresql start` or `brew services start postgresql`

3. **Create Database**
   ```bash
   psql -U postgres
   ```
   Then in psql:
   ```sql
   CREATE DATABASE emergency_sos;
   \q
   ```

4. **Run Schema**
   ```bash
   psql -U postgres -d emergency_sos -f backend/database/complete_schema.sql
   ```

## Configuration

### Default Connection (Local)

The application defaults to:
```
postgresql://postgres:postgres@localhost:5432/emergency_sos
```

### Custom Configuration

If your PostgreSQL uses different credentials, update `setup-local-database.js`:

```javascript
const LOCAL_DB_CONFIG = {
  user: 'your_username',
  host: 'localhost',
  password: 'your_password',
  port: 5432,
};
```

### Using Environment Variables

Create a `.env` file in the root or `backend` directory:

```env
# Local Database
LOCAL_DB_URL=postgresql://postgres:your_password@localhost:5432/emergency_sos

# OR use DATABASE_URL for remote database
DATABASE_URL=postgresql://user:pass@host:port/database
```

## Database Schema

The complete schema includes:

### Tables Created:
1. **users** - User accounts (elders and caregivers)
2. **emergencies** - Emergency SOS alerts
3. **user_caregivers** - Elder-caregiver relationships
4. **notifications** - System notifications
5. **medications** - Medication schedules
6. **medication_logs** - Medication adherence logs
7. **check_ins** - "I'm Okay" check-in records
8. **battery_alerts** - Low battery alerts

### Demo Users

After setup, you can login with:
- **Elder**: `elder@demo.com` / `demo123`
- **Caregiver**: `caregiver@demo.com` / `demo123`

## Verification

After setup, verify the database:

```bash
psql -U postgres -d emergency_sos
```

```sql
-- Check tables
\dt

-- Check users
SELECT id, email, name, role FROM users;

-- Check demo data
SELECT * FROM user_caregivers;
```

## Troubleshooting

### Error: Connection Refused

**Problem**: PostgreSQL is not running

**Solution**:
- Windows: Start PostgreSQL service from Services
- Linux: `sudo service postgresql start`
- Mac: `brew services start postgresql`

### Error: Authentication Failed

**Problem**: Wrong username/password

**Solution**: 
1. Update credentials in `setup-local-database.js`
2. Or create `.env` file with correct credentials
3. Or reset PostgreSQL password

### Error: Database Already Exists

**Problem**: Database was already created

**Solution**: 
- This is fine! The script will use the existing database
- To reset: `DROP DATABASE emergency_sos;` then rerun setup

### Error: Permission Denied

**Problem**: User doesn't have permission to create database

**Solution**: 
- Use `postgres` superuser account
- Or grant permissions: `GRANT ALL PRIVILEGES ON DATABASE emergency_sos TO your_user;`

## Reset Database

To completely reset the database:

```bash
psql -U postgres
```

```sql
DROP DATABASE emergency_sos;
CREATE DATABASE emergency_sos;
\q
```

Then rerun: `npm run setup-db`

## Next Steps

After database setup:

1. **Install dependencies**:
   ```bash
   npm run install-deps
   ```

2. **Start the application**:
   ```bash
   npm run dev:alt
   ```

3. **Register new users**:
   - Go to `/register`
   - Choose role: Elder or Caregiver
   - Fill in details and create account

4. **Assign caregivers** (if elder):
   - Login as elder
   - Go to home screen
   - Click "Add or Manage Caregivers"
   - Add caregiver by email

## Support

If you encounter issues:
1. Check PostgreSQL is running
2. Verify connection credentials
3. Check logs in `backend/logs/`
4. Ensure port 5432 is available

