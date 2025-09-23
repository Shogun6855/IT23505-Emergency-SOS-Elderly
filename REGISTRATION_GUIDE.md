# Registration Validation Guide

## Required Fields and Rules

### ✅ **Valid Registration Example:**

```
Full Name: John Smith
Email: john.smith@example.com
Phone: +1234567890 (or just 1234567890)
Role: Elder (or Caregiver)
Address: 123 Main Street, Anytown, CA 12345
Emergency Contact: Jane Smith: +9876543210 (optional)
Password: MyPass123
Confirm Password: MyPass123
```

### 📋 **Validation Rules:**

#### **Name** (Required)
- ✅ Must be 2-50 characters
- ❌ Cannot be empty
- ❌ Cannot be just spaces

#### **Email** (Required)  
- ✅ Must be valid email format (user@domain.com)
- ❌ Cannot be duplicate (must be unique)

#### **Phone** (Required)
- ✅ Valid formats: +1234567890, 1234567890, +91-9876543210
- ❌ Invalid: abc123, too short numbers

#### **Password** (Required)
- ✅ **Minimum 6 characters**
- ✅ **At least 1 lowercase letter** (a-z)
- ✅ **At least 1 uppercase letter** (A-Z) 
- ✅ **At least 1 number** (0-9)
- ❌ "password" - missing uppercase and number
- ❌ "PASSWORD" - missing lowercase
- ❌ "Pass123" - too short
- ✅ "MyPass123" - perfect!

#### **Address** (Required)
- ✅ Must not be empty
- ✅ Maximum 200 characters
- ✅ Can include apartment numbers, city, state, etc.

#### **Emergency Contact** (Optional)
- ✅ Can be left blank
- ✅ Format: "Name: Phone" recommended

### 🔴 **Common Registration Errors:**

1. **"Password must contain at least one uppercase letter"**
   - Fix: Add a capital letter (A-Z) to your password

2. **"Password must contain at least one number"** 
   - Fix: Add a digit (0-9) to your password

3. **"Please provide a valid phone number"**
   - Fix: Use format like +1234567890 or just 1234567890

4. **"Please provide a valid email address"**
   - Fix: Must include @ and domain (user@email.com)

5. **"Passwords do not match"**
   - Fix: Make sure both password fields are identical