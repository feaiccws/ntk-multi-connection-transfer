import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { connectionId, paths } = body;

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "Paths array is required" }, { status: 400 });
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

    // Simulate deletion - in production, this would connect to actual servers
    // and delete the files/folders
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));

    return NextResponse.json({
      success: true,
      deleted: paths,
      message: `Successfully deleted ${paths.length} item(s)`,
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 });
  }
}
