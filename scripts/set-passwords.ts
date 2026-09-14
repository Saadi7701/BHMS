import { connectToProductionDatabase, disconnectProductionDatabase } from '../src/lib/mongodb';
import { UserModel } from '../src/models/User';
import bcrypt from 'bcryptjs';

async function run() {
  await connectToProductionDatabase();
  const users = await UserModel.find({});
  
  const passwords: Record<string, string> = {};

  for (const user of users) {
    let plainTextPassword = '';
    
    if (user.role === 'ADMIN') plainTextPassword = 'Admin!2026'; // 10 chars
    else if (user.username === 'dr_bilal') plainTextPassword = 'Bilal@1'; // 7 chars
    else if (user.username === 'dr_sarah') plainTextPassword = 'Sarah@2'; // 7 chars
    else if (user.role === 'RECEPTIONIST') plainTextPassword = 'Recep@1'; // 7 chars
    else if (user.role === 'LAB_STAFF') plainTextPassword = 'LabTech'; // 7 chars
    else if (user.role === 'PHARMACY_STAFF') plainTextPassword = 'Pharma1'; // 7 chars
    else if (user.role === 'ULTRASOUND_STAFF') plainTextPassword = 'UltraS1'; // 7 chars
    else plainTextPassword = 'Pass@12'; // fallback 7 chars
    
    const hash = await bcrypt.hash(plainTextPassword, 10);
    user.passwordHash = hash;
    await user.save();
    
    passwords[user.username] = plainTextPassword;
  }
  
  console.log('==============================================');
  console.log('       NEW PASSWORDS SET IN DATABASE          ');
  console.log('==============================================');
  console.table(passwords);
  
  await disconnectProductionDatabase();
  process.exit(0);
}

run();
