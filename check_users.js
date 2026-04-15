import User from './backend/models/User.js';
import { connectDB } from './backend/config/db.js';

async function checkUsers() {
  try {
    await connectDB();
    const users = await User.findAll();
    console.log(JSON.stringify(users.map(u => ({id: u.id, email: u.email})), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
