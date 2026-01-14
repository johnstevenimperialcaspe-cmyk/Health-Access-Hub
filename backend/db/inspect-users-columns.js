import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });
(async ()=>{
  try{
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST||'127.0.0.1',
      port: Number(process.env.MYSQL_PORT||3306),
      user: process.env.MYSQL_USER||'root',
      password: process.env.MYSQL_PASSWORD||'',
      database: process.env.MYSQL_DATABASE||'thesis1'
    });
    const [rows] = await conn.query("SHOW COLUMNS FROM users");
    console.log('users table columns:');
    rows.forEach(r=>console.log(r.Field, r.Type));
    await conn.end();
  }catch(e){console.error(e);process.exit(1)}
})();
