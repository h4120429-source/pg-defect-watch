export const PLANTS = ["NGM", "PGTL"] as const;
export const LOCATIONS = ["Pune", "Noida", "Bhiwadi"] as const;
export const LINES = ["Line 1", "Line 2", "Line 3", "Line 4"] as const;
export const SHIFTS = ["Shift A", "Shift B", "Shift C"] as const;
export const UNIT_TYPES = ["IDU", "ODU"] as const;
export const SEVERITIES = ["Major", "Minor"] as const;
export const ACTIONS = ["Scrap", "Repair"] as const;

export const IDU_DEFECTS = [
  "Solder Bridge",
  "Cold Solder",
  "Missing Component",
  "Wrong Component",
  "Tombstone",
  "Lifted Pad",
  "PCB Crack",
  "Burnt Component",
  "Dry Joint",
  "Short Circuit",
];

export const ODU_DEFECTS = [
  "Solder Bridge",
  "Cold Solder",
  "Missing Component",
  "Wrong Component",
  "Capacitor Damage",
  "Relay Failure",
  "Connector Issue",
  "PCB Warpage",
  "Trace Cut",
  "Component Shift",
];

export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export const ADMIN_PASSWORD = "admin123";
