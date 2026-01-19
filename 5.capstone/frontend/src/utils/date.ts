/**
 * Get current date/time in Indian Standard Time (IST)
 */
export const getNowIST = (): Date => {
  const now = new Date();
  // Get IST time by using toLocaleString with Asia/Kolkata timezone
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(istString);
};

/**
 * Get tomorrow's date in IST formatted as YYYY-MM-DD for date input
 */
export const getTomorrowIST = (): string => {
  const nowIST = getNowIST();
  const tomorrow = new Date(nowIST);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Get date components in IST
  const istString = tomorrow.toLocaleString("en-IN", {
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
  
  // Fallback: use direct date methods
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Convert a date string to IST Date object
 */
export const parseDateIST = (dateString: string | Date | null | undefined): Date | null => {
  if (!dateString) return null;
  
  if (dateString instanceof Date) {
    return dateString;
  }
  
  try {
    // Parse YYYY-MM-DD format
    const [year, month, day] = dateString.split("-").map(Number);
    
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Create a date string in IST format and parse it
      const istDateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+05:30`;
      const date = new Date(istDateString);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Fallback: try parsing as ISO string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
};

/**
 * Format date to IST date string (YYYY-MM-DD) for date inputs
 */
export const formatDateInputIST = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "";
    
    // Get date components in IST
    const istString = dateObj.toLocaleString("en-IN", {
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
  } catch {
    return "";
  }
};

export const formatDateIST = (dateString?: string | Date | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateISTShort = (dateString?: string | Date | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
  
    return date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
    });
  };
