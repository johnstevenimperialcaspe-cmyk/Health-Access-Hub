# Diagnostic Test Endpoints

Use these endpoints to test your system:

1. **Test Server**: GET http://localhost:5000/api/test/ping
2. **Test Database**: GET http://localhost:5000/api/test/db-test
3. **Test Auth**: GET http://localhost:5000/api/test/auth-test (requires Authorization header)
4. **Test Users Table**: GET http://localhost:5000/api/test/users-test
5. **Test Appointments Table**: GET http://localhost:5000/api/test/appointments-test
6. **Test Health Records Table**: GET http://localhost:5000/api/test/health-records-test
7. **Test Notifications Table**: GET http://localhost:5000/api/test/notifications-test

These will help identify what's broken.

