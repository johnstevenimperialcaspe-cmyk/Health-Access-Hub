# HOW TO START THE SERVER CORRECTLY

## Step 1: Make sure you're in the backend directory
```bash
cd backend
```

## Step 2: Start the server
```bash
npm start
```

## Step 3: Check the console output

You should see:
- ✓ Auth routes imported successfully
- ✓ Appointments routes registered at /api/appointments
- ✓ Users routes registered at /api/users
- ✓ Notifications routes registered at /api/notifications
- ✓ Examinations routes registered at /api/examinations
- ✓ MySQL connected successfully
- ✓ Server running at http://localhost:5000

## Step 4: Test the routes

Open these in your browser:
1. http://localhost:5000/ - Should show API info
2. http://localhost:5000/api/health - Should show health check
3. http://localhost:5000/api/test/ping - Should show "Test route is working!"

## Step 5: If you see errors

Check:
1. Is MySQL running? (XAMPP/WAMP/etc.)
2. Does the `.env` file exist with correct credentials?
3. Does the database `thesis1` exist?
4. Are there any error messages in the console?

## Common Issues:

1. **404 errors**: Server might not be running - check Step 3
2. **Database errors**: MySQL not running or wrong credentials
3. **Import errors**: Check if all route files exist and are valid

