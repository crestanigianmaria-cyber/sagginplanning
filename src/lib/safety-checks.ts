import {
  CraneCapacityDataPoint,
  interpolateCraneCapacity,
} from './crane-interpolation';

export type SafetyWarningLevel = 'ok' | 'caution' | 'danger';

export interface SafetyWarning {
  level: SafetyWarningLevel;
  type: 'weight' | 'dimensions' | 'crane';
  message: string; // Italian, user-facing
  detail: string; // Italian, specific values
  maxAllowed: number;
  declared: number;
  unit: string;
}

export interface SafetyCheckInput {
  // Vehicle data
  vehiclePayloadCapacity: number; // kg
  vehicleInternalBedLength?: number | null; // meters
  vehicleInternalBedWidth?: number | null; // meters
  vehicleMaxTransportableLength?: number | null; // meters
  vehicleMaxTransportableHeight?: number | null; // meters
  vehicleMaxRearOverhang?: number | null; // meters
  vehicleHasCrane: boolean;

  // Trailer data (optional)
  trailerPayloadCapacity?: number | null;
  trailerInternalBedLength?: number | null;
  trailerInternalBedWidth?: number | null;
  trailerMaxTransportableHeight?: number | null;

  // Crane capacity curve points (only if vehicle has crane)
  craneCapacityPoints?: CraneCapacityDataPoint[];

  // Cargo data
  cargoWeight?: number | null; // kg
  cargoLength?: number | null; // meters
  cargoWidth?: number | null; // meters
  cargoHeight?: number | null; // meters

  // Crane usage
  needsCrane: boolean;
  craneWorkRadius?: number | null; // meters
}

export interface SafetyCheckResult {
  overallLevel: SafetyWarningLevel; // worst level among all warnings
  warnings: SafetyWarning[];
  isAllClear: boolean;
}

/**
 * Format a number using Italian locale conventions:
 * - Period (.) as thousands separator
 * - Comma (,) as decimal separator
 */
