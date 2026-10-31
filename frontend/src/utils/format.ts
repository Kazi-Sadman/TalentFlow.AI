export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B";
  }
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(0) + " KB";
  }
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// "C#, SQL , Git" -> ["C#", "SQL", "Git"]
export function splitSkills(text: string | null | undefined): string[] {
  if (!text) {
    return [];
  }
  return text
    .split(/[,;\n]/)
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item.length > 0;
    });
}

// <input type="datetime-local"> value -> ISO text in UTC (for the API)
export function localInputToIso(value: string): string | null {
  if (!value) {
    return null;
  }
  return new Date(value).toISOString();
}

// ISO text from the API -> value for <input type="datetime-local">
export function isoToLocalInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function homePathFor(role: string): string {
  if (role === "Recruiter") {
    return "/recruiter";
  }
  return "/candidate/applications";
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

export function isPast(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  return new Date(value).getTime() < Date.now();
}
