import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq } from "drizzle-orm";

// Simulated file system for demo purposes
const mockFiles: Record<string, FileItem[]> = {
  "/": [
    { name: "Documents", path: "/Documents", isDirectory: true, size: 0, modified: "2024-01-15T10:30:00Z" },
    { name: "Images", path: "/Images", isDirectory: true, size: 0, modified: "2024-01-14T15:20:00Z" },
    { name: "Backups", path: "/Backups", isDirectory: true, size: 0, modified: "2024-01-13T08:45:00Z" },
    { name: "Downloads", path: "/Downloads", isDirectory: true, size: 0, modified: "2024-01-12T22:10:00Z" },
    { name: "readme.txt", path: "/readme.txt", isDirectory: false, size: 2048, modified: "2024-01-15T09:00:00Z" },
    { name: "config.json", path: "/config.json", isDirectory: false, size: 1024, modified: "2024-01-14T11:30:00Z" },
  ],
  "/Documents": [
    { name: "report.pdf", path: "/Documents/report.pdf", isDirectory: false, size: 524288, modified: "2024-01-15T14:00:00Z" },
    { name: "notes.txt", path: "/Documents/notes.txt", isDirectory: false, size: 4096, modified: "2024-01-14T16:30:00Z" },
    { name: "spreadsheet.xlsx", path: "/Documents/spreadsheet.xlsx", isDirectory: false, size: 102400, modified: "2024-01-13T10:15:00Z" },
    { name: "presentation.pptx", path: "/Documents/presentation.pptx", isDirectory: false, size: 2097152, modified: "2024-01-12T09:45:00Z" },
  ],
  "/Images": [
    { name: "photo1.jpg", path: "/Images/photo1.jpg", isDirectory: false, size: 3145728, modified: "2024-01-15T11:00:00Z" },
    { name: "photo2.png", path: "/Images/photo2.png", isDirectory: false, size: 2097152, modified: "2024-01-14T14:20:00Z" },
    { name: "banner.svg", path: "/Images/banner.svg", isDirectory: false, size: 8192, modified: "2024-01-13T09:30:00Z" },
    { name: "Screenshots", path: "/Images/Screenshots", isDirectory: true, size: 0, modified: "2024-01-12T16:00:00Z" },
  ],
  "/Images/Screenshots": [
    { name: "screen1.png", path: "/Images/Screenshots/screen1.png", isDirectory: false, size: 1048576, modified: "2024-01-15T10:00:00Z" },
    { name: "screen2.png", path: "/Images/Screenshots/screen2.png", isDirectory: false, size: 1572864, modified: "2024-01-14T12:00:00Z" },
  ],
  "/Backups": [
    { name: "backup_2024_01.zip", path: "/Backups/backup_2024_01.zip", isDirectory: false, size: 52428800, modified: "2024-01-15T02:00:00Z" },
    { name: "backup_2023_12.zip", path: "/Backups/backup_2023_12.zip", isDirectory: false, size: 48234496, modified: "2023-12-31T02:00:00Z" },
    { name: "database.sql.gz", path: "/Backups/database.sql.gz", isDirectory: false, size: 10485760, modified: "2024-01-14T03:00:00Z" },
  ],
  "/Downloads": [
    { name: "installer.exe", path: "/Downloads/installer.exe", isDirectory: false, size: 104857600, modified: "2024-01-15T08:00:00Z" },
    { name: "archive.tar.gz", path: "/Downloads/archive.tar.gz", isDirectory: false, size: 26214400, modified: "2024-01-14T19:30:00Z" },
    { name: "data.csv", path: "/Downloads/data.csv", isDirectory: false, size: 5242880, modified: "2024-01-13T11:00:00Z" },
  ],
};

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");
    const path = searchParams.get("path") || "/";

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

    // Return mock files for demo - in production, this would connect to actual servers
    const files = mockFiles[path] || [];
    
    return NextResponse.json({
      path,
      files,
      parentPath: path === "/" ? null : path.split("/").slice(0, -1).join("/") || "/",
    });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
