import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // replace this
  database: "chatbotDB"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Connection failed:", err);
    return;
  }
  console.log("✅ MySQL Connected!");
});

export default db;