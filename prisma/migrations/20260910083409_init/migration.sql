-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTRICE_CON_GRU', 'MOTRICE_SENZA_GRU', 'RIMORCHIO', 'MOTOCARRO');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('DISPONIBILE', 'MANUTENZIONE', 'FUORI_SERVIZIO');

-- CreateEnum
CREATE TYPE "DriverRole" AS ENUM ('AUTISTA', 'AUTISTA_UFFICIO');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('ATTIVO', 'INATTIVO');

-- CreateEnum
CREATE TYPE "OfficeUserRole" AS ENUM ('STANDARD', 'ADMIN');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DA_FARE', 'IN_CORSO', 'COMPLETATO', 'ANNULLATO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('OFFICE', 'DRIVER');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "maxExternalHeight" DOUBLE PRECISION,
    "maxExternalLength" DOUBLE PRECISION,
    "maxExternalWidth" DOUBLE PRECISION,
    "bedHeightFromGround" DOUBLE PRECISION,
    "internalBedLength" DOUBLE PRECISION,
    "internalBedWidth" DOUBLE PRECISION,
    "maxTransportableLength" DOUBLE PRECISION,
    "maxRearOverhang" DOUBLE PRECISION,
    "maxTransportableHeight" DOUBLE PRECISION,
    "payloadCapacity" INTEGER NOT NULL,
    "tare" INTEGER NOT NULL,
    "hasCrane" BOOLEAN NOT NULL DEFAULT false,
    "craneModel" TEXT,
    "craneMaxReach" DOUBLE PRECISION,
    "craneSide" TEXT,
    "tailgateLiftCapacity" INTEGER,
    "towableLoad" INTEGER,
    "maxCraneAndTrailerLoad" INTEGER,
    "notes" TEXT,
    "status" "VehicleStatus" NOT NULL DEFAULT 'DISPONIBILE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleConfiguration" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxExternalHeight" DOUBLE PRECISION,
    "maxExternalLength" DOUBLE PRECISION,
    "internalBedLength" DOUBLE PRECISION,
    "internalBedWidth" DOUBLE PRECISION,
    "maxTransportableLength" DOUBLE PRECISION,
    "maxTransportableHeight" DOUBLE PRECISION,
    "payloadCapacity" INTEGER NOT NULL,
    "tare" INTEGER NOT NULL,
    "hasCrane" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraneCapacityCurve" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "configName" TEXT NOT NULL DEFAULT 'standard',
    "stabilizerConfig" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CraneCapacityCurve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraneCapacityPoint" (
    "id" TEXT NOT NULL,
    "curveId" TEXT NOT NULL,
    "radiusMeters" DOUBLE PRECISION NOT NULL,
    "capacityKg" INTEGER NOT NULL,

    CONSTRAINT "CraneCapacityPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "role" "DriverRole" NOT NULL DEFAULT 'AUTISTA',
    "status" "DriverStatus" NOT NULL DEFAULT 'ATTIVO',
    "defaultVehicleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "OfficeUserRole" NOT NULL DEFAULT 'STANDARD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "trailerId" TEXT,
    "vehicleConfigId" TEXT,
    "cargoDescription" TEXT NOT NULL,
    "cargoWeight" INTEGER,
    "cargoLength" DOUBLE PRECISION,
    "cargoWidth" DOUBLE PRECISION,
    "cargoHeight" DOUBLE PRECISION,
    "palletCount" INTEGER,
    "needsCrane" BOOLEAN NOT NULL DEFAULT false,
    "craneWorkRadius" DOUBLE PRECISION,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "clientOrderNumber" TEXT,
    "notes" TEXT,
    "status" "TripStatus" NOT NULL DEFAULT 'DA_FARE',
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "startLatitude" DOUBLE PRECISION,
    "startLongitude" DOUBLE PRECISION,
    "endLatitude" DOUBLE PRECISION,
    "endLongitude" DOUBLE PRECISION,
    "workedMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "createdByType" "UserType",

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripAuditLog" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "officeUserId" TEXT,
    "driverIdActor" TEXT,
    "userType" "UserType" NOT NULL,
    "action" "AuditAction" NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GpsTrackPoint" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GpsTrackPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "VehicleConfiguration_vehicleId_idx" ON "VehicleConfiguration"("vehicleId");

-- CreateIndex
CREATE INDEX "CraneCapacityCurve_vehicleId_idx" ON "CraneCapacityCurve"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "CraneCapacityCurve_vehicleId_configName_stabilizerConfig_key" ON "CraneCapacityCurve"("vehicleId", "configName", "stabilizerConfig");

-- CreateIndex
CREATE INDEX "CraneCapacityPoint_curveId_radiusMeters_idx" ON "CraneCapacityPoint"("curveId", "radiusMeters");

-- CreateIndex
CREATE INDEX "Driver_defaultVehicleId_idx" ON "Driver"("defaultVehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeUser_email_key" ON "OfficeUser"("email");

-- CreateIndex
CREATE INDEX "Trip_date_driverId_idx" ON "Trip"("date", "driverId");

-- CreateIndex
CREATE INDEX "Trip_date_status_idx" ON "Trip"("date", "status");

-- CreateIndex
CREATE INDEX "Trip_driverId_idx" ON "Trip"("driverId");

-- CreateIndex
CREATE INDEX "Trip_vehicleId_idx" ON "Trip"("vehicleId");

-- CreateIndex
CREATE INDEX "Trip_trailerId_idx" ON "Trip"("trailerId");

-- CreateIndex
CREATE INDEX "TripAuditLog_tripId_timestamp_idx" ON "TripAuditLog"("tripId", "timestamp");

-- CreateIndex
CREATE INDEX "TripAuditLog_officeUserId_idx" ON "TripAuditLog"("officeUserId");

-- CreateIndex
CREATE INDEX "GpsTrackPoint_tripId_timestamp_idx" ON "GpsTrackPoint"("tripId", "timestamp");

-- CreateIndex
CREATE INDEX "GpsTrackPoint_driverId_timestamp_idx" ON "GpsTrackPoint"("driverId", "timestamp");

-- AddForeignKey
ALTER TABLE "VehicleConfiguration" ADD CONSTRAINT "VehicleConfiguration_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraneCapacityCurve" ADD CONSTRAINT "CraneCapacityCurve_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraneCapacityPoint" ADD CONSTRAINT "CraneCapacityPoint_curveId_fkey" FOREIGN KEY ("curveId") REFERENCES "CraneCapacityCurve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_defaultVehicleId_fkey" FOREIGN KEY ("defaultVehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripAuditLog" ADD CONSTRAINT "TripAuditLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripAuditLog" ADD CONSTRAINT "TripAuditLog_officeUserId_fkey" FOREIGN KEY ("officeUserId") REFERENCES "OfficeUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GpsTrackPoint" ADD CONSTRAINT "GpsTrackPoint_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GpsTrackPoint" ADD CONSTRAINT "GpsTrackPoint_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
