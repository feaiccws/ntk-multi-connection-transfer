import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transfers, connections } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(transfers)
      .orderBy(desc(transfers.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Look up connection names for enriching the transfer
    let srcConn = null;
    let dstConn = null;
    if (body.sourceConnectionId) {
      const r = await db
        .select()
        .from(connections)
        .where(eq(connections.id, body.sourceConnectionId))
        .limit(1);
      srcConn = r[0] || null;
    }
    if (body.destinationConnectionId) {
      const r = await db
        .select()
        .from(connections)
        .where(eq(connections.id, body.destinationConnectionId))
        .limit(1);
      dstConn = r[0] || null;
    }

    // Simulate file count and sizes
    const totalFiles = Math.floor(Math.random() * 50) + 1;
    const totalSize = Math.floor(Math.random() * 500_000_000) + 1_000_000;

    const result = await db
      .insert(transfers)
      .values({
        sourceConnectionId: body.sourceConnectionId || null,
        destinationConnectionId: body.destinationConnectionId || null,
        transferType: body.transferType,
        status: "in_progress",
        sourcePath: body.sourcePath || "/",
        destinationPath: body.destinationPath || "/",
        totalFiles,
        transferredFiles: 0,
        totalSize,
        transferredSize: 0,
        startedAt: new Date(),
      })
      .returning();

    // Simulate progress (mark as completed after creation)
    setTimeout(async () => {
      try {
        await db
          .update(transfers)
          .set({
            status: "completed",
            transferredFiles: totalFiles,
            transferredSize: totalSize,
            completedAt: new Date(),
            speed: `${(Math.random() * 50 + 10).toFixed(1)} MB/s`,
          })
          .where(eq(transfers.id, result[0].id));
      } catch {
        // Ignore errors in background task
      }
    }, 3000);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
