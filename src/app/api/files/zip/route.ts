import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { connectionId, paths, outputPath, archiveName } = body;

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "Paths array is required" }, { status: 400 });
    }

    if (!archiveName) {
      return NextResponse.json({ error: "Archive name is required" }, { status: 400 });
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

    // Simulate zipping - in production, this would:
    // - Connect to the actual server/cloud
    // - Create a zip archive of selected files
    // - Save it to the specified location
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500));

    const finalPath = outputPath 
      ? `${outputPath}/${archiveName}.zip`
      : `/${archiveName}.zip`;

    // Calculate simulated compressed size
    const originalSize = Math.floor(Math.random() * 50000000) + 1000000;
    const compressedSize = Math.floor(originalSize * (0.3 + Math.random() * 0.4));

    return NextResponse.json({
      success: true,
      archivePath: finalPath,
      itemsCompressed: paths.length,
      originalSize,
      compressedSize,
      compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(1) + "%",
      message: `Successfully created ${archiveName}.zip with ${paths.length} item(s)`,
    });
  } catch (error) {
    console.error("Error creating zip:", error);
    return NextResponse.json({ error: "Failed to create zip archive" }, { status: 500 });
  }
}
