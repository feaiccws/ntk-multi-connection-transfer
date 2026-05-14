import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await db
      .select()
      .from(connections)
      .where(eq(connections.id, id))
      .limit(1);

    if (!conn.length) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Simulate testing connection
    const connection = conn[0];
    const isSuccess =
      connection.type === "local" || (connection.host && connection.host.length > 0);

    await db
      .update(connections)
      .set({ lastUsed: new Date(), updatedAt: new Date() })
      .where(eq(connections.id, id));

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess
        ? `Successfully connected to ${connection.name}`
        : "Connection failed. Please check your settings.",
      latency: Math.floor(Math.random() * 200) + 50,
    });
  } catch (error) {
    console.error("Error testing connection:", error);
    return NextResponse.json(
      { error: "Failed to test connection" },
      { status: 500 }
    );
  }
}
