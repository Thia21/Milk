// All session logic is based on Indian Standard Time (IST = UTC +5:30)

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getISTDate() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + IST_OFFSET_MS);
}

export function getISTTimeString() {
  const ist = getISTDate();
  return ist.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// Morning session: 00:00 – 11:59 IST
// Evening session: 12:00 – 23:59 IST
export function getActiveSession() {
  const ist = getISTDate();
  return ist.getHours() < 12 ? "morning" : "evening";
}

export function isSessionActive(sessionKey) {
  return getActiveSession() === sessionKey;
}

// Returns true if the given session is in the past (already done for today)
export function isSessionPast(sessionKey) {
  if (sessionKey === "morning") {
    return getISTDate().getHours() >= 12;
  }
  return false; // evening is never "past" within the same day
}

// Human-readable session window
export const SESSION_WINDOW = {
  morning: "Before 12:00 noon IST",
  evening: "12:00 noon – midnight IST",
};