export function formatItalianNumber(
  value: number,
  options?: { minDecimals?: number; maxDecimals?: number }
): string {
  const minDecimals = options?.minDecimals ?? 0;
  const maxDecimals = options?.maxDecimals ?? 2;
  return new Intl.NumberFormat('it-IT', {
    useGrouping: true,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/**
 * Perform all safety checks for a trip assignment.
 * Returns warnings for:
 * 1. Weight vs payload capacity (vehicle + optional trailer)
 * 2. Cargo dimensions vs vehicle bed dimensions
 * 3. Crane capacity vs cargo weight at specified working radius
 *
 * Levels:
 * - 'ok': all good
 * - 'caution': value is between 80-100% of limit
 * - 'danger': value exceeds limit
 */
export function performSafetyChecks(input: SafetyCheckInput): SafetyCheckResult {
  const warnings: SafetyWarning[] = [];

  // ==========================================
  // 1. WEIGHT CHECK
  // ==========================================
  const totalPayloadCapacity =
    (input.vehiclePayloadCapacity || 0) + (input.trailerPayloadCapacity || 0);

  if (input.cargoWeight != null && input.cargoWeight > 0) {
    if (totalPayloadCapacity <= 0) {
      warnings.push({
        level: 'danger',
        type: 'weight',
        message: 'Peso del carico oltre la portata utile del mezzo',
        detail: `Carico dichiarato: ${formatItalianNumber(input.cargoWeight)} kg — Portata utile: 0 kg`,
        maxAllowed: 0,
        declared: input.cargoWeight,
        unit: 'kg',
      });
    } else if (input.cargoWeight > totalPayloadCapacity) {
      warnings.push({
        level: 'danger',
        type: 'weight',
        message: 'Peso del carico oltre la portata utile del mezzo',
        detail: `Carico dichiarato: ${formatItalianNumber(input.cargoWeight)} kg — Portata utile massima: ${formatItalianNumber(totalPayloadCapacity)} kg (superamento di ${formatItalianNumber(input.cargoWeight - totalPayloadCapacity)} kg)`,
        maxAllowed: totalPayloadCapacity,
        declared: input.cargoWeight,
        unit: 'kg',
      });
    } else if (input.cargoWeight > 0.8 * totalPayloadCapacity) {
      const percentage = Math.round((input.cargoWeight / totalPayloadCapacity) * 100);
      warnings.push({
        level: 'caution',
        type: 'weight',
        message: 'Carico vicino al limite della portata utile (>80%)',
        detail: `Carico dichiarato: ${formatItalianNumber(input.cargoWeight)} kg — Portata utile massima: ${formatItalianNumber(totalPayloadCapacity)} kg (${percentage}% della portata)`,
        maxAllowed: totalPayloadCapacity,
        declared: input.cargoWeight,
        unit: 'kg',
      });
    }
  }

  // ==========================================
  // 2. DIMENSION CHECKS
  // ==========================================

  // --- Length Check ---
  if (input.cargoLength != null && input.cargoLength > 0) {
    const vehicleBedLength = input.vehicleInternalBedLength ?? 0;
    const trailerBedLength = input.trailerInternalBedLength ?? 0;

    // Check if cargo fits inside either the vehicle bed or trailer bed
    const fitsInVehicleBed = vehicleBedLength > 0 && input.cargoLength <= vehicleBedLength;
    const fitsInTrailerBed = trailerBedLength > 0 && input.cargoLength <= trailerBedLength;

    if (!fitsInVehicleBed && !fitsInTrailerBed) {
      // Bed length to use as reference in the detail message
      const referenceBedLength =
        vehicleBedLength > 0 ? vehicleBedLength : trailerBedLength;

      const maxTransportableLength =
        input.vehicleMaxTransportableLength ??
        (vehicleBedLength > 0 && input.vehicleMaxRearOverhang != null
          ? vehicleBedLength + input.vehicleMaxRearOverhang
          : referenceBedLength);

      if (maxTransportableLength > 0 && input.cargoLength > maxTransportableLength) {
        warnings.push({
          level: 'danger',
          type: 'dimensions',
          message: 'Lunghezza del carico oltre la lunghezza massima trasportabile',
          detail: `Lunghezza carico: ${formatItalianNumber(input.cargoLength, { minDecimals: 2 })} m — Lunghezza massima consentita: ${formatItalianNumber(maxTransportableLength, { minDecimals: 2 })} m (superamento di ${formatItalianNumber(input.cargoLength - maxTransportableLength, { minDecimals: 2 })} m)`,
          maxAllowed: maxTransportableLength,
          declared: input.cargoLength,
          unit: 'm',
        });
      } else if (maxTransportableLength > 0) {
        // Fits within max transportable length with overhang
        warnings.push({
          level: 'caution',
          type: 'dimensions',
          message: 'Lunghezza carico con sporgenza posteriore',
          detail: `Lunghezza carico: ${formatItalianNumber(input.cargoLength, { minDecimals: 2 })} m — Cassone interno: ${formatItalianNumber(referenceBedLength, { minDecimals: 2 })} m — Con sporgenza (max consentita: ${formatItalianNumber(maxTransportableLength, { minDecimals: 2 })} m)`,
          maxAllowed: maxTransportableLength,
          declared: input.cargoLength,
          unit: 'm',
        });
      }
    }
  }

  // --- Width Check ---
  if (input.cargoWidth != null && input.cargoWidth > 0) {
    const maxBedWidth = Math.max(
      input.vehicleInternalBedWidth ?? 0,
      input.trailerInternalBedWidth ?? 0
    );

    if (maxBedWidth > 0 && input.cargoWidth > maxBedWidth) {
      warnings.push({
        level: 'danger',
        type: 'dimensions',
        message: 'Larghezza del carico oltre la larghezza utile del cassone',
        detail: `Larghezza carico: ${formatItalianNumber(input.cargoWidth, { minDecimals: 2 })} m — Larghezza cassone: ${formatItalianNumber(maxBedWidth, { minDecimals: 2 })} m (superamento di ${formatItalianNumber(input.cargoWidth - maxBedWidth, { minDecimals: 2 })} m)`,
        maxAllowed: maxBedWidth,
        declared: input.cargoWidth,
        unit: 'm',
      });
    }
  }

  // --- Height Check ---
  if (input.cargoHeight != null && input.cargoHeight > 0) {
    const maxTransportableHeight = Math.max(
      input.vehicleMaxTransportableHeight ?? 0,
      input.trailerMaxTransportableHeight ?? 0
    );

    if (maxTransportableHeight > 0) {
      if (input.cargoHeight > maxTransportableHeight) {
        warnings.push({
          level: 'danger',
          type: 'dimensions',
          message: "Altezza del carico oltre l'altezza massima trasportabile",
          detail: `Altezza carico: ${formatItalianNumber(input.cargoHeight, { minDecimals: 2 })} m — Altezza massima consentita: ${formatItalianNumber(maxTransportableHeight, { minDecimals: 2 })} m (superamento di ${formatItalianNumber(input.cargoHeight - maxTransportableHeight, { minDecimals: 2 })} m)`,
          maxAllowed: maxTransportableHeight,
          declared: input.cargoHeight,
          unit: 'm',
        });
      } else if (input.cargoHeight > 0.8 * maxTransportableHeight) {
        const percentage = Math.round((input.cargoHeight / maxTransportableHeight) * 100);
        warnings.push({
          level: 'caution',
          type: 'dimensions',
          message: 'Dimensioni compatibili con margine ridotto (>80%)',
          detail: `Altezza carico: ${formatItalianNumber(input.cargoHeight, { minDecimals: 2 })} m — Altezza massima consentita: ${formatItalianNumber(maxTransportableHeight, { minDecimals: 2 })} m (${percentage}% del limite)`,
          maxAllowed: maxTransportableHeight,
          declared: input.cargoHeight,
          unit: 'm',
        });
      }
    }
  }

  // ==========================================
  // 3. CRANE CHECK
  // ==========================================
  if (input.needsCrane) {
    if (!input.vehicleHasCrane) {
      warnings.push({
        level: 'danger',
        type: 'crane',
        message: 'Mezzo non dotato di gru',
        detail: "Il servizio richiede l'uso della gru, ma il mezzo selezionato non ne è dotato.",
        maxAllowed: 0,
        declared: input.cargoWeight ?? 0,
        unit: 'kg',
      });
    } else if (input.craneWorkRadius != null && input.craneWorkRadius > 0) {
      const points = input.craneCapacityPoints ?? [];
      const interp = interpolateCraneCapacity(points, input.craneWorkRadius);

      if (interp.isExtrapolated) {
        const maxRadius =
          points.length > 0 ? Math.max(...points.map((p) => p.radiusMeters)) : 0;

        warnings.push({
          level: 'danger',
          type: 'crane',
          message: 'Raggio di lavoro oltre lo sbraccio massimo della gru',
          detail:
            maxRadius > 0
              ? `Sbraccio richiesto: ${formatItalianNumber(input.craneWorkRadius, { minDecimals: 1 })} m — Sbraccio massimo consentito: ${formatItalianNumber(maxRadius, { minDecimals: 1 })} m (fuori diagramma di carico)`
              : `Diagramma di carico della gru non disponibile per verificare il raggio di lavoro di ${formatItalianNumber(input.craneWorkRadius, { minDecimals: 1 })} m.`,
          maxAllowed: maxRadius,
          declared: input.craneWorkRadius,
          unit: 'm',
        });
      } else if (input.cargoWeight != null && input.cargoWeight > 0) {
        const cargoWeight = input.cargoWeight;
        const capacityKg = interp.capacityKg;

        if (cargoWeight > capacityKg) {
          warnings.push({
            level: 'danger',
            type: 'crane',
            message: 'Peso del carico oltre la portata della gru allo sbraccio indicato',
            detail: `Portata gru a ${formatItalianNumber(input.craneWorkRadius, { minDecimals: 1 })} m: ${formatItalianNumber(capacityKg)} kg — Carico dichiarato: ${formatItalianNumber(cargoWeight)} kg`,
            maxAllowed: capacityKg,
            declared: cargoWeight,
            unit: 'kg',
          });
        } else if (cargoWeight > 0.8 * capacityKg) {
          const percentage = Math.round((cargoWeight / capacityKg) * 100);
          warnings.push({
            level: 'caution',
            type: 'crane',
            message: 'Carico vicino al limite di portata della gru (>80%)',
            detail: `Portata gru a ${formatItalianNumber(input.craneWorkRadius, { minDecimals: 1 })} m: ${formatItalianNumber(capacityKg)} kg — Carico dichiarato: ${formatItalianNumber(cargoWeight)} kg (${percentage}% della portata)`,
            maxAllowed: capacityKg,
            declared: cargoWeight,
            unit: 'kg',
          });
        }
      }
    }
  }

  // ==========================================
  // OVERALL RESULT
  // ==========================================
  let overallLevel: SafetyWarningLevel = 'ok';
  if (warnings.some((w) => w.level === 'danger')) {
    overallLevel = 'danger';
  } else if (warnings.some((w) => w.level === 'caution')) {
    overallLevel = 'caution';
  }

  return {
    overallLevel,
    warnings,
    isAllClear: overallLevel === 'ok',
  };
}
