import { NextRequest, NextResponse } from "next/server";

// Sample content for different file types
const sampleContent: Record<string, string> = {
  txt: `Welcome to FlowBridge File Preview

This is a sample text file demonstrating the preview functionality.
You can view and edit text files directly in the browser.

Features:
- Syntax highlighting for code files
- Image preview with zoom
- PDF document viewer
- Video playback support

Happy transferring! 🚀`,
  
  json: `{
  "name": "FlowBridge",
  "version": "1.0.0",
  "description": "Premium file transfer platform",
  "features": [
    "Multi-protocol support",
    "Cloud storage integration",
    "Scheduled transfers",
    "File management"
  ],
  "author": "FlowBridge Team"
}`,

  js: `// FlowBridge Configuration
const config = {
  maxConcurrentTransfers: 5,
  chunkSize: 1024 * 1024 * 10, // 10MB
  retryAttempts: 3,
  timeout: 30000,
};

async function transferFile(source, destination) {
  console.log(\`Transferring from \${source} to \${destination}\`);
  // Transfer logic here
  return { success: true };
}

export { config, transferFile };`,

  css: `/* FlowBridge Styles */
.file-manager {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1rem;
  height: 100vh;
}

.file-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.file-item:hover {
  background: #f5f5f5;
  cursor: pointer;
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FlowBridge</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <header>
      <h1>Welcome to FlowBridge</h1>
    </header>
    <main>
      <p>Your premium file transfer solution.</p>
    </main>
  </div>
</body>
</html>`,

  md: `# FlowBridge Documentation

## Getting Started

FlowBridge is a premium file transfer platform supporting multiple protocols.

### Supported Protocols

- **FTP** - File Transfer Protocol
- **SFTP** - SSH File Transfer Protocol  
- **FTPS** - FTP over SSL
- **S3** - Amazon S3 Compatible
- **WebDAV** - Web Distributed Authoring

### Quick Start

1. Add a connection
2. Browse files
3. Start transferring!

> **Tip:** Use keyboard shortcuts for faster navigation.`,

  py: `#!/usr/bin/env python3
"""FlowBridge Python SDK"""

import asyncio
from typing import List, Optional

class FlowBridgeClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.flowbridge.io"
    
    async def list_files(self, path: str = "/") -> List[dict]:
        """List files in a directory."""
        # Implementation here
        return []
    
    async def transfer(self, source: str, dest: str) -> bool:
        """Transfer a file."""
        print(f"Transferring {source} -> {dest}")
        return True

if __name__ == "__main__":
    client = FlowBridgeClient("your-api-key")
    asyncio.run(client.list_files())`,

  sql: `-- FlowBridge Database Schema

CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    host VARCHAR(255),
    port INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path TEXT NOT NULL,
    dest_path TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transfers_status ON transfers(status);`,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    const connectionId = searchParams.get("connectionId");

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const fileName = path.split("/").pop() || "";
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    // Determine file type
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "bmp"];
    const videoExts = ["mp4", "webm", "ogg", "mov", "avi"];
    const audioExts = ["mp3", "wav", "ogg", "m4a", "flac"];
    const pdfExts = ["pdf"];
    const codeExts = ["js", "ts", "jsx", "tsx", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "cs", "php", "swift", "kt"];
    const textExts = ["txt", "md", "json", "xml", "yaml", "yml", "csv", "log", "ini", "conf", "sh", "bash", "zsh", "html", "css", "scss", "sass", "less", "sql"];

    let fileType = "unknown";
    let content = null;
    let previewUrl = null;

    if (imageExts.includes(ext)) {
      fileType = "image";
      // Generate a placeholder image URL
      previewUrl = `https://picsum.photos/seed/${encodeURIComponent(fileName)}/800/600`;
    } else if (videoExts.includes(ext)) {
      fileType = "video";
      previewUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Sample video
    } else if (audioExts.includes(ext)) {
      fileType = "audio";
      previewUrl = "https://www.w3schools.com/html/horse.mp3"; // Sample audio
    } else if (pdfExts.includes(ext)) {
      fileType = "pdf";
      previewUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    } else if (codeExts.includes(ext) || textExts.includes(ext)) {
      fileType = "text";
      // Return sample content based on extension
      content = sampleContent[ext] || sampleContent.txt;
    }

    return NextResponse.json({
      success: true,
      path,
      fileName,
      extension: ext,
      fileType,
      content,
      previewUrl,
      size: Math.floor(Math.random() * 1000000) + 1000,
      modified: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error previewing file:", error);
    return NextResponse.json({ error: "Failed to preview file" }, { status: 500 });
  }
}
