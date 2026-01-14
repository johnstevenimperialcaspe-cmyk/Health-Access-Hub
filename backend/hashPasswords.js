// Save this as: hashPasswords.js
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function hashAllPasswords() {
  let connection;
  
  try {
    console.log("🔄 Connecting to database...");
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
    });

    console.log("✅ Connected to database");
    console.log("🔍 Fetching users with unhashed passwords...\n");
    
    // Get all users where password doesn't look like bcrypt hash
    const [users] = await connection.query(
      `SELECT id, email, password_hash, role 
       FROM users 
       WHERE password_hash NOT REGEXP '^\\$2[ayb]\\$[0-9]{2}\\$'
       ORDER BY id`
    );

    if (users.length === 0) {
      console.log("✅ All passwords are already hashed!");
      await connection.end();
      return;
    }

    console.log(`📊 Found ${users.length} users with plain text passwords:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    });

    console.log("\n⚠️  WARNING: This will hash all plain text passwords.");
    console.log("📝 Make sure you have a backup of your database!");
    console.log("\n⏳ Starting in 3 seconds...\n");
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each user
    for (const user of users) {
      try {
        console.log(`🔐 Hashing password for: ${user.email}`);
        
        // Hash the plain text password (using 10 rounds - good balance)
        const hashedPassword = await bcrypt.hash(user.password_hash, 10);
        
        // Update the database
        await connection.query(
          "UPDATE users SET password_hash = ? WHERE id = ?",
          [hashedPassword, user.id]
        );

        successCount++;
        console.log(`   ✅ Success`);
      } catch (err) {
        errorCount++;
        errors.push({ email: user.email, error: err.message });
        console.error(`   ❌ Error: ${err.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully hashed: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📋 Total processed: ${users.length} users`);
    
    if (errors.length > 0) {
      console.log("\n❌ Failed users:");
      errors.forEach(err => {
        console.log(`   - ${err.email}: ${err.error}`);
      });
    }
    
    console.log("=".repeat(60) + "\n");

    await connection.end();
    console.log("🎉 Migration complete! You can now use the login system.\n");
    
  } catch (err) {
    console.error("\n❌ FATAL ERROR:", err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

// Run the migration
console.log("🚀 Starting Password Hash Migration...\n");
hashAllPasswords();
