import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transfers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const transfer = await db
      .select()
      .from(transfers)
      .where(eq(transfers.id, id))
      .limit(1);

    if (!transfer.length) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    const current = transfer[0];
    let updates: Record<string, unknown> = {};
    let message = "";

    switch (action) {
      case "pause":
        if (current.status !== "in_progress") {
          return NextResponse.json({ error: "Can only pause active transfers" }, { status: 400 });
        }
        updates = { status: "paused", pausedAt: new Date() };
        message = "Transfer paused";
        break;

      case "resume":
        if (current.status !== "paused") {
          return NextResponse.json({ error: "Can only resume paused transfers" }, { status: 400 });
        }
        updates = { status: "in_progress", pausedAt: null };
        message = "Transfer resumed";
        
        // Simulate completion after resume
        setTimeout(async () => {
          try {
            await db
              .update(transfers)
              .set({
                status: "completed",
                transferredFiles: current.totalFiles,
                transferredSize: current.totalSize,
                completedAt: new Date(),
                speed: `${(Math.random() * 50 + 10).toFixed(1)} MB/s`,
              })
              .where(eq(transfers.id, id));
          } catch {
            // Ignore errors
          }
        }, 5000);
        break;

      case "cancel":
        if (current.status === "completed" || current.status === "cancelled") {
          return NextResponse.json({ error: "Cannot cancel this transfer" }, { status: 400 });
        }
        updates = { status: "cancelled" };
        message = "Transfer cancelled";
        break;

      case "retry":
        if (current.status !== "failed") {
          return NextResponse.json({ error: "Can only retry failed transfers" }, { status: 400 });
        }
        updates = {
          status: "in_progress",
          retryCount: (current.retryCount || 0) + 1,
          errorMessage: null,
          startedAt: new Date(),
        };
        message = "Transfer restarted";
        
        // Simulate completion after retry
        setTimeout(async () => {
          try {
            await db
              .update(transfers)
              .set({
                status: "completed",
                transferredFiles: current.totalFiles,
                transferredSize: current.totalSize,
                completedAt: new Date(),
                speed: `${(Math.random() * 50 + 10).toFixed(1)} MB/s`,
              })
              .where(eq(transfers.id, id));
          } catch {
            // Ignore errors
          }
        }, 4000);
        break;

      case "priority":
        const newPriority = body.priority || 5;
        updates = { priority: newPriority };
        message = `Priority set to ${newPriority}`;
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const result = await db
      .update(transfers)
      .set(updates)
      .where(eq(transfers.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      transfer: result[0],
      message,
    });
  } catch (error) {
    console.error("Error controlling transfer:", error);
    return NextResponse.json({ error: "Failed to control transfer" }, { status: 500 });
  }
}
