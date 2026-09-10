import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { performSafetyChecks } from '@/lib/safety-checks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, vehicleConfigId, trailerId, cargoWeight, cargoLength, cargoWidth, cargoHeight, needsCrane, craneWorkRadius } = body;

    // Load vehicle with configurations and crane curves
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        configurations: true,
        craneCapacityCurves: {
          include: { points: { orderBy: { radiusMeters: 'asc' } } },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ success: false, error: 'Mezzo non trovato' }, { status: 404 });
    }

    // Determine which config to use (if any)
    let effectivePayload = vehicle.payloadCapacity;
    let effectiveBedLength = vehicle.internalBedLength;
    let effectiveBedWidth = vehicle.internalBedWidth;
    let effectiveMaxTransportableLength = vehicle.maxTransportableLength;
    let effectiveMaxTransportableHeight = vehicle.maxTransportableHeight;
    let effectiveMaxRearOverhang = vehicle.maxRearOverhang;
    let effectiveHasCrane = vehicle.hasCrane;

    if (vehicleConfigId) {
      const config = vehicle.configurations.find(c => c.id === vehicleConfigId);
      if (config) {
        effectivePayload = config.payloadCapacity;
        effectiveBedLength = config.internalBedLength;
        effectiveBedWidth = config.internalBedWidth;
        effectiveMaxTransportableLength = config.maxTransportableLength;
        effectiveMaxTransportableHeight = config.maxTransportableHeight;
        effectiveHasCrane = config.hasCrane;
      }
    }

    // Load trailer if specified
    let trailerData = null;
    if (trailerId) {
      trailerData = await prisma.vehicle.findUnique({
        where: { id: trailerId },
      });
    }

    // Get crane capacity points (use 'standard' config by default)
    const standardCurve = vehicle.craneCapacityCurves.find(c => c.configName === 'standard');
    const cranePoints = standardCurve?.points.map(p => ({
      radiusMeters: p.radiusMeters,
      capacityKg: p.capacityKg,
    }));

    // Build safety check input
    const input = {
      vehiclePayloadCapacity: effectivePayload,
      vehicleInternalBedLength: effectiveBedLength,
      vehicleInternalBedWidth: effectiveBedWidth,
      vehicleMaxTransportableLength: effectiveMaxTransportableLength,
      vehicleMaxTransportableHeight: effectiveMaxTransportableHeight,
      vehicleMaxRearOverhang: effectiveMaxRearOverhang,
      vehicleHasCrane: effectiveHasCrane,
      trailerPayloadCapacity: trailerData?.payloadCapacity ?? null,
      trailerInternalBedLength: trailerData?.internalBedLength ?? null,
      trailerInternalBedWidth: trailerData?.internalBedWidth ?? null,
      trailerMaxTransportableHeight: trailerData?.maxTransportableHeight ?? null,
      craneCapacityPoints: cranePoints,
      cargoWeight: cargoWeight ?? null,
      cargoLength: cargoLength ?? null,
      cargoWidth: cargoWidth ?? null,
      cargoHeight: cargoHeight ?? null,
      needsCrane: needsCrane ?? false,
      craneWorkRadius: craneWorkRadius ?? null,
    };

    const result = performSafetyChecks(input);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Safety check error:', error);
    return NextResponse.json({ success: false, error: 'Errore nel controllo sicurezza' }, { status: 500 });
  }
}
