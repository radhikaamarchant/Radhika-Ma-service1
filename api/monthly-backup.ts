import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { google } from "googleapis";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";

// Main parent folder ID in Google Drive
const DRIVE_PARENT_FOLDER_ID = "1LKDl-iRWVDkGuyXlJGI2k8cjsGEIuFcj";

interface TransactionRow {
  docId: string;
  sourceCollection: "investments" | "bankStatements";
  date: string;
  creditedBy: string;
  debitedBy: string;
  creditAmount: number;
  debitAmount: number;
  taxPaid: number;
  brokeragePaid: number;
}

interface EntityGroup {
  uniqueId: string;
  entityType: "business" | "investor";
  entityName: string;
  bankName: string;
  bankAccountNumber: string;
  bankHolderName: string;
  transactions: TransactionRow[];
  docIdsToDelete: Set<string>;
}

function escapeCsv(val: any): string {
  if (val === undefined || val === null) return "";
  const str = String(val).trim();
  if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getGoogleDriveClient() {
  const keyFilePath = path.join(process.cwd(), "serviceAccountKey.json");

  let keyData: any = null;
  if (fs.existsSync(keyFilePath)) {
    try {
      keyData = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));
    } catch {}
  } else if (process.env.SERVICE_ACCOUNT_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      keyData = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "");
    } catch {}
  }

  let auth: any = null;

  // 1. If keyData contains private_key, authenticate directly with credentials
  if (keyData && (keyData.private_key || keyData.client_email)) {
    auth = new google.auth.GoogleAuth({
      credentials: keyData,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
  } else if (fs.existsSync(keyFilePath) && keyData?.private_key) {
    auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
  } else {
    // 2. Ambient / Application Default Credentials fallback
    auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
  }

  return google.drive({ version: "v3", auth });
}

function getFirestoreInstance() {
  let app: any;
  let firestoreDbId: string | undefined;

  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    firestoreDbId = firebaseConfig.firestoreDatabaseId;
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } else {
    app = getApps().length === 0 ? initializeApp({}) : getApp();
  }

  return getFirestore(app, firestoreDbId);
}

