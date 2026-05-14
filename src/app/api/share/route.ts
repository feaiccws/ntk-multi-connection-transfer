import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sharedLinks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(sharedLinks)
      .orderBy(desc(sharedLinks.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching shared links:", error);
    return NextResponse.json({ error: "Failed to fetch shared links" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.path || !body.name) {
      return NextResponse.json({ error: "Path and name are required" }, { status: 400 });
    }

    const token = uuidv4().replace(/-/g, "").substring(0, 16);
    
    let expiresAt = null;
    if (body.expiresIn) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + body.expiresIn);
    }

    const result = await db
      .insert(sharedLinks)
      .values({
        connectionId: body.connectionId || null,
        path: body.path,
        name: body.name,
        token,
        isPublic: body.isPublic !== false,
        password: body.password || null,
        expiresAt,
        maxDownloads: body.maxDownloads || null,
      })
      .returning();

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/share/${token}`;

    return NextResponse.json({
      ...result[0],
      shareUrl,
      message: "Share link created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await db.delete(sharedLinks).where(eq(sharedLinks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting share link:", error);
    return NextResponse.json({ error: "Failed to delete share link" }, { status: 500 });
  }
}
