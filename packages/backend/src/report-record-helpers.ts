export function toIso(value: Date | null | undefined): string | undefined {
  return value?.toISOString();
}

function maybeBottleValues(fields: {
  bottleName: string | null;
  category: string | null;
  upc: string | null;
  volumeMl: number | null;
  fillTenths: number | null;
}) {
  const hasValue =
    fields.bottleName !== null ||
    fields.category !== null ||
    fields.upc !== null ||
    fields.volumeMl !== null ||
    fields.fillTenths !== null;

  if (!hasValue) {
    return undefined;
  }

  return {
    bottleName: fields.bottleName ?? undefined,
    category: fields.category ?? undefined,
    upc: fields.upc ?? undefined,
    volumeMl: fields.volumeMl ?? undefined,
    fillPercent: fields.fillTenths === null ? undefined : fields.fillTenths * 10,
  };
}

export function maybeModelOutput(record: {
  originalBottleName: string | null;
  originalCategory: string | null;
  originalUpc: string | null;
  originalVolumeMl: number | null;
  originalFillTenths: number | null;
}) {
  return maybeBottleValues({
    bottleName: record.originalBottleName,
    category: record.originalCategory,
    upc: record.originalUpc,
    volumeMl: record.originalVolumeMl,
    fillTenths: record.originalFillTenths,
  });
}

export function maybeCorrectedValues(record: {
  correctedBottleName: string | null;
  correctedCategory: string | null;
  correctedUpc: string | null;
  correctedVolumeMl: number | null;
  correctedFillTenths: number | null;
}) {
  return maybeBottleValues({
    bottleName: record.correctedBottleName,
    category: record.correctedCategory,
    upc: record.correctedUpc,
    volumeMl: record.correctedVolumeMl,
    fillTenths: record.correctedFillTenths,
  });
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
