import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Helper to check if the path is secure and remains inside public/data
function getSecurePath(requestedPath: string) {
  const rootDir = process.cwd();
  const targetPath = path.resolve(rootDir, requestedPath);
  const dataDir = path.resolve(rootDir, "public/data");

  if (!targetPath.startsWith(dataDir)) {
    throw new Error("Access denied: Path must be inside public/data");
  }
  return targetPath;
}

export async function GET(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Forbidden: Local file editing is only allowed in development mode." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("filePath");

  if (!filePath) {
    return NextResponse.json({ error: "Missing filePath query parameter" }, { status: 400 });
  }

  try {
    const securePath = getSecurePath(filePath);
    const content = await fs.readFile(securePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: error.message || "Failed to read file" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Forbidden: Local file editing is only allowed in development mode." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    if (body.action === "backup") {
      const rootDir = process.cwd();
      const dataDir = path.resolve(rootDir, "public/data");
      const backupDir = path.resolve(dataDir, "backups", "backup_" + Date.now());
      
      const copyDir = async (src: string, dest: string) => {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });
        for (let entry of entries) {
          if (entry.name === "backups") continue; // Avoid backing up backups recursively
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
          } else {
            await fs.copyFile(srcPath, destPath);
          }
        }
      };
      
      await copyDir(dataDir, backupDir);
      return NextResponse.json({ success: true, message: `Backup created at public/data/backups/${path.basename(backupDir)}` });
    }

    const { filePath, data } = body;

    if (!filePath || !data) {
      return NextResponse.json({ error: "Missing filePath or data in request body" }, { status: 400 });
    }

    const securePath = getSecurePath(filePath);
    
    // Ensure parent directories exist
    await fs.mkdir(path.dirname(securePath), { recursive: true });

    // Format JSON with 2-space indentation to keep it pretty and readable on git
    const formattedData = JSON.stringify(data, null, 2);
    
    await fs.writeFile(securePath, formattedData, "utf-8");
    
    return NextResponse.json({ success: true, message: `Successfully updated ${filePath}` });
  } catch (error: any) {
    console.error("Error writing file:", error);
    return NextResponse.json({ error: error.message || "Failed to write file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Forbidden: Local file editing is only allowed in development mode." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("filePath");

  if (!filePath) {
    return NextResponse.json({ error: "Missing filePath query parameter" }, { status: 400 });
  }

  try {
    const securePath = getSecurePath(filePath);
    
    // Delete file
    await fs.unlink(securePath);
    
    return NextResponse.json({ success: true, message: `Successfully deleted ${filePath}` });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: error.message || "Failed to delete file" }, { status: 500 });
  }
}
