import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_BACKUP_URI = process.env.MONGODB_BACKUP_URI;

if (!MONGODB_BACKUP_URI) {
  console.warn(
    "[MongoDB Backup Alert] MONGODB_BACKUP_URI environment variable is not defined. Falling back to default local backup connection string."
  );
}

const DEFAULT_BACKUP_URI = "mongodb://127.0.0.1:27017/bilal_hospital_backup";
const BACKUP_URI = MONGODB_BACKUP_URI || DEFAULT_BACKUP_URI;

let backupConnection: mongoose.Connection | null = null;

/**
 * Production-isolated connection options for the Backup MongoDB Cluster.
 */
export const MONGOOSE_BACKUP_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

/**
 * Establishes a connection to the dedicated Backup MongoDB Cluster.
 * CRITICAL: This connection is strictly isolated from application queries.
 */
export async function connectToBackupDatabase(): Promise<mongoose.Connection> {
  if (backupConnection && backupConnection.readyState === 1) {
    return backupConnection;
  }

  console.log("[MongoDB Backup] Initializing connection to Backup MongoDB Cluster...");
  backupConnection = mongoose.createConnection(BACKUP_URI, MONGOOSE_BACKUP_OPTIONS);

  await new Promise<void>((resolve, reject) => {
    backupConnection!.once("open", () => {
      console.log("[MongoDB Backup] Successfully connected to Backup MongoDB Cluster.");
      resolve();
    });
    backupConnection!.once("error", (err) => {
      console.error("[MongoDB Backup Error] Failed to connect to Backup Cluster:", err.message);
      reject(err);
    });
  });

  return backupConnection;
}

/**
 * Disconnects from the Backup MongoDB Cluster cleanly.
 */
export async function disconnectBackupDatabase(): Promise<void> {
  if (backupConnection) {
    await backupConnection.close();
    backupConnection = null;
    console.log("[MongoDB Backup] Backup MongoDB Cluster connection closed.");
  }
}
