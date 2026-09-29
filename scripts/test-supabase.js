const { PrismaClient } = require('@prisma/client');

async function testPooler() {
  const urls = [
    "postgresql://postgres.uhcopamtlowjsbtjhlia:Bilalhospital%40222@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require",
    "postgresql://postgres.uhcopamtlowjsbtjhlia:Bilalhospital%40222@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require",
    "postgresql://postgres.uhcopamtlowjsbtjhlia:Bilalhospital%40222@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
  ];

  for (const url of urls) {
    console.log("Testing:", url);
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
      await p.$connect();
      console.log("✅ SUCCESS CONNECTED!");
      const count = await p.user.count();
      console.log("User count:", count);
      await p.$disconnect();
      return url;
    } catch(e) {
      console.log("❌ Failed:", e.message.split('\n')[0]);
      await p.$disconnect();
    }
  }
}

testPooler().then(() => process.exit(0));
