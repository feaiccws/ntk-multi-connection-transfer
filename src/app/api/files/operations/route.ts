import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { operation, connectionId, path, newName, destination, paths } = body;

    // Simulate operation delay
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

    let result;
    let logAction = operation;

    switch (operation) {
      case "rename":
        if (!path || !newName) {
          return NextResponse.json({ error: "Path and new name required" }, { status: 400 });
        }
        const oldName = path.split("/").pop();
        const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
        const newPath = `${parentPath}/${newName}`.replace("//", "/");
        result = {
          success: true,
          oldPath: path,
          newPath,
          message: `Renamed "${oldName}" to "${newName}"`,
        };
        break;

      case "createFolder":
        if (!path || !newName) {
          return NextResponse.json({ error: "Path and folder name required" }, { status: 400 });
        }
        const folderPath = `${path}/${newName}`.replace("//", "/");
        result = {
          success: true,
          path: folderPath,
          message: `Created folder "${newName}"`,
        };
        logAction = "create_folder";
        break;

      case "move":
        if (!paths || !destination) {
          return NextResponse.json({ error: "Paths and destination required" }, { status: 400 });
        }
        result = {
          success: true,
          moved: paths.length,
          destination,
          message: `Moved ${paths.length} item(s) to ${destination}`,
        };
        break;

      case "copy":
        if (!paths || !destination) {
          return NextResponse.json({ error: "Paths and destination required" }, { status: 400 });
        }
        result = {
          success: true,
          copied: paths.length,
          destination,
          message: `Copied ${paths.length} item(s) to ${destination}`,
        };
        break;

      case "chmod":
        if (!path || !body.permissions) {
          return NextResponse.json({ error: "Path and permissions required" }, { status: 400 });
        }
        result = {
          success: true,
          path,
          permissions: body.permissions,
          message: `Changed permissions to ${body.permissions}`,
        };
        break;

      default:
        return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
    }

    // Log activity
    await db.insert(activityLogs).values({
      connectionId: connectionId || undefined,
      action: logAction,
      path: path || paths?.[0],
      details: body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error performing file operation:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
