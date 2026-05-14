import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(connections)
      .orderBy(desc(connections.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db
      .insert(connections)
      .values({
        name: body.name,
        type: body.type,
        host: body.host || null,
        port: body.port ? Number(body.port) : null,
        username: body.username || null,
        password: body.password || null,
        basePath: body.basePath || "/",
        accessKey: body.accessKey || null,
        secretKey: body.secretKey || null,
        bucket: body.bucket || null,
        region: body.region || null,
        token: body.token || null,
        config: body.config || null,
      })
      .returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await db.delete(connections).where(eq(connections.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}
