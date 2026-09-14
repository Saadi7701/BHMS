import "dotenv/config";
import mongoose from "mongoose";
import { connectToProductionDatabase } from "../src/lib/mongodb";
import { connectToBackupDatabase, disconnectBackupDatabase } from "../src/lib/mongodbBackup";

export interface IBackupMetadata {
  backupId: string;
  sourceDatabase: string;
  startedAt: Date;
  completedAt?: Date;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  recordCounts: Record<string, number>;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  errorInformation?: string;
}

export async function executeMongoToMongoBackup(): Promise<IBackupMetadata> {
  const startedAt = new Date();
  const dateStr = startedAt.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupId = `backup_${dateStr}`;
  const sourceDbName = "bilal_hospital_prod";

  console.log("=================================================");
  console.log(`[Backup Worker] Starting Scheduled Backup: ${backupId}`);
  console.log("=================================================");

  const metadata: IBackupMetadata = {
    backupId,
    sourceDatabase: sourceDbName,
    startedAt,
    status: "IN_PROGRESS",
    recordCounts: {},
    verificationStatus: "PENDING",
  };

  try {
    const prodMongoose = await connectToProductionDatabase();
    const prodDb = prodMongoose.connection.db;

    if (!prodDb) {
      throw new Error("Production MongoDB database connection handle is missing.");
    }

    const backupConnection = await connectToBackupDatabase();
    const backupDb = backupConnection.db;

    if (!backupDb) {
      throw new Error("Backup MongoDB database connection handle is missing.");
    }

    const collections = await prodDb.listCollections().toArray();
    console.log(`[Backup Worker] Found ${collections.length} collections in Production Cluster.`);

    for (const colInfo of collections) {
      const colName = colInfo.name;
      if (colName.startsWith("system.")) continue;

      const docs = await prodDb.collection(colName).find().toArray();
      metadata.recordCounts[colName] = docs.length;

      const targetColName = `${backupId}_${colName}`;
      if (docs.length > 0) {
        await backupDb.collection(targetColName).insertMany(docs);
      }
      console.log(`  ✓ Transferred ${docs.length} records to Backup Cluster -> ${targetColName}`);
    }

    // Phase 17: Backup Verification
    console.log("[Backup Worker] Running post-dump backup verification...");
    let verificationPassed = true;
    for (const colInfo of collections) {
      const colName = colInfo.name;
      if (colName.startsWith("system.")) continue;

      const targetColName = `${backupId}_${colName}`;
      const prodCount = await prodDb.collection(colName).countDocuments();
      const backupCount = await backupDb.collection(targetColName).countDocuments();

      if (prodCount !== backupCount) {
        verificationPassed = false;
        console.error(`  ✗ Verification mismatch for ${colName}: Prod=${prodCount}, Backup=${backupCount}`);
      }
    }

    metadata.completedAt = new Date();
    if (verificationPassed) {
      metadata.status = "COMPLETED";
      metadata.verificationStatus = "VERIFIED";
      console.log(`[Backup Worker] Backup ${backupId} successfully COMPLETED & VERIFIED!`);
    } else {
      metadata.status = "FAILED";
      metadata.verificationStatus = "FAILED";
      metadata.errorInformation = "Record count mismatch during post-dump verification.";
      console.error(`[Backup Worker] Backup ${backupId} FAILED verification check!`);
    }

    // Save Backup Metadata record into Backup Cluster
    await backupDb.collection("backup_metadata").insertOne(metadata);
  } catch (err: any) {
    console.error("[Backup Worker Error]:", err.message);
    metadata.completedAt = new Date();
    metadata.status = "FAILED";
    metadata.verificationStatus = "FAILED";
    metadata.errorInformation = err.message;
  } finally {
    await disconnectBackupDatabase();
  }

  return metadata;
}

if (require.main === module) {
  executeMongoToMongoBackup().then(() => process.exit(0));
}
