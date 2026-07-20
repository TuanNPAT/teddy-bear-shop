# User Test Cases

## Overview
Test cases for user functionality in Teddy Bear Shop

---

## User Registration Tests

### Valid Registration
- [ ] User can register with valid email
- [ ] User can register with valid password (min 8 characters)
- [ ] User receives confirmation message
- [ ] User data is saved in database

### Invalid Registration
- [ ] Registration fails with invalid email format
- [ ] Registration fails with password < 8 characters
- [ ] Registration fails with empty fields
- [ ] Registration fails with duplicate email
- [ ] Error messages are displayed

---

## User Login Tests

### Valid Login
- [ ] User can login with correct email and password
- [ ] User receives authentication token
- [ ] User is redirected to dashboard
- [ ] Session is created

### Invalid Login
- [ ] Login fails with incorrect password
- [ ] Login fails with non-existent email
- [ ] Login fails with empty credentials
- [ ] Error message: "Invalid credentials"
- [ ] Failed attempts are logged

---

## User Profile Tests

### View Profile
- [ ] Logged-in user can view their profile
- [ ] Profile displays all user information
- [ ] Profile shows order history
- [ ] Profile shows saved addresses

### Edit Profile
- [ ] User can update name
- [ ] User can update email
- [ ] User can update phone number
- [ ] User can update address
- [ ] Changes are saved to database
- [ ] User receives confirmation message

### Update Password
- [ ] User can change password
- [ ] Old password validation required
- [ ] New password must meet requirements
- [ ] Confirmation email sent
- [ ] Old password no longer works

---

## User Permissions Tests

### Access Control
- [ ] Logged-out user cannot access protected pages
- [ ] User can only view their own profile
- [ ] User cannot view other users' profiles
- [ ] Non-admin user cannot access admin panel
- [ ] Admin user can access admin functions

### Role-Based Tests
- [ ] Regular user has limited permissions
- [ ] Admin user has full permissions
- [ ] Guest user has read-only access
- [ ] Permissions are enforced on backend

---

## User Logout Tests

- [ ] User can logout successfully
- [ ] Session is terminated
- [ ] User is redirected to login page
- [ ] Authentication token is invalidated
- [ ] User cannot access protected pages after logout

---

## User Account Tests

### Account Deletion
- [ ] User can delete their account
- [ ] Confirmation required before deletion
- [ ] User data is removed from system
- [ ] User cannot login after deletion

### Account Suspension
- [ ] Admin can suspend user account
- [ ] Suspended user cannot login
- [ ] Admin can reactivate account

---

## Security Tests

- [ ] Passwords are hashed (not stored in plain text)
- [ ] Sensitive data is protected
- [ ] SQL injection attempts are blocked
- [ ] XSS attacks are prevented
- [ ] CSRF protection is implemented
