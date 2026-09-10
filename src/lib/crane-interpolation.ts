export interface CraneCapacityDataPoint {
  radiusMeters: number;
  capacityKg: number;
}

export interface InterpolationResult {
  capacityKg: number;
  isExact: boolean; // true if the radius matched an exact data point
  isExtrapolated: boolean; // true if radius is beyond the curve range
  nearestLowerPoint?: CraneCapacityDataPoint;
  nearestUpperPoint?: CraneCapacityDataPoint;
}

/**
 * Interpolate the crane capacity at a given radius from a set of known data points.
 * Points must be sorted by radius ascending.
 *
 * - If radius matches an exact point, return that capacity
 * - If radius is between two points, linearly interpolate
 * - If radius is below the first point, return the first point's capacity (conservative)
 * - If radius is beyond the last point, return 0 and mark as extrapolated (unsafe)
 */
export function interpolateCraneCapacity(
  points: CraneCapacityDataPoint[],
  targetRadius: number
): InterpolationResult {
  if (!points || points.length === 0 || Number.isNaN(targetRadius)) {
    return {
      capacityKg: 0,
      isExact: false,
      isExtrapolated: true,
    };
  }

  // Sort points ascending by radius to ensure correct ordering
  const sorted = [...points].sort((a, b) => a.radiusMeters - b.radiusMeters);

  // Check for an exact match within floating-point tolerance
  const exactPoint = sorted.find(
    (p) => Math.abs(p.radiusMeters - targetRadius) < 1e-6
  );
  if (exactPoint) {
    return {
      capacityKg: exactPoint.capacityKg,
      isExact: true,
      isExtrapolated: false,
      nearestLowerPoint: exactPoint,
      nearestUpperPoint: exactPoint,
    };
  }

  const firstPoint = sorted[0];
  const lastPoint = sorted[sorted.length - 1];

  // If radius is below the first point, return the first point's capacity (conservative)
  if (targetRadius < firstPoint.radiusMeters) {
    return {
      capacityKg: firstPoint.capacityKg,
      isExact: false,
      isExtrapolated: false,
      nearestUpperPoint: firstPoint,
    };
  }

  // If radius is beyond the last point, return 0 and mark as extrapolated (unsafe)
  if (targetRadius > lastPoint.radiusMeters) {
    return {
      capacityKg: 0,
      isExact: false,
      isExtrapolated: true,
      nearestLowerPoint: lastPoint,
    };
  }

  // Radius is between two points: linearly interpolate
  for (let i = 0; i < sorted.length - 1; i++) {
    const lower = sorted[i];
    const upper = sorted[i + 1];

    if (targetRadius >= lower.radiusMeters && targetRadius <= upper.radiusMeters) {
      const radiusDelta = upper.radiusMeters - lower.radiusMeters;
      let capacity: number;

      if (radiusDelta === 0) {
        capacity = lower.capacityKg;
      } else {
        const ratio = (targetRadius - lower.radiusMeters) / radiusDelta;
        capacity = lower.capacityKg + ratio * (upper.capacityKg - lower.capacityKg);
      }

      // Round to 2 decimal places to avoid floating-point inaccuracies
      const roundedCapacity = Math.round((capacity + Number.EPSILON) * 100) / 100;

      return {
        capacityKg: roundedCapacity,
        isExact: false,
        isExtrapolated: false,
        nearestLowerPoint: lower,
        nearestUpperPoint: upper,
      };
    }
  }

  // Fallback (safety guard, should not be reached given previous checks)
  return {
    capacityKg: 0,
    isExact: false,
    isExtrapolated: true,
  };
}
