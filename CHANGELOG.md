# Changelog

All notable changes to the Emergency SOS for Elders project.

---

## [2025-11-05] - Bug Fixes and Configuration Updates

### Fixed
- **Backend File Path Issues** (17:03 UTC)
  - Fixed incorrect import paths in `reportController.js`
  - Changed `./config/database` to `../config/database`
  - Changed `./utils/logger` to `../utils/logger`
  - Backend now starts successfully without module not found errors

- **Twilio Configuration** (17:31 UTC)
  - Added validation to check if Twilio credentials start with 'AC' before initializing client
  - Prevents crash when Twilio credentials are not configured
  - SMS functionality gracefully disabled when credentials are missing
  - Updated `backend/services/smsService.js`

- **Backend Environment Configuration** (17:06 UTC)
  - Created `backend/.env` file with required environment variables
  - Added `DATABASE_URL` for PostgreSQL connection
  - Added `JWT_SECRET` for authentication token signing
  - Added placeholder Twilio credentials

- **Caregiver Management Logic** (17:45 UTC)
  - Fixed caregiver relationship management in `userController.js`
  - System now properly handles inactive caregiver relationships
  - When adding an existing but inactive caregiver, the relationship is reactivated instead of throwing an error
  - GET `/api/users/caregivers` now correctly filters by `is_active = true`
  - Caregivers list now displays correctly in the Elder dashboard

### Added
- **Root Package Dependencies** (17:00 UTC)
  - Added `pg` (^8.11.3) to root `package.json` for database setup scripts
  - Added `dotenv` (^16.3.1) for environment variable support
  - Fixed "Cannot find module 'pg'" error when running `npm run setup-db`

### Changed
- **Documentation Updates** (17:50 UTC)
  - Streamlined `README.md` for better readability
  - Removed verbose sections and consolidated setup instructions
  - Updated Quick Start guide with clearer steps
  - Added troubleshooting table for common issues
  - Removed outdated screenshot references

### Technical Details

#### Database Connection
- Default: `postgresql://postgres:postgres@localhost:5432/emergency_sos`
- Configured in `backend/.env`
- Connection pooling via `pg` module

#### Authentication
- JWT tokens with 7-day expiration
- Secret key stored in environment variables
- Middleware validates tokens on protected routes

#### Caregiver Relationship States
- `is_active = true`: Relationship is active, shown in lists
- `is_active = false`: Relationship is inactive, hidden from lists
- Adding an inactive caregiver reactivates the relationship

---

## Previous Versions

For changes prior to 2025-11-05, please refer to commit history.

---

### Notes
- All timestamps in UTC
- This project is a college prototype for educational purposes
- Built with Node.js, React, PostgreSQL, and Socket.io
