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
CREATE TYPE "ManualHourCategory" AS ENUM ('CARICO_SCARICO', 'ATTESA', 'MANUTENZIONE', 'ALTRO');

-- CreateEnum
CREATE TYPE "ManualHourStatus" AS ENUM ('DA_APPROVARE', 'APPROVATO', 'RIFIUTATO');

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
    "profilePicture" TEXT,
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
    "driverId" TEXT,
    "vehicleId" TEXT,
    "trailerId" TEXT,
    "vehicleConfigId" TEXT,
    "cargoDescription" TEXT NOT NULL,
    "clientName" TEXT,
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
    "estimatedDurationMins" INTEGER,
    "estimatedDistanceKm" DOUBLE PRECISION,
    "actualCraneHours" DOUBLE PRECISION,
    "driverNotes" TEXT,
    "recipientSignature" TEXT,
    "recipientName" TEXT,
    "deliveryPhotoUrl" TEXT,
    "signedAt" TIMESTAMP(3),
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

-- CreateTable
CREATE TABLE "ManualWorkHour" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "ManualHourCategory" NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "minutes" INTEGER NOT NULL,
    "note" TEXT,
    "status" "ManualHourStatus" NOT NULL DEFAULT 'DA_APPROVARE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualWorkHour_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "ManualWorkHour" ADD CONSTRAINT "ManualWorkHour_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Seed Data (Utenti Ufficio, Autisti, Mezzi, Configurazioni, Curve Gru)
-- ---------------------------------------------------------------------------

