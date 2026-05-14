import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recentFiles } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(recentFiles)
      .orderBy(desc(recentFiles.accessedAt))
      .limit(20);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching recent files:", error);
    return NextResponse.json({ error: "Failed to fetch recent files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if already exists
    const existing = await db
      .select()
      .from(recentFiles)
      .where(
        and(
          eq(recentFiles.path, body.path),
          body.connectionId 
            ? eq(recentFiles.connectionId, body.connectionId)
            : eq(recentFiles.connectionId, body.connectionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update access time
      await db
        .update(recentFiles)
        .set({ accessedAt: new Date() })
        .where(eq(recentFiles.id, existing[0].id));
      return NextResponse.json(existing[0]);
    }

    // Insert new
    const result = await db
      .insert(recentFiles)
      .values({
        connectionId: body.connectionId || null,
        path: body.path,
        name: body.name,
        isDirectory: body.isDirectory || false,
        size: body.size || null,
      })
      .returning();

    // Keep only last 50 entries
    const all = await db
      .select()
      .from(recentFiles)
      .orderBy(desc(recentFiles.accessedAt));
    
    if (all.length > 50) {
      const toDelete = all.slice(50);
      for (const item of toDelete) {
        await db.delete(recentFiles).where(eq(recentFiles.id, item.id));
      }
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding recent file:", error);
    return NextResponse.json({ error: "Failed to add recent file" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(recentFiles);
    return NextResponse.json({ success: true, message: "Recent files cleared" });
  } catch (error) {
    console.error("Error clearing recent files:", error);
    return NextResponse.json({ error: "Failed to clear recent files" }, { status: 500 });
  }
}
