/**
 * Date utility functions for Indian Standard Time (IST)
 * IST is UTC+5:30
 * Note: MongoDB stores dates in UTC, so we need to convert properly
 */

/**
 * Get current date/time in Indian Standard Time (IST)
 * Returns a Date object representing current IST time
 */
export function getNowIST(): Date {
  const now = new Date();
  // Get IST time by using toLocaleString with Asia/Kolkata timezone
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(istString);
}

/**
 * Get tomorrow's date at midnight IST
 * Returns a Date object representing tomorrow 00:00:00 IST
 */
export function getTomorrowIST(): Date {
  const nowIST = getNowIST();
  const tomorrow = new Date(nowIST);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Parse a date string (YYYY-MM-DD) and convert it to a Date object
 * The date string is interpreted as a date in IST timezone
 * Returns a Date object that, when converted to IST, represents the given date at midnight
 */
export function parseDateIST(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    // Parse YYYY-MM-DD format
    const [year, month, day] = dateString.split("-").map(Number);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      // Try parsing as ISO string or other format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    }
    
    // Create a date string in IST format and parse it
    // This ensures the date is interpreted in IST timezone
    const istDateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+05:30`;
    const date = new Date(istDateString);
    
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (error) {
    return null;
  }
}

/**
 * Format a Date object to IST date string (YYYY-MM-DD)
 * Extracts the date components as they appear in IST timezone
 */
export function formatDateInputIST(date: Date | null | undefined): string {
  if (!date) return "";
  
  try {
    // Get date components in IST
    const istString = date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    
    // Convert from DD/MM/YYYY to YYYY-MM-DD
    const parts = istString.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  } catch (error) {
    return "";
  }
}