INSERT INTO "OfficeUser" ("id", "name", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt") VALUES
  ('usr_sabrina', 'Sabrina', 'sabrina@saggin.it', '$2b$10$FjMib/MNs/DJ4UOMfX2Glui0x44eg.sRxS0vNgPV2G7fgaZ4XT416', 'STANDARD', true, NOW(), NOW()),
  ('usr_barbara', 'Barbara', 'barbara@saggin.it', '$2b$10$FjMib/MNs/DJ4UOMfX2Glui0x44eg.sRxS0vNgPV2G7fgaZ4XT416', 'STANDARD', true, NOW(), NOW()),
  ('usr_raffaella', 'Raffaella', 'raffaella@saggin.it', '$2b$10$FjMib/MNs/DJ4UOMfX2Glui0x44eg.sRxS0vNgPV2G7fgaZ4XT416', 'STANDARD', true, NOW(), NOW()),
  ('usr_mariangela', 'Mariangela', 'mariangela@saggin.it', '$2b$10$FjMib/MNs/DJ4UOMfX2Glui0x44eg.sRxS0vNgPV2G7fgaZ4XT416', 'STANDARD', true, NOW(), NOW()),
  ('usr_claudio', 'Claudio', 'claudio@saggin.it', '$2b$10$FjMib/MNs/DJ4UOMfX2Glui0x44eg.sRxS0vNgPV2G7fgaZ4XT416', 'STANDARD', true, NOW(), NOW()),
  ('usr_luca', 'Luca', 'luca@saggin.it', '$2b$10$FjMib/MNs/DJ4UOMfX2Glui0x44eg.sRxS0vNgPV2G7fgaZ4XT416', 'STANDARD', true, NOW(), NOW()),
  ('usr_mariasofia', 'Maria Sofia', 'mariasofia@saggin.it', '$2b$10$FjMib/MNs/DJ4UOMfX2Glui0x44eg.sRxS0vNgPV2G7fgaZ4XT416', 'STANDARD', true, NOW(), NOW()),
  ('usr_admin', 'Amministratore', 'admin@saggin.it', '$2b$10$tM2Wql3SAu2Zbby7Eu5Do.ZwCpdtpdBa3Aud3..LGJeda84BqlLiq', 'ADMIN', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Driver" ("id", "name", "pin", "role", "status", "createdAt", "updatedAt") VALUES
  ('drv_claudio', 'Claudio', '$2b$10$Kkh6RFVXHm4AfMThVe5EF.qrniFzbMMzuX2UTKxd2fap.SphwTdiO', 'AUTISTA_UFFICIO', 'ATTIVO', NOW(), NOW()),
  ('drv_luca', 'Luca', '$2b$10$Kkh6RFVXHm4AfMThVe5EF.qrniFzbMMzuX2UTKxd2fap.SphwTdiO', 'AUTISTA_UFFICIO', 'ATTIVO', NOW(), NOW()),
  ('drv_marino', 'Marino', '$2b$10$Kkh6RFVXHm4AfMThVe5EF.qrniFzbMMzuX2UTKxd2fap.SphwTdiO', 'AUTISTA', 'ATTIVO', NOW(), NOW()),
  ('drv_francesco', 'Francesco', '$2b$10$Kkh6RFVXHm4AfMThVe5EF.qrniFzbMMzuX2UTKxd2fap.SphwTdiO', 'AUTISTA', 'ATTIVO', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id", "name", "brand", "model", "licensePlate", "type", "maxExternalHeight", "maxExternalLength", "maxExternalWidth", "bedHeightFromGround", "internalBedLength", "internalBedWidth", "maxTransportableLength", "maxRearOverhang", "maxTransportableHeight", "payloadCapacity", "tare", "hasCrane", "craneModel", "craneMaxReach", "craneSide", "tailgateLiftCapacity", "towableLoad", "maxCraneAndTrailerLoad", "notes", "status", "createdAt", "updatedAt") VALUES
  ('veh_atego', 'MERCEDES ATEGO', 'Mercedes-Benz', 'Atego', 'DJ631BA', 'MOTRICE_CON_GRU', 3.30, 7.30, 2.52, 1.15, 4.40, 2.42, 9.50, 2.20, 2.85, 7500, 7500, true, 'Fassi F95AC.23', 7.40, 'lato guida', 2000, NULL, NULL, NULL, 'DISPONIBILE', NOW(), NOW()),
  ('veh_actros', 'MERCEDES ACTROS', 'Mercedes-Benz', 'Actros', 'CK527WX', 'MOTRICE_SENZA_GRU', 3.56, 9.00, 2.55, 1.26, 6.57, 2.48, 11.70, 2.70, 2.74, 15000, 10300, false, NULL, NULL, NULL, NULL, 15000, NULL, 'Può trainare il Rimorchio Actros', 'DISPONIBILE', NOW(), NOW()),
  ('veh_iveco', 'IVECO X-WAY', 'Iveco', 'X-Way', 'GD352ND', 'MOTRICE_CON_GRU', 3.75, 8.60, 3.00, NULL, 5.20, 2.46, 11.00, 2.60, 2.55, 10200, 15800, true, NULL, NULL, NULL, NULL, NULL, 26000, 'Larghezza specchi chiusi: 2.60 m. Due cassoni intercambiabili (con gru / senza gru)', 'DISPONIBILE', NOW(), NOW()),
  ('veh_volvo', 'VOLVO FM500', 'Volvo', 'FM500', 'GM767SR', 'MOTRICE_CON_GRU', 4.02, 9.50, 2.80, 1.45, 5.60, 2.46, 8.10, 2.50, 2.55, 10500, 21500, true, 'Palfinger PK58.002 TEC7', 24.0, 'lato guida', NULL, 10000, NULL, 'Con Fly Jib PJ150 + JV1 DPS-C. Portata senza Jib: 10.500 kg, con Jib: 9.000 kg (tara 23.000 kg). Telaio YW2XT40F1PB404883', 'DISPONIBILE', NOW(), NOW()),
  ('veh_bremach', 'BREMACH', 'Bremach', 'Bremach', 'CS116FY', 'MOTOCARRO', 2.24, 4.56, 1.75, 0.92, 2.37, 1.61, 5.93, 1.37, 3.08, 2600, 2400, false, NULL, NULL, NULL, NULL, NULL, NULL, 'Pneumatici: 195/75 R16 C', 'DISPONIBILE', NOW(), NOW()),
  ('veh_rim_actros', 'RIMORCHIO ACTROS', 'N/A', 'Rimorchio Actros', 'AC91829', 'RIMORCHIO', NULL, 8.10, 2.55, 1.30, 8.00, 2.47, 8.00, 0, 2.70, 15000, 6400, false, NULL, NULL, NULL, NULL, NULL, NULL, 'Agganciabile a Mercedes Actros. Nessuna sporgenza posteriore consentita.', 'DISPONIBILE', NOW(), NOW()),
  ('veh_rim_nano', 'RIMORCHIO NANO', 'N/A', 'Rimorchio Nano', 'XA402WE', 'RIMORCHIO', 1.70, NULL, 2.55, 1.00, 7.50, 2.47, 7.50, 0, 3.00, 16000, 4400, false, NULL, NULL, NULL, NULL, NULL, NULL, 'Larghezza max trasportabile: 2.50 m. Nessuna sporgenza posteriore consentita.', 'DISPONIBILE', NOW(), NOW())
ON CONFLICT ("licensePlate") DO NOTHING;

INSERT INTO "VehicleConfiguration" ("id", "vehicleId", "name", "maxExternalHeight", "maxExternalLength", "internalBedLength", "internalBedWidth", "payloadCapacity", "tare", "hasCrane", "isDefault", "createdAt", "updatedAt") VALUES
  ('cfg_iveco_gru', 'veh_iveco', 'Con Gru', 3.75, 8.60, 5.20, 2.46, 10200, 15800, true, true, NOW(), NOW()),
  ('cfg_iveco_nogru', 'veh_iveco', 'Senza Gru', 3.10, 8.45, 6.15, 2.46, 14000, 12200, false, false, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CraneCapacityCurve" ("id", "vehicleId", "configName", "stabilizerConfig", "createdAt") VALUES
  ('crv_atego_std', 'veh_atego', 'standard', NULL, NOW()),
  ('crv_atego_n', 'veh_atego', 'con_prolunga_N', NULL, NOW()),
  ('crv_atego_p', 'veh_atego', 'con_prolunga_P', NULL, NOW()),
  ('crv_iveco_std', 'veh_iveco', 'standard', NULL, NOW()),
  ('crv_iveco_ext', 'veh_iveco', 'con_prolunga', NULL, NOW()),
  ('crv_volvo_std', 'veh_volvo', 'standard', 'C', NOW()),
  ('crv_volvo_jib', 'veh_volvo', 'fly_jib', 'C', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CraneCapacityPoint" ("id", "curveId", "radiusMeters", "capacityKg") VALUES
  ('pt_at_s1', 'crv_atego_std', 2.00, 4260),
  ('pt_at_s2', 'crv_atego_std', 2.50, 3415),
  ('pt_at_s3', 'crv_atego_std', 3.35, 2595),
  ('pt_at_s4', 'crv_atego_std', 4.50, 1920),
  ('pt_at_s5', 'crv_atego_std', 6.25, 1370),
  ('pt_at_s6', 'crv_atego_std', 8.25, 960),
  ('pt_at_n1', 'crv_atego_n', 2.00, 4260),
  ('pt_at_n2', 'crv_atego_n', 2.50, 3415),
  ('pt_at_n3', 'crv_atego_n', 3.35, 2595),
  ('pt_at_n4', 'crv_atego_n', 4.50, 1920),
  ('pt_at_n5', 'crv_atego_n', 6.25, 1370),
  ('pt_at_n6', 'crv_atego_n', 8.25, 960),
  ('pt_at_n7', 'crv_atego_n', 10.30, 580),
  ('pt_at_p1', 'crv_atego_p', 2.00, 4260),
  ('pt_at_p2', 'crv_atego_p', 2.50, 3415),
  ('pt_at_p3', 'crv_atego_p', 3.35, 2595),
  ('pt_at_p4', 'crv_atego_p', 4.50, 1920),
  ('pt_at_p5', 'crv_atego_p', 6.25, 1370),
  ('pt_at_p6', 'crv_atego_p', 8.25, 960),
  ('pt_at_p7', 'crv_atego_p', 10.30, 580),
  ('pt_at_p8', 'crv_atego_p', 12.35, 400),
  ('pt_iv_s1', 'crv_iveco_std', 5.0, 3800),
  ('pt_iv_s2', 'crv_iveco_std', 9.0, 1800),
  ('pt_iv_s3', 'crv_iveco_std', 14.0, 960),
  ('pt_iv_e1', 'crv_iveco_ext', 5.0, 3800),
  ('pt_iv_e2', 'crv_iveco_ext', 9.0, 1800),
  ('pt_iv_e3', 'crv_iveco_ext', 14.0, 960),
  ('pt_iv_e4', 'crv_iveco_ext', 16.0, 780),
  ('pt_vo_s1', 'crv_volvo_std', 2.0, 12200),
  ('pt_vo_s2', 'crv_volvo_std', 4.0, 8600),
  ('pt_vo_s3', 'crv_volvo_std', 6.0, 6500),
  ('pt_vo_s4', 'crv_volvo_std', 8.4, 5200),
  ('pt_vo_s5', 'crv_volvo_std', 12.0, 4300),
  ('pt_vo_j1', 'crv_volvo_jib', 13.0, 8000),
  ('pt_vo_j2', 'crv_volvo_jib', 19.5, 2400),
  ('pt_vo_j3', 'crv_volvo_jib', 25.0, 1060),
  ('pt_vo_j4', 'crv_volvo_jib', 31.0, 500)
ON CONFLICT ("id") DO NOTHING;
