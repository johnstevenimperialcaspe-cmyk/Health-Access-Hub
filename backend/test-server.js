// Simple script to test if the server starts correctly
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Testing server imports...\n");

try {
  console.log("1. Testing route imports...");
  const authRoutes = (await import("./routes/auth.js")).default;
  console.log("   ✓ auth.js");
  
  const appointmentsRoutes = (await import("./routes/appointments.js")).default;
  console.log("   ✓ appointments.js");
  
  const usersRoutes = (await import("./routes/users.js")).default;
  console.log("   ✓ users.js");
  
  const notificationsRoutes = (await import("./routes/notifications.js")).default;
  console.log("   ✓ notifications.js");
  
  const examinationsRoutes = (await import("./routes/examinations.js")).default;
  console.log("   ✓ examinations.js");
  
  const healthRecordsRoutes = (await import("./routes/healthRecords.js")).default;
  console.log("   ✓ healthRecords.js");
  
  const testRoutes = (await import("./routes/test.js")).default;
  console.log("   ✓ test.js");
  
  console.log("\n✅ All routes imported successfully!");
  console.log("\nNow starting server...\n");
  
  // Start the server
  await import("./server.js");
  
} catch (err) {
  console.error("\n❌ ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
}

