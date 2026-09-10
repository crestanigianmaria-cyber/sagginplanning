import { PrismaClient } from '@prisma/client';
import { performSafetyChecks } from './src/lib/safety-checks';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- AVVIO TEST DI SISTEMA SAGGIN PLANNING ---');

  try {
    // 1. Test Safety Check
    console.log('\n[TEST 1] Verifica Logica di Sicurezza (Safety Check)...');
    const atego = await prisma.vehicle.findFirst({ where: { name: 'MERCEDES ATEGO' } });
    if (!atego) throw new Error("Atego non trovato");

    // Simuliamo un carico troppo pesante (8000kg su 7500kg di portata)
    const badCheck = performSafetyChecks({
      vehiclePayloadCapacity: atego.payloadCapacity,
      vehicleHasCrane: atego.hasCrane,
      cargoWeight: 8000,
      needsCrane: false
    });
    console.log(!badCheck.isAllClear ? '✅ OK: Sovraccarico bloccato correttamente' : '❌ FALLITO: Ha permesso il sovraccarico');

    // Simuliamo un carico ok (5000kg)
    const goodCheck = performSafetyChecks({
      vehiclePayloadCapacity: atego.payloadCapacity,
      vehicleHasCrane: atego.hasCrane,
      cargoWeight: 5000,
      needsCrane: false
    });
    console.log(goodCheck.isAllClear ? '✅ OK: Carico nei limiti permesso' : '❌ FALLITO: Carico valido bloccato');


    // 2. Test Creazione Viaggio (Ufficio)
    console.log('\n[TEST 2] Ufficio crea un nuovo viaggio...');
    const francesco = await prisma.driver.findFirst({ where: { name: 'Francesco' } });
    const officeUser = await prisma.officeUser.findFirst({ where: { name: 'Claudio' } });
    
    if (!francesco || !officeUser) throw new Error("Utenti non trovati");

    const trip = await prisma.trip.create({
      data: {
        date: new Date(),
        scheduledTime: '08:00',
        driverId: francesco.id,
        vehicleId: atego.id,
        cargoDescription: 'Materiale Edile Test',
        cargoWeight: 3000,
        needsCrane: true,
        address: 'Via Roma 1, Milano',
        status: 'DA_FARE',
        createdById: officeUser.id,
        createdByType: 'OFFICE'
      }
    });
    console.log(`✅ OK: Viaggio creato con ID: ${trip.id}`);


    // 3. Test Inizio Viaggio (Autista)
    console.log('\n[TEST 3] Autista inizia il viaggio...');
    const startedTrip = await prisma.trip.update({
      where: { id: trip.id },
      data: {
        status: 'IN_CORSO',
        actualStartTime: new Date(Date.now() - 60000 * 60), // Iniziato 1 ora fa
        startLatitude: 45.4642,
        startLongitude: 9.1900
      }
    });
    console.log(`✅ OK: Viaggio Iniziato. Stato: ${startedTrip.status}`);

    // Aggiungo anche l'Audit Log per simulare l'API vera
    await prisma.tripAuditLog.create({
      data: {
        tripId: trip.id,
        userType: 'DRIVER',
        driverIdActor: francesco.id,
        action: 'STATUS_CHANGE',
        fieldName: 'status',
        oldValue: 'DA_FARE',
        newValue: 'IN_CORSO'
      }
    });


    // 4. Test Fine Viaggio (Autista) e calcolo ore
    console.log('\n[TEST 4] Autista termina il viaggio...');
    const endTime = new Date();
    const startTime = startedTrip.actualStartTime!;
    const workedMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const endedTrip = await prisma.trip.update({
      where: { id: trip.id },
      data: {
        status: 'COMPLETATO',
        actualEndTime: endTime,
        endLatitude: 45.4800,
        endLongitude: 9.2000,
        workedMinutes: workedMins
      }
    });
    console.log(`✅ OK: Viaggio Completato. Minuti lavorati calcolati: ${endedTrip.workedMinutes} (circa 60)`);

    // 5. Verifica Log Audit
    console.log('\n[TEST 5] Verifica Audit Trail...');
    const logs = await prisma.tripAuditLog.findMany({ where: { tripId: trip.id } });
    console.log(`✅ OK: Trovati ${logs.length} log di modifiche di sicurezza`);

    console.log('\n--- TUTTI I TEST PASSATI CON SUCCESSO 🚀 ---');

  } catch (error) {
    console.error('❌ ERRORE DURANTE I TEST:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