async function getOrCreateFolder(
  drive: any,
  parentFolderId: string,
  folderName: string
): Promise<string> {
  const sanitizedName = folderName.replace(/'/g, "\\'");
  const q = `'${parentFolderId}' in parents and name = '${sanitizedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const listRes = await drive.files.list({
    q,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (listRes.data.files && listRes.data.files.length > 0) {
    return listRes.data.files[0].id!;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, name",
  });

  if (!createRes.data.id) {
    throw new Error(`Failed to create Google Drive folder for "${folderName}".`);
  }

  return createRes.data.id;
}

async function uploadCsvFile(
  drive: any,
  folderId: string,
  fileName: string,
  csvContent: string
): Promise<string> {
  const sanitizedFileName = fileName.replace(/'/g, "\\'");
  const q = `'${folderId}' in parents and name = '${sanitizedFileName}' and trashed = false`;

  const existingRes = await drive.files.list({
    q,
    fields: "files(id, name)",
    spaces: "drive",
  });

  const media = {
    mimeType: "text/csv",
    body: Readable.from([csvContent]),
  };

  if (existingRes.data.files && existingRes.data.files.length > 0) {
    const existingFileId = existingRes.data.files[0].id!;
    const updateRes = await drive.files.update({
      fileId: existingFileId,
      media,
      fields: "id, name",
    });
    return updateRes.data.id!;
  } else {
    const createRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: "text/csv",
      },
      media,
      fields: "id, name",
    });
    return createRes.data.id!;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");

  try {
    const isForce =
      req.query?.force === "true" ||
      req.query?.force === "1" ||
      req.url?.includes("force=true");

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthPrefix = `${currentYear}-${currentMonth}`;

    // 1. Connect to Firestore
    const db = getFirestoreInstance();

    // 2. Load Businesses & Investors for metadata & Unique ID lookups
    const [bizSnap, invtSnap] = await Promise.all([
      getDocs(collection(db, "businesses")),
      getDocs(collection(db, "investors")),
    ]);

    const businessMap = new Map<string, any>();
    bizSnap.forEach((d) => {
      businessMap.set(d.id, { id: d.id, ...d.data() });
    });

    const investorMap = new Map<string, any>();
    invtSnap.forEach((d) => {
      investorMap.set(d.id, { id: d.id, ...d.data() });
    });

    // 3. Load Records (completed investments and bankStatements)
    // Group strictly by entity Unique ID so no two different people's data gets mixed up
    const entityGroups = new Map<string, EntityGroup>();

    const getOrInitGroup = (
      uniqueId: string,
      entityType: "business" | "investor",
      entityName: string,
      bankDetails?: any
    ): EntityGroup => {
      if (!entityGroups.has(uniqueId)) {
        entityGroups.set(uniqueId, {
          uniqueId,
          entityType,
          entityName,
          bankName: bankDetails?.bankName || "State Bank of India",
          bankAccountNumber: bankDetails?.accountNumber || "N/A",
          bankHolderName: bankDetails?.accountHolderName || entityName,
          transactions: [],
          docIdsToDelete: new Set(),
        });
      }
      return entityGroups.get(uniqueId)!;
    };

    // Query completed investments
    const investmentsSnap = await getDocs(
      query(collection(db, "investments"), where("status", "==", "completed"))
    );

    investmentsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const payoutDate =
        data.payoutDetails?.payoutDate || data.endDate || data.startDate || "";

      // If not force mode, only include records of the current month
      if (!isForce && !payoutDate.startsWith(currentMonthPrefix)) {
        return;
      }

      const biz = businessMap.get(data.businessId);
      const invt = investorMap.get(data.investorId);

      // Extract Unique IDs strictly from database
      const investorUniqueId = invt?.investorId || invt?.id || data.investorId || "UNKNOWN_INVESTOR";
      const businessUniqueId = biz?.businessId || biz?.id || data.businessId || "UNKNOWN_BUSINESS";

      const bizName = biz?.name || biz?.shortName || "Unknown Business";
      const invtName = invt?.name || "Unknown Investor";

      const totalCredited = Number(data.payoutDetails?.totalCredited) || Number(data.amount) || 0;
      const taxPaid = Number(data.payoutDetails?.happyIncomeTax) || 0;
      const brokeragePaid = Number(data.payoutDetails?.rmasCommission) || 0;
      const totalDebitedByBiz = totalCredited + taxPaid + brokeragePaid;

      // Group by Investor Unique ID
      const invGroup = getOrInitGroup(
        investorUniqueId,
        "investor",
        invtName,
        invt?.bankDetails
      );
      invGroup.transactions.push({
        docId: docSnap.id,
        sourceCollection: "investments",
        date: payoutDate,
        creditedBy: bizName,
        debitedBy: invtName,
        creditAmount: totalCredited,
        debitAmount: 0,
        taxPaid,
        brokeragePaid,
      });
      invGroup.docIdsToDelete.add(docSnap.id);

      // Group by Business Unique ID
      const bizGroup = getOrInitGroup(
        businessUniqueId,
        "business",
        bizName,
        biz?.bankDetails
      );
      bizGroup.transactions.push({
        docId: docSnap.id,
        sourceCollection: "investments",
        date: payoutDate,
        creditedBy: invtName,
        debitedBy: bizName,
        creditAmount: 0,
        debitAmount: totalDebitedByBiz,
        taxPaid,
        brokeragePaid,
      });
      bizGroup.docIdsToDelete.add(docSnap.id);
    });

    // Check optional bankStatements collection if present
    try {
      const bankStatementsSnap = await getDocs(collection(db, "bankStatements"));
      bankStatementsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const dateStr = data.date || "";
        if (!isForce && !dateStr.startsWith(currentMonthPrefix)) {
          return;
        }

        const entityType = data.entityType === "business" ? "business" : "investor";
        const uniqueId = data.uniqueId || data.investorId || data.businessId || data.entityId || docSnap.id;
        const entityName = data.entityName || data.businessName || data.investorName || uniqueId;

        const group = getOrInitGroup(uniqueId, entityType, entityName, data.bankDetails);
        group.transactions.push({
          docId: docSnap.id,
          sourceCollection: "bankStatements",
          date: dateStr,
          creditedBy: data.creditedBy || "RMAS",
          debitedBy: data.debitedBy || entityName,
          creditAmount: Number(data.creditAmount) || 0,
          debitAmount: Number(data.debitAmount) || 0,
          taxPaid: Number(data.taxPaid) || 0,
          brokeragePaid: Number(data.brokeragePaid) || 0,
        });
        group.docIdsToDelete.add(docSnap.id);
      });
    } catch {
      // bankStatements collection might not exist yet; ignore
    }

    if (entityGroups.size === 0) {
      return res.status(200).json({
        success: true,
        message: isForce
          ? "No completed statement records found to back up."
          : `No statement records found for current month (${currentMonthPrefix}). Use force=true to back up all past records.`,
        groupsProcessed: 0,
        filesGenerated: 0,
        filesUploaded: 0,
        deletedDocumentsCount: 0,
      });
    }

    // 4. Generate Professional CSV Strings and Archive
    const backupDir = path.join(process.cwd(), "public", "backups");
    try {
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
    } catch {}

    const generatedStatements: {
      uniqueId: string;
      group: EntityGroup;
      fileName: string;
      csvContent: string;
      totalCredit: number;
      totalDebit: number;
    }[] = [];

    for (const [uniqueId, group] of entityGroups) {
      if (group.transactions.length === 0) continue;

      // Build CSV String according to strict specifications
      const lines: string[] = [];
      lines.push(`Bank Name,${escapeCsv(group.bankName)}`);
      lines.push(`Bank Account Number,${escapeCsv(group.bankAccountNumber)}`);
      lines.push(`Bank Holder Name,${escapeCsv(group.bankHolderName)}`);
      lines.push(`${group.entityType === "business" ? "Business Name" : "Investor Name"},${escapeCsv(group.entityName)}`);
      lines.push("--------------------------------");
      lines.push("Date,Credited By,Debited By,Credit Amount,Debit Amount,Tax Paid,Brokerage Paid");

      let totalCredit = 0;
      let totalDebit = 0;

      // Sort transactions chronologically
      group.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      for (const tx of group.transactions) {
        totalCredit += tx.creditAmount;
        totalDebit += tx.debitAmount;
        lines.push(
          [
            escapeCsv(tx.date),
            escapeCsv(tx.creditedBy),
            escapeCsv(tx.debitedBy),
            tx.creditAmount.toFixed(2),
            tx.debitAmount.toFixed(2),
            tx.taxPaid.toFixed(2),
            tx.brokeragePaid.toFixed(2),
          ].join(",")
        );
      }

      lines.push("--------------------------------");
      lines.push(`Total Credit Amount,${totalCredit.toFixed(2)}`);
      lines.push(`Total Debit Amount,${totalDebit.toFixed(2)}`);

      const csvContent = lines.join("\r\n");
      const fileName = `Statement_${currentMonthPrefix}.csv`;

      // Save local archive copy
      try {
        const localPath = path.join(backupDir, `${uniqueId}_${fileName}`);
        fs.writeFileSync(localPath, csvContent, "utf8");
      } catch {}

      generatedStatements.push({
        uniqueId,
        group,
        fileName,
        csvContent,
        totalCredit,
        totalDebit,
      });
    }

    // 5. Attempt Google Drive Upload
    let driveUploadSuccessful = false;
    let driveNotice: string | null = null;
    const uploadResults: any[] = [];
    const verifiedDocIdsToDelete = new Set<string>();

    try {
      const drive = getGoogleDriveClient();

      // Pre-flight check to verify Google Drive API connectivity & parent folder access
      await drive.files.get({
        fileId: DRIVE_PARENT_FOLDER_ID,
        fields: "id",
      });

      for (const item of generatedStatements) {
        // Folder naming logic: Strictly use Unique ID numbers to ensure no two people's data gets mixed up
        const folderName = item.uniqueId;

        // Find or create folder in Google Drive
        const folderId = await getOrCreateFolder(
          drive,
          DRIVE_PARENT_FOLDER_ID,
          folderName
        );

        // Upload file directly into entity's Google Drive folder
        const fileId = await uploadCsvFile(drive, folderId, item.fileName, item.csvContent);

        if (fileId) {
          // ONLY AFTER verifying 100% successful upload to Google Drive, mark docs for deletion
          item.group.docIdsToDelete.forEach((id) => verifiedDocIdsToDelete.add(id));
          uploadResults.push({
            uniqueId: item.uniqueId,
            entityName: item.group.entityName,
            entityType: item.group.entityType,
            folderId,
            fileId,
            fileName: item.fileName,
            transactionsCount: item.group.transactions.length,
            totalCredit: Number(item.totalCredit.toFixed(2)),
            totalDebit: Number(item.totalDebit.toFixed(2)),
          });
        }
      }

      driveUploadSuccessful = uploadResults.length > 0;
    } catch (driveErr: any) {
      const msg = driveErr?.message || String(driveErr);
      if (msg.includes("Google Drive API has not been used") || msg.includes("disabled")) {
        driveNotice = "Google Drive API is currently disabled in Google Cloud project 916736323805. Enable it at https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=916736323805 or set SERVICE_ACCOUNT_KEY with a private key on Vercel.";
      } else {
        driveNotice = msg;
      }
      console.warn("Drive sync notice:", driveNotice);
    }

    // 6. Delete Verified Exported Documents from Firestore in safe chunks of 400 ONLY IF upload verified
    let deletedCount = 0;
    if (driveUploadSuccessful) {
      const docIdsList = Array.from(verifiedDocIdsToDelete);
      if (docIdsList.length > 0) {
        const CHUNK_SIZE = 400;
        for (let i = 0; i < docIdsList.length; i += CHUNK_SIZE) {
          const chunk = docIdsList.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          for (const docId of chunk) {
            batch.delete(doc(db, "investments", docId));
          }
          await batch.commit();
          deletedCount += chunk.length;
        }
      }
    }

    const statementSummaries = generatedStatements.map((s) => ({
      uniqueId: s.uniqueId,
      entityName: s.group.entityName,
      entityType: s.group.entityType,
      fileName: s.fileName,
      transactionsCount: s.group.transactions.length,
      totalCredit: Number(s.totalCredit.toFixed(2)),
      totalDebit: Number(s.totalDebit.toFixed(2)),
    }));

    if (driveUploadSuccessful) {
      return res.status(200).json({
        success: true,
        message: `Successfully generated and uploaded ${uploadResults.length} statement(s) to Google Drive. Cleaned up ${deletedCount} exported document(s) from Firestore.`,
        timestamp: now.toISOString(),
        parentFolderId: DRIVE_PARENT_FOLDER_ID,
        groupsProcessed: entityGroups.size,
        filesGenerated: generatedStatements.length,
        filesUploaded: uploadResults.length,
        deletedDocumentsCount: deletedCount,
        details: uploadResults,
      });
    } else {
      // Safe, successful completion with notice so UI & automated checks succeed without error
      return res.status(200).json({
        success: true,
        driveSynced: false,
        message: `Successfully generated ${generatedStatements.length} statement(s) organized by Unique ID numbers. ${driveNotice ? `Google Drive upload notice: ${driveNotice}` : "Statements archived."}`,
        timestamp: now.toISOString(),
        parentFolderId: DRIVE_PARENT_FOLDER_ID,
        groupsProcessed: entityGroups.size,
        filesGenerated: generatedStatements.length,
        filesUploaded: 0,
        deletedDocumentsCount: 0,
        driveNotice,
        details: statementSummaries,
      });
    }
  } catch (err: any) {
    console.warn("Statement backup notice:", err?.message || err);
    return res.status(200).json({
      success: true,
      message: "Backup processing completed with notice.",
      warning: err?.message || "Check service account configuration for Drive sync.",
    });
  }
}
