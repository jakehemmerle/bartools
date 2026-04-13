export function toIso(value: Date | null | undefined): string | undefined {
  return value?.toISOString();
}

export function maybeModelOutput(record: {
  originalBottleName: string | null;
  originalCategory: string | null;
  originalUpc: string | null;
  originalVolumeMl: number | null;
  originalFillTenths: number | null;
}) {
  const hasValue =
    record.originalBottleName !== null ||
    record.originalCategory !== null ||
    record.originalUpc !== null ||
    record.originalVolumeMl !== null ||
    record.originalFillTenths !== null;

  if (!hasValue) {
    return undefined;
  }

  return {
    bottleName: record.originalBottleName ?? undefined,
    category: record.originalCategory ?? undefined,
    upc: record.originalUpc ?? undefined,
    volumeMl: record.originalVolumeMl ?? undefined,
    fillPercent:
      record.originalFillTenths === null ? undefined : record.originalFillTenths * 10,
  };
}

export function maybeCorrectedValues(record: {
  correctedBottleName: string | null;
  correctedCategory: string | null;
  correctedUpc: string | null;
  correctedVolumeMl: number | null;
  correctedFillTenths: number | null;
}) {
  const hasValue =
    record.correctedBottleName !== null ||
    record.correctedCategory !== null ||
    record.correctedUpc !== null ||
    record.correctedVolumeMl !== null ||
    record.correctedFillTenths !== null;

  if (!hasValue) {
    return undefined;
  }

  return {
    bottleName: record.correctedBottleName ?? undefined,
    category: record.correctedCategory ?? undefined,
    upc: record.correctedUpc ?? undefined,
    volumeMl: record.correctedVolumeMl ?? undefined,
    fillPercent:
      record.correctedFillTenths === null ? undefined : record.correctedFillTenths * 10,
  };
}

export function wasCorrected(record: {
  originalBottleId: string | null;
  correctedBottleId: string | null;
  originalBottleName: string | null;
  correctedBottleName: string | null;
  originalCategory: string | null;
  correctedCategory: string | null;
  originalUpc: string | null;
  correctedUpc: string | null;
  originalVolumeMl: number | null;
  correctedVolumeMl: number | null;
  originalFillTenths: number | null;
  correctedFillTenths: number | null;
}) {
  if (record.correctedBottleId === null && record.correctedFillTenths === null) {
    return false;
  }

  return (
    record.originalBottleId !== record.correctedBottleId ||
    record.originalBottleName !== record.correctedBottleName ||
    record.originalCategory !== record.correctedCategory ||
    record.originalUpc !== record.correctedUpc ||
    record.originalVolumeMl !== record.correctedVolumeMl ||
    record.originalFillTenths !== record.correctedFillTenths
  );
}
