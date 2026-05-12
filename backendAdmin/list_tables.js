import { sequelize } from "./config/db.js";

async function checkUsers() {
  try {
    const [results] = await sequelize.query('SELECT * FROM "Users" LIMIT 5');
    console.log("Users sample:", results);
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
    `);
    console.log("Columns in Users table:", columns);
  } catch (error) {
    console.error("Error checking Users table:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
