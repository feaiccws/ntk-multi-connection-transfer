export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getConnectionIcon(type: string): string {
  const icons: Record<string, string> = {
    ftp: "🔗",
    sftp: "🔒",
    ftps: "🛡️",
    s3: "☁️",
    google_drive: "📁",
    dropbox: "💧",
    onedrive: "🌐",
    azure_blob: "🔷",
    local: "💻",
    webdav: "🌍",
  };
  return icons[type] || "📂";
}

export function getConnectionLabel(type: string): string {
  const labels: Record<string, string> = {
    ftp: "FTP",
    sftp: "SFTP",
    ftps: "FTPS",
    s3: "Amazon S3",
    google_drive: "Google Drive",
    dropbox: "Dropbox",
    onedrive: "OneDrive",
    azure_blob: "Azure Blob",
    local: "Local Storage",
    webdav: "WebDAV",
  };
  return labels[type] || type;
}

export function getTransferTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    local_to_remote: "Local → Remote",
    remote_to_remote: "Remote → Remote",
    cloud_to_cloud: "Cloud → Cloud",
    cloud_to_remote: "Cloud → Remote",
    cloud_to_local: "Cloud → Local",
    local_to_local: "Local → Local",
    local_to_cloud: "Local → Cloud",
    remote_to_local: "Remote → Local",
    remote_to_cloud: "Remote → Cloud",
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-warning-500",
    in_progress: "bg-primary-500",
    completed: "bg-success-500",
    failed: "bg-danger-500",
    cancelled: "bg-surface-500",
    paused: "bg-warning-600",
  };
  return colors[status] || "bg-surface-500";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
