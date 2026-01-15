// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../db/mysql.js";

const router = express.Router();

// Log route registration in development
if (process.env.NODE_ENV !== "production") {
  console.log("[AUTH ROUTES] Router initialized");
}

const capitalise = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

/* ---------- REGISTER ---------- */
router.post("/register", async (req, res) => {
  console.log("[AUTH] Register route hit");
  // Self-registration disabled: only admins may create accounts now
  console.warn("[AUTH] Self-registration attempted but disabled");
  return res.status(403).json({ message: "Self-registration is disabled. Please contact an administrator to create an account." });
  try {
    // Test database connection first
    try {
      await pool.query("SELECT 1");
    } catch (dbErr) {
      console.error("[REGISTER] Database connection error:", dbErr);
      return res.status(503).json({ 
        message: "Database connection failed. Please ensure MySQL server is running." 
      });
    }

    // DEBUG: log entire request body
    console.log("[REGISTER] Registration attempt started");

    const {
      firstName,
      middleName,
      lastName,
      address,
      birthday,
      age,
      phoneNumber,
      email,
      password,
      role,
      college,
      course,
      yearLevel,
      section,
      studentType,
      guardianName,
      guardianContact,
      department,
      position,
      yearsOfService,
      officeLocation,
      licenseNumber,
      shiftSchedule,
      employmentType,
      supervisor,
    } = req.body;

    // DEBUG: log incoming keys (avoid printing passwords)
    try {
      console.log("[DEBUG register] received keys:", Object.keys(req.body));
      console.log("[DEBUG register] role:", role);
    } catch (logErr) {
      console.error("[DEBUG register] logging error:", logErr);
    }

    // ---- Validation - Only require essential fields -----------------
    if (!firstName || !middleName || !lastName || !email || !password || !role) {
      const missing = [];
      if (!firstName) missing.push("firstName");
      if (!middleName) missing.push("middleName");
      if (!lastName) missing.push("lastName");
      if (!email) missing.push("email");
      if (!password) missing.push("password");
      if (!role) missing.push("role");
      console.warn("[DEBUG register] missing required fields:", missing);
      return res.status(400).json({ 
        message: "Please fill in all required fields", 
        missing 
      });
    }

    const allowed = [
      "student",
      "faculty",
      "admin",
      "non_academic",
    ];
    if (!allowed.includes(role)) {
      console.warn('[DEBUG register] invalid role:', role, 'allowed:', allowed);
      return res.status(400).json({ message: "Invalid role", allowed, role });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[REGISTER] Checking for duplicate email: ${normalizedEmail}`);

    const [dup] = await pool.query(
      "SELECT id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1",
      [normalizedEmail]
    );
    if (dup.length) {
      console.log(`[REGISTER] Email already exists: ${normalizedEmail}`);
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // ---- ID generation --------------------------------------------
    const year = new Date().getFullYear();
    const prefixMap = {
      student: "STU",
      faculty: "PROF",
      admin: "ADM",
      non_academic: "STAFF",
    };
    const prefix = prefixMap[role] || "USR";
    const idColumn = role === "student" ? "student_id" : "employee_id";

    const [[{ nextSeq }]] = await pool.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(${idColumn}, '-', -1) AS UNSIGNED)), 0) + 1 AS nextSeq FROM users WHERE ${idColumn} LIKE ?`,
      [`${prefix}-${year}-%`]
    );

    const generatedId = `${prefix}-${year}-${nextSeq
      .toString()
      .padStart(3, "0")}`;

    // ---- INSERT - Only insert provided fields ----------------------
    const fields = [idColumn, "email", "password_hash", "role", "first_name", "middle_name", "last_name"];
    const values = [generatedId, normalizedEmail, passwordHash, role, capitalise(firstName), capitalise(middleName), capitalise(lastName)];
    
    // Add optional fields only if provided
    if (department) {
      fields.push("department");
      values.push(department);
    }
    if (yearLevel) {
      fields.push("year_level");
      values.push(yearLevel);
    }
    if (course) {
      fields.push("course");
      values.push(course);
    }
    if (college) {
      fields.push("college");
      values.push(college);
    }
    if (position) {
      fields.push("position");
      values.push(position);
    }
    if (address) {
      fields.push("address");
      values.push(capitalise(address));
    }
    if (birthday) {
      fields.push("birthday");
      values.push(birthday);
    }
    if (age) {
      fields.push("age");
      values.push(age);
    }
    if (phoneNumber) {
      fields.push("phone_number");
      values.push(phoneNumber);
    }
    if (section) {
      fields.push("section");
      values.push(section);
    }
    if (studentType) {
      fields.push("student_type");
      values.push(studentType);
    }
    if (guardianName) {
      fields.push("guardian_name");
      values.push(guardianName);
    }
    if (guardianContact) {
      fields.push("guardian_contact");
      values.push(guardianContact);
    }
    if (yearsOfService) {
      fields.push("years_of_service");
      values.push(yearsOfService);
    }
    if (officeLocation) {
      fields.push("office_location");
      values.push(officeLocation);
    }
    if (licenseNumber) {
      fields.push("license_number");
      values.push(licenseNumber);
    }
    if (shiftSchedule) {
      fields.push("shift_schedule");
      values.push(shiftSchedule);
    }
    if (employmentType) {
      fields.push("employment_type");
      values.push(employmentType);
    }
    if (supervisor) {
      fields.push("supervisor");
      values.push(supervisor);
    }
    
    fields.push("is_active");
    values.push(1);
    
    const placeholders = fields.map(() => "?").join(", ");
    await pool.query(
      `INSERT INTO users (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );

    console.log(`[REGISTER] Success - User registered with ID: ${generatedId}, email: ${normalizedEmail}`);

    // Fetch the newly created user's profile (exclude password_hash)
    const [rows] = await pool.query(
      `SELECT id, email, role, first_name, middle_name, last_name, student_id, employee_id, phone_number, address, department, position, office_location, is_active
       FROM users
       WHERE LOWER(TRIM(email)) = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      // Fallback response when user cannot be retrieved
      return res.status(201).json({ message: "Registration successful", generatedId });
    }

    const user = rows[0];

    // Ensure JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("[REGISTER] JWT_SECRET not configured - returning user without token");
      return res.status(201).json({ message: "Registration successful", user });
    }

    // Generate token for immediate login
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Build profile object that frontend expects
    const profile = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      student_id: user.student_id,
      employee_id: user.employee_id,
      phone_number: user.phone_number,
      address: user.address,
      department: user.department,
      position: user.position,
      office_location: user.office_location,
      is_active: user.is_active,
    };

    return res.status(201).json({ message: "Registration successful", token, user: profile });
  } catch (err) {
    console.error("[REGISTER] Registration error:", err);
    console.error("[REGISTER] Error message:", err.message);
    console.error("[REGISTER] Error code:", err.code);
    console.error("[REGISTER] Error stack:", err.stack);
    
    // Check for database connection errors
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({ 
        message: "Database connection failed. Please ensure MySQL server is running." 
      });
    }
    
    // Check for SQL errors
    if (err.code && err.code.startsWith("ER_")) {
      console.error("[REGISTER] SQL Error:", err.sqlMessage);
      return res.status(500).json({ 
        message: "Database error occurred",
        error: process.env.NODE_ENV === "development" ? err.sqlMessage : undefined
      });
    }
    
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  console.log("[AUTH] Login route hit");
  const startTime = Date.now();
  
  try {
    const { email, password } = req.body;
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[LOGIN] ${new Date().toISOString()}`);
    console.log(`${"=".repeat(60)}`);
    
    // 1. Validate input
    if (!email || !password) {
      console.log(`[LOGIN] ❌ Missing credentials`);
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`[LOGIN] ❌ Invalid email format: ${email}`);
      return res.status(400).json({ 
        message: "Invalid email format" 
      });
    }

    // 2. Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("[LOGIN] ❌ JWT_SECRET not configured");
      return res.status(500).json({ 
        message: "Server configuration error" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[LOGIN] 📧 Email: ${normalizedEmail}`);
    console.log(`[LOGIN] 🔑 Password: ${password}`);

    // 3. Test database connection
    console.log(`[LOGIN] 🔌 Testing database connection...`);
    try {
      await pool.query("SELECT 1");
      console.log(`[LOGIN] ✅ Database connected`);
    } catch (dbErr) {
      console.error("[LOGIN] ❌ Database connection failed:", dbErr.message);
      return res.status(503).json({ 
        message: "Database unavailable. Please try again later." 
      });
    }

    // 4. Query user
    console.log(`[LOGIN] 🔍 Searching for user...`);
    const [rows] = await pool.query(
      `SELECT 
        id, email, role, first_name, middle_name, last_name,
        student_id, employee_id, phone_number, address,
        department, position, office_location,
        course, year_level, section, student_type,
        password_hash, is_active
       FROM users 
       WHERE LOWER(TRIM(email)) = ? 
       LIMIT 1`,
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      console.log(`[LOGIN] ❌ User not found`);
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    const user = rows[0];
    console.log(`[LOGIN] ✅ User found: ID=${user.id}, Role=${user.role}`);
    console.log(`[LOGIN] 🗝️  Password (stored): ${user.password_hash}`);

    // 5. Check account status
    if (!user.is_active) {
      console.log(`[LOGIN] ❌ Account inactive`);
      return res.status(403).json({ 
        message: "Account is inactive. Please contact administrator." 
      });
    }

    // 6. Check password hash exists
    if (!user.password_hash || user.password_hash.trim() === "") {
      console.error(`[LOGIN] ❌ No password hash for user ID: ${user.id}`);
      return res.status(500).json({ 
        message: "Account error. Please contact administrator." 
      });
    }

    console.log(`[LOGIN] 🔐 Password hash length: ${user.password_hash.length}`);

    // 7. Verify password
    let match = false;
    const isBcryptHash = /^\$2[ayb]\$\d{2}\$/.test(user.password_hash);

    if (isBcryptHash) {
      // Hashed password - use bcrypt
      console.log(`[LOGIN] 🔒 Verifying hashed password...`);
      match = await bcrypt.compare(password, user.password_hash);
      console.log(`[LOGIN] ${match ? "✅" : "❌"} Password ${match ? "matched" : "did not match"}`);
      
      if (match) {
        console.log(`[LOGIN] 🔓 Real password (decrypted): ${password}`);
      }
    } else {
      // Plain text password (shouldn't happen after migration)
      console.log(`[LOGIN] ⚠️  WARNING: Plain text password detected!`);
      console.log(`[LOGIN] 🔓 Real password (plaintext in DB): ${user.password_hash}`);
      match = (password === user.password_hash);
      
      if (match) {
        console.log(`[LOGIN] ✅ Plain text password matched`);
        console.log(`[LOGIN] 🔄 Auto-hashing password...`);
        
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          await pool.query(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [hashedPassword, user.id]
          );
          console.log(`[LOGIN] ✅ Password hashed for user ID: ${user.id}`);
        } catch (hashErr) {
          console.error(`[LOGIN] ⚠️  Failed to hash password:`, hashErr.message);
        }
      } else {
        console.log(`[LOGIN] ❌ Plain text password did not match`);
      }
    }

    if (!match) {
      const duration = Date.now() - startTime;
      console.log(`[LOGIN] ❌ Authentication failed (${duration}ms)`);
      console.log(`${"=".repeat(60)}\n`);
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // 8. Generate JWT token
    console.log(`[LOGIN] 🎫 Generating token...`);
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // 9. Prepare user profile
    const profile = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      student_id: user.student_id,
      employee_id: user.employee_id,
      phone_number: user.phone_number,
      address: user.address,
      department: user.department,
      position: user.position,
      office_location: user.office_location,
      course: user.course,
      year_level: user.year_level,
      section: user.section,
      student_type: user.student_type,
    };

    const duration = Date.now() - startTime;
    console.log(`[LOGIN] ✅ SUCCESS (${duration}ms)`);
    console.log(`[LOGIN] 👤 User: ${profile.first_name} ${profile.middle_name || ""} ${profile.last_name}`.trim());
    console.log(`[LOGIN] 🎭 Role: ${profile.role}`);
    console.log(`[LOGIN] 📦 Returning profile with role: ${profile.role}`);
    console.log(`${"=".repeat(60)}\n`);

    return res.json({ 
      token, 
      user: profile 
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`\n[LOGIN] ❌ ERROR (${duration}ms):`, err.message);
    console.error("[LOGIN] Stack:", err.stack);
    console.log(`${"=".repeat(60)}\n`);
    
    // Handle specific errors
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({ 
        message: "Database connection failed" 
      });
    }

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({ 
        message: "Database connection lost" 
      });
    }
    
    return res.status(500).json({ 
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

export default router;
