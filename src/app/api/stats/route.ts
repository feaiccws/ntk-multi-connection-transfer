import { NextResponse } from "next/server";
import { db } from "@/db";
import { connections, transfers } from "@/db/schema";
import { eq, count, sum } from "drizzle-orm";

export async function GET() {
  try {
    const [connCount] = await db.select({ value: count() }).from(connections);
    const [transferCount] = await db.select({ value: count() }).from(transfers);
    const [completedCount] = await db
      .select({ value: count() })
      .from(transfers)
      .where(eq(transfers.status, "completed"));
    const [failedCount] = await db
      .select({ value: count() })
      .from(transfers)
      .where(eq(transfers.status, "failed"));
    const [totalData] = await db
      .select({ value: sum(transfers.transferredSize) })
      .from(transfers)
      .where(eq(transfers.status, "completed"));

    return NextResponse.json({
      totalConnections: connCount.value,
      totalTransfers: transferCount.value,
      completedTransfers: completedCount.value,
      failedTransfers: failedCount.value,
      totalDataTransferred: Number(totalData.value || 0),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
