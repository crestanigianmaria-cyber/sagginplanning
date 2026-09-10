import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash passwords and PINs
  const userPassword = await bcrypt.hash('saggin2026', 10);
  const adminPassword = await bcrypt.hash('saggin2025', 10);
  const pin1111 = await bcrypt.hash('1111', 10);

  // Clean up existing data (order matters due to foreign keys)
  await prisma.gpsTrackPoint.deleteMany();
  await prisma.tripAuditLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.craneCapacityPoint.deleteMany();
  await prisma.craneCapacityCurve.deleteMany();
  await prisma.vehicleConfiguration.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.officeUser.deleteMany();

  // 1. Utenti Ufficio
  console.log('Seeding Utenti Ufficio...');
  await prisma.officeUser.createMany({
    data: [
      { name: 'Sabrina', email: 'sabrina@saggin.it', passwordHash: userPassword, role: 'STANDARD' },
      { name: 'Barbara', email: 'barbara@saggin.it', passwordHash: userPassword, role: 'STANDARD' },
      { name: 'Raffaella', email: 'raffaella@saggin.it', passwordHash: userPassword, role: 'STANDARD' },
      { name: 'Mariangela', email: 'mariangela@saggin.it', passwordHash: userPassword, role: 'STANDARD' },
      { name: 'Claudio', email: 'claudio@saggin.it', passwordHash: userPassword, role: 'STANDARD' },
      { name: 'Luca', email: 'luca@saggin.it', passwordHash: userPassword, role: 'STANDARD' },
      { name: 'Maria Sofia', email: 'mariasofia@saggin.it', passwordHash: userPassword, role: 'STANDARD' },
      { name: 'Amministratore', email: 'admin@saggin.it', passwordHash: adminPassword, role: 'ADMIN' },
    ],
  });

  // 2. Autisti (tutti con PIN 1111 — Claudio e Luca hanno doppio ruolo ufficio+autista)
  console.log('Seeding Autisti...');
  await prisma.driver.createMany({
    data: [
      { name: 'Claudio', pin: pin1111, role: 'AUTISTA_UFFICIO' },
      { name: 'Luca', pin: pin1111, role: 'AUTISTA_UFFICIO' },
      { name: 'Marino', pin: pin1111, role: 'AUTISTA' },
      { name: 'Francesco', pin: pin1111, role: 'AUTISTA' },
    ],
  });

  // 3. Vehicles
  console.log('Seeding Vehicles...');

  // Vehicle 1: MERCEDES ATEGO
  const atego = await prisma.vehicle.create({
    data: {
      name: 'MERCEDES ATEGO',
      brand: 'Mercedes-Benz',
      model: 'Atego',
      licensePlate: 'DJ631BA',
      type: 'MOTRICE_CON_GRU',
      maxExternalHeight: 3.30,
      maxExternalLength: 7.30,
      maxExternalWidth: 2.52,
      bedHeightFromGround: 1.15,
      internalBedLength: 4.40,
      internalBedWidth: 2.42,
      maxTransportableLength: 9.50,
      maxRearOverhang: 2.20,
      maxTransportableHeight: 2.85,
      payloadCapacity: 7500,
      tare: 7500,
      hasCrane: true,
      craneModel: 'Fassi F95AC.23',
      craneMaxReach: 7.40,
      craneSide: 'lato guida',
      tailgateLiftCapacity: 2000,
      craneCapacityCurves: {
        create: [
          {
            configName: 'standard',
            points: {
              create: [
                { radiusMeters: 2.00, capacityKg: 4260 },
                { radiusMeters: 2.50, capacityKg: 3415 },
                { radiusMeters: 3.35, capacityKg: 2595 },
                { radiusMeters: 4.50, capacityKg: 1920 },
                { radiusMeters: 6.25, capacityKg: 1370 },
                { radiusMeters: 8.25, capacityKg: 960 },
              ],
            },
          },
          {
            configName: 'con_prolunga_N',
            points: {
              create: [
                { radiusMeters: 2.00, capacityKg: 4260 },
                { radiusMeters: 2.50, capacityKg: 3415 },
                { radiusMeters: 3.35, capacityKg: 2595 },
                { radiusMeters: 4.50, capacityKg: 1920 },
                { radiusMeters: 6.25, capacityKg: 1370 },
                { radiusMeters: 8.25, capacityKg: 960 },
                { radiusMeters: 10.30, capacityKg: 580 },
              ],
            },
          },
          {
            configName: 'con_prolunga_P',
            points: {
              create: [
                { radiusMeters: 2.00, capacityKg: 4260 },
                { radiusMeters: 2.50, capacityKg: 3415 },
                { radiusMeters: 3.35, capacityKg: 2595 },
                { radiusMeters: 4.50, capacityKg: 1920 },
                { radiusMeters: 6.25, capacityKg: 1370 },
                { radiusMeters: 8.25, capacityKg: 960 },
                { radiusMeters: 10.30, capacityKg: 580 },
                { radiusMeters: 12.35, capacityKg: 400 },
              ],
            },
          },
        ],
      },
    },
  });

  // Vehicle 2: MERCEDES ACTROS
  const actros = await prisma.vehicle.create({
    data: {
      name: 'MERCEDES ACTROS',
      brand: 'Mercedes-Benz',
      model: 'Actros',
      licensePlate: 'CK527WX',
      type: 'MOTRICE_SENZA_GRU',
      maxExternalHeight: 3.56,
      maxExternalLength: 9.00,
      maxExternalWidth: 2.55,
      bedHeightFromGround: 1.26,
      internalBedLength: 6.57,
      internalBedWidth: 2.48,
      maxTransportableLength: 11.70,
      maxRearOverhang: 2.70,
      maxTransportableHeight: 2.74,
      payloadCapacity: 15000,
      tare: 10300,
      hasCrane: false,
      towableLoad: 15000,
      notes: 'Può trainare il Rimorchio Actros',
    },
  });

  // Vehicle 3: IVECO X-WAY
  const ivecoXWay = await prisma.vehicle.create({
    data: {
      name: 'IVECO X-WAY',
      brand: 'Iveco',
      model: 'X-Way',
      licensePlate: 'GD352ND',
      type: 'MOTRICE_CON_GRU',
      maxExternalHeight: 3.75,
      maxExternalLength: 8.60,
      maxExternalWidth: 3.00,
      bedHeightFromGround: null,
      internalBedLength: 5.20,
      internalBedWidth: 2.46,
      maxTransportableLength: 11.00,
      maxRearOverhang: 2.60,
      maxTransportableHeight: 2.55,
      payloadCapacity: 10200,
      tare: 15800,
      hasCrane: true,
      maxCraneAndTrailerLoad: 26000,
      notes: 'Larghezza specchi chiusi: 2.60 m. Due cassoni intercambiabili (con gru / senza gru)',
      configurations: {
        create: [
          {
            name: 'Con Gru',
            maxExternalHeight: 3.75,
            maxExternalLength: 8.60,
            internalBedLength: 5.20,
            internalBedWidth: 2.46,
            payloadCapacity: 10200,
            tare: 15800,
            hasCrane: true,
            isDefault: true,
          },
          {
            name: 'Senza Gru',
            maxExternalHeight: 3.10,
            maxExternalLength: 8.45,
            internalBedLength: 6.15,
            internalBedWidth: 2.46,
            payloadCapacity: 14000,
            tare: 12200,
            hasCrane: false,
            isDefault: false,
          },
        ],
      },
      craneCapacityCurves: {
        create: [
          {
            configName: 'standard',
            points: {
              create: [
                { radiusMeters: 5.0, capacityKg: 3800 },
                { radiusMeters: 9.0, capacityKg: 1800 },
                { radiusMeters: 14.0, capacityKg: 960 },
              ],
            },
          },
          {
            configName: 'con_prolunga',
            points: {
              create: [
                { radiusMeters: 5.0, capacityKg: 3800 },
                { radiusMeters: 9.0, capacityKg: 1800 },
                { radiusMeters: 14.0, capacityKg: 960 },
                { radiusMeters: 16.0, capacityKg: 780 },
              ],
            },
          },
        ],
      },
    },
  });

  // Vehicle 4: VOLVO FM500
  const volvo = await prisma.vehicle.create({
    data: {
      name: 'VOLVO FM500',
      brand: 'Volvo',
      model: 'FM500',
      licensePlate: 'GM767SR',
      type: 'MOTRICE_CON_GRU',
      maxExternalHeight: 4.02,
      maxExternalLength: 9.50,
      maxExternalWidth: 2.80,
      bedHeightFromGround: 1.45,
      internalBedLength: 5.60,
      internalBedWidth: 2.46,
      maxTransportableLength: 8.10,
      maxRearOverhang: 2.50,
      maxTransportableHeight: 2.55,
      payloadCapacity: 10500,
      tare: 21500,
      hasCrane: true,
      craneModel: 'Palfinger PK58.002 TEC7',
      craneMaxReach: 24.0,
      craneSide: 'lato guida',
      towableLoad: 10000,
      notes: 'Con Fly Jib PJ150 + JV1 DPS-C. Portata senza Jib: 10.500 kg, con Jib: 9.000 kg (tara 23.000 kg). Telaio YW2XT40F1PB404883',
      craneCapacityCurves: {
        create: [
          {
            configName: 'standard',
            stabilizerConfig: 'C',
            points: {
              create: [
                { radiusMeters: 2.0, capacityKg: 12200 },
                { radiusMeters: 4.0, capacityKg: 8600 },
                { radiusMeters: 6.0, capacityKg: 6500 },
                { radiusMeters: 8.4, capacityKg: 5200 },
                { radiusMeters: 12.0, capacityKg: 4300 },
              ],
            },
          },
          {
            configName: 'fly_jib',
            stabilizerConfig: 'C',
            points: {
              create: [
                { radiusMeters: 13.0, capacityKg: 8000 },
                { radiusMeters: 19.5, capacityKg: 2400 },
                { radiusMeters: 25.0, capacityKg: 1060 },
                { radiusMeters: 31.0, capacityKg: 500 },
              ],
            },
          },
        ],
      },
    },
  });

  // Vehicle 5: BREMACH
  const bremach = await prisma.vehicle.create({
    data: {
      name: 'BREMACH',
      brand: 'Bremach',
      model: 'Bremach',
      licensePlate: 'CS116FY',
      type: 'MOTOCARRO',
      maxExternalHeight: 2.24,
      maxExternalLength: 4.56,
      maxExternalWidth: 1.75,
      bedHeightFromGround: 0.92,
      internalBedLength: 2.37,
      internalBedWidth: 1.61,
      maxTransportableLength: 5.93,
      maxRearOverhang: 1.37,
      maxTransportableHeight: 3.08,
      payloadCapacity: 2600,
      tare: 2400,
      hasCrane: false,
      notes: 'Pneumatici: 195/75 R16 C',
    },
  });

  // Vehicle 6: RIMORCHIO ACTROS
  const rimorchioActros = await prisma.vehicle.create({
    data: {
      name: 'RIMORCHIO ACTROS',
      brand: 'N/A',
      model: 'Rimorchio Actros',
      licensePlate: 'AC91829',
      type: 'RIMORCHIO',
      maxExternalHeight: null,
      maxExternalLength: 8.10,
      maxExternalWidth: 2.55,
      bedHeightFromGround: 1.30,
      internalBedLength: 8.00,
      internalBedWidth: 2.47,
      maxTransportableLength: 8.00,
      maxRearOverhang: 0,
      maxTransportableHeight: 2.70,
      payloadCapacity: 15000,
      tare: 6400,
      hasCrane: false,
      notes: 'Agganciabile a Mercedes Actros. Nessuna sporgenza posteriore consentita.',
    },
  });

  // Vehicle 7: RIMORCHIO NANO
  const rimorchioNano = await prisma.vehicle.create({
    data: {
      name: 'RIMORCHIO NANO',
      brand: 'N/A',
      model: 'Rimorchio Nano',
      licensePlate: 'XA402WE',
      type: 'RIMORCHIO',
      maxExternalHeight: 1.70,
      maxExternalLength: null,
      maxExternalWidth: 2.55,
      bedHeightFromGround: 1.00,
      internalBedLength: 7.50,
      internalBedWidth: 2.47,
      maxTransportableLength: 7.50,
      maxRearOverhang: 0,
      maxTransportableHeight: 3.00,
      payloadCapacity: 16000,
      tare: 4400,
      hasCrane: false,
      notes: 'Larghezza max trasportabile: 2.50 m. Nessuna sporgenza posteriore consentita.',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
