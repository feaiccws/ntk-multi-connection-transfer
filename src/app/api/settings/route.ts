import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const defaultSettings = {
  theme: "light",
  defaultTransferMode: "auto",
  defaultBasePath: "/",
  timezone: "UTC",
  showNotifications: true,
  autoRetry: true,
  darkMode: false,
  encryptConnections: true,
  verifySSL: true,
  storeCredentialsSecurely: true,
  twoFactorAuth: false,
  sessionTimeout: 30,
  connectionTimeout: 30,
  maxRetryAttempts: 3,
  passiveFTP: true,
  useProxy: false,
  bandwidthLimit: 0,
  concurrentTransfers: 3,
  chunkSize: 10,
  multiThreaded: true,
  resumeInterrupted: true,
  compressDuringTransfer: false,
};

export async function GET() {
  try {
    const results = await db.select().from(userSettings);
    
    const settings = { ...defaultSettings };
    for (const row of results) {
      if (row.key in settings) {
        (settings as Record<string, unknown>)[row.key] = row.value;
      }
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    for (const [key, value] of Object.entries(body)) {
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(userSettings)
          .set({ value: value as Record<string, unknown>, updatedAt: new Date() })
          .where(eq(userSettings.key, key));
      } else {
        await db.insert(userSettings).values({
          key,
          value: value as Record<string, unknown>,
        });
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
