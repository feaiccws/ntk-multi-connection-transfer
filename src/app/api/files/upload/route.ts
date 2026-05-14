import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const connectionId = formData.get("connectionId") as string | null;
    const path = formData.get("path") as string || "/";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Simulate upload - in production, this would upload to actual storage
      await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
      
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        path: `${path}/${file.name}`.replace("//", "/"),
      });
    }

    // Log activity
    await db.insert(activityLogs).values({
      connectionId: connectionId || undefined,
      action: "upload",
      path,
      details: { files: uploadedFiles.map(f => f.name), count: files.length },
    });

    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles,
      message: `Successfully uploaded ${files.length} file(s)`,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
