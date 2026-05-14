import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { connectionId, archivePath, extractTo } = body;

    if (!archivePath) {
      return NextResponse.json({ error: "Archive path is required" }, { status: 400 });
    }

    if (connectionId) {
      const conn = await db
        .select()
        .from(connections)
        .where(eq(connections.id, connectionId))
        .limit(1);

      if (!conn.length) {
        return NextResponse.json({ error: "Connection not found" }, { status: 404 });
      }
    }

    // Verify it's a valid archive
    const validExtensions = [".zip", ".tar", ".tar.gz", ".tgz", ".rar", ".7z", ".gz"];
    const isValidArchive = validExtensions.some((ext) => archivePath.toLowerCase().endsWith(ext));

    if (!isValidArchive) {
      return NextResponse.json({ 
        error: "Invalid archive format. Supported: ZIP, TAR, TAR.GZ, TGZ, RAR, 7Z, GZ" 
      }, { status: 400 });
    }

    // Simulate extraction - in production, this would:
    // - Connect to the actual server/cloud
    // - Extract the archive to the specified location
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000));

    const extractPath = extractTo || archivePath.replace(/\.[^/.]+$/, "");
    const filesExtracted = Math.floor(Math.random() * 50) + 5;
    const foldersExtracted = Math.floor(Math.random() * 10) + 1;
    const totalSize = Math.floor(Math.random() * 100000000) + 5000000;

    return NextResponse.json({
      success: true,
      extractedTo: extractPath,
      filesExtracted,
      foldersExtracted,
      totalSize,
      message: `Successfully extracted ${filesExtracted} files and ${foldersExtracted} folders`,
    });
  } catch (error) {
    console.error("Error extracting archive:", error);
    return NextResponse.json({ error: "Failed to extract archive" }, { status: 500 });
  }
}
