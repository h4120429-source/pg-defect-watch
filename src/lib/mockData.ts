import { Defect, Employee, SessionRequest } from "./types";

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

export const mockDefects: Defect[] = [
  { id: "1", timestamp: hoursAgo(2), plant: "NGM", location: "Pune", line: "Line 1", shift: "Shift A", unitType: "IDU", defect: "Solder Bridge", severity: "Major", action: "Scrap", employeeName: "Rahul Sharma", employeeId: "EMP001", quantity: 3, remark: "Found during QC", model: "MSA-12K" },
  { id: "2", timestamp: hoursAgo(5), plant: "PGTL", location: "Noida", line: "Line 2", shift: "Shift B", unitType: "ODU", defect: "Cold Solder", severity: "Minor", action: "Repair", employeeName: "Amit Kumar", employeeId: "EMP002", quantity: 1, remark: "", model: "MSA-18K" },
  { id: "3", timestamp: daysAgo(1), plant: "NGM", location: "Bhiwadi", line: "Line 1", shift: "Shift A", unitType: "IDU", defect: "Missing Component", severity: "Major", action: "Scrap", employeeName: "Priya Singh", employeeId: "EMP003", quantity: 2, remark: "R45 missing", model: "MSA-24K" },
  { id: "4", timestamp: daysAgo(1), plant: "PGTL", location: "Pune", line: "Line 3", shift: "Shift C", unitType: "ODU", defect: "Capacitor Damage", severity: "Minor", action: "Repair", employeeName: "Rahul Sharma", employeeId: "EMP001", quantity: 1, remark: "", model: "MSA-12K" },
  { id: "5", timestamp: daysAgo(2), plant: "NGM", location: "Noida", line: "Line 2", shift: "Shift B", unitType: "IDU", defect: "Tombstone", severity: "Major", action: "Scrap", employeeName: "Amit Kumar", employeeId: "EMP002", quantity: 4, remark: "C12 tombstone", model: "MSA-18K" },
  { id: "6", timestamp: daysAgo(3), plant: "PGTL", location: "Bhiwadi", line: "Line 1", shift: "Shift A", unitType: "ODU", defect: "PCB Warpage", severity: "Minor", action: "Repair", employeeName: "Priya Singh", employeeId: "EMP003", quantity: 1, remark: "", model: "MSA-24K" },
];

export const mockEmployees: Employee[] = [
  { id: "1", name: "Rahul Sharma", email: "rahul@pg.com", employeeId: "EMP001", plant: "NGM", status: "approved", requestedAt: daysAgo(30), approvedAt: daysAgo(29), assignedAdminEmail: "admin@pg.com" },
  { id: "2", name: "Amit Kumar", email: "amit@pg.com", employeeId: "EMP002", plant: "PGTL", status: "approved", requestedAt: daysAgo(20), approvedAt: daysAgo(19), assignedAdminEmail: "admin@pg.com" },
  { id: "3", name: "Priya Singh", email: "priya@pg.com", employeeId: "EMP003", plant: "NGM", status: "pending", requestedAt: hoursAgo(3), assignedAdminEmail: "admin@pg.com" },
  { id: "4", name: "Vikram Patel", email: "vikram@pg.com", employeeId: "EMP004", plant: "PGTL", status: "pending", requestedAt: hoursAgo(1), assignedAdminEmail: "admin@pg.com" },
];

export const mockSessionRequests: SessionRequest[] = [
  { id: "1", employeeId: "EMP001", employeeName: "Rahul Sharma", location: "Pune", createdByAdminEmail: "admin@pg.com", requestedAt: hoursAgo(1), status: "pending" },
  { id: "2", employeeId: "EMP002", employeeName: "Amit Kumar", location: "Noida", createdByAdminEmail: "admin@pg.com", requestedAt: hoursAgo(2), status: "approved", approvedAt: hoursAgo(1) },
];
