import type { Vehicle, VehicleConfiguration, CraneCapacityCurve, CraneCapacityPoint, Driver, OfficeUser, Trip, TripAuditLog, GpsTrackPoint } from '@prisma/client';

// Vehicle with all relations loaded
export type VehicleWithRelations = Vehicle & {
  configurations: VehicleConfiguration[];
  craneCapacityCurves: (CraneCapacityCurve & {
    points: CraneCapacityPoint[];
  })[];
};

// Trip with driver and vehicle data
export type TripWithRelations = Trip & {
  driver: Driver;
  vehicle: Vehicle;
  trailer?: Vehicle | null;
};

// Trip with full audit log
export type TripWithAudit = TripWithRelations & {
  auditLogs: (TripAuditLog & {
    officeUser?: OfficeUser | null;
  })[];
};

// Planning view data: grouped by driver per day
export type PlanningDay = {
  date: Date;
  dateStr: string;
  dayOfWeek: string;
  drivers: {
    driver: Driver;
    trips: TripWithRelations[];
  }[];
};

// Session user type
export type SessionUser = {
  id: string;
  name: string;
  email?: string;
  role: 'OFFICE' | 'DRIVER' | 'ADMIN';
  userType: 'OFFICE' | 'DRIVER';
};

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Safety check types (re-exported for convenience)
export type { SafetyWarning, SafetyCheckInput, SafetyCheckResult, SafetyWarningLevel } from './safety-checks';
