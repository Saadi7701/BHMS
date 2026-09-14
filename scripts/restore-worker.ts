import "dotenv/config";
import mongoose from "mongoose";
import { connectToBackupDatabase, disconnectBackupDatabase } from "../src/lib/mongodbBackup";

export interface IRestoreReport {
  backupId: string;
  targetDatabase: string;
  startedAt: Date;
  completedAt?: Date;
  status: "COMPLETED" | "FAILED";
  restoredCollections: Record<string, number>;
  reportSummary: string;
}

/**
 * Restores a historical backup version from the Backup Cluster into a Staging/Target MongoDB database.
 * NEVER overwrites Production directly unless explicitly targeted with confirmation.
 */
export async function executeRestoreFromBackup(
  backupId: string,
  targetUri?: string,
  confirmed = false
): Promise<IRestoreReport> {
  const startedAt = new Date();
  const targetDbName = targetUri || process.env.MONGODB_STAGING_URI || "mongodb://127.0.0.1:27017/bilal_hospital_staging";

  console.log("=================================================");
  console.log(`[Restore Worker] Initiating Database Restore Procedure`);
  console.log(`  Source Backup ID: ${backupId}`);
  console.log(`  Target Database:  ${targetDbName}`);
  console.log("=================================================");

  if (!confirmed) {
    throw new Error(
      "[Restore Safety Error] Restore execution requires explicit administrative confirmation (confirmed = true)."
    );
  }

  const report: IRestoreReport = {
    backupId,
    targetDatabase: targetDbName,
    startedAt,
    status: "FAILED",
    restoredCollections: {},
    reportSummary: "",
  };

  try {
    const backupConnection = await connectToBackupDatabase();
    const backupDb = backupConnection.db;

    if (!backupDb) {
      throw new Error("Failed to connect to Backup Cluster.");
    }

    const targetConn = await mongoose.createConnection(targetDbName).asPromise();
    const targetDb = targetConn.db;

    if (!targetDb) {
      throw new Error("Failed to connect to Target/Staging database.");
    }

    const prefix = `${backupId}_`;
    const collections = await backupDb.listCollections().toArray();
    const matchingCols = collections.filter((c) => c.name.startsWith(prefix));

    if (matchingCols.length === 0) {
      throw new Error(`No backup collections found matching Backup ID '${backupId}'.`);
    }

    for (const col of matchingCols) {
      const origColName = col.name.replace(prefix, "");
      const docs = await backupDb.collection(col.name).find().toArray();
      report.restoredCollections[origColName] = docs.length;

      if (docs.length > 0) {
        await targetDb.collection(origColName).deleteMany({});
        await targetDb.collection(origColName).insertMany(docs);
      }
      console.log(`  ✓ Restored ${docs.length} records into collection '${origColName}'`);
    }

    await targetConn.close();
    report.completedAt = new Date();
    report.status = "COMPLETED";
    report.reportSummary = `Successfully restored ${Object.keys(report.restoredCollections).length} collections into ${targetDbName}.`;
    console.log(`[Restore Worker] ${report.reportSummary}`);
  } catch (err: any) {
    console.error("[Restore Worker Error]:", err.message);
    report.completedAt = new Date();
    report.status = "FAILED";
    report.reportSummary = err.message;
  } finally {
    await disconnectBackupDatabase();
  }

  return report;
}

if (require.main === module) {
  const backupIdArg = process.argv[2];
  if (!backupIdArg) {
    console.error("Usage: tsx scripts/restore-worker.ts <backupId>");
    process.exit(1);
  }
  executeRestoreFromBackup(backupIdArg, undefined, true).then(() => process.exit(0));
}
