export interface ReferenceDataEntry {
  value: string | number | boolean;
  label: string;
}

export interface ReferenceDataMap {
  values: ReferenceDataEntry[];
  toLabel: (v: string | number | boolean | null | undefined) => string;
  toValue: (label: string) => string | number | boolean | undefined;
}

export function createReferenceDataMap(values: ReferenceDataEntry[]): ReferenceDataMap {
  const valueToLabel = new Map<string, string>();
  const labelToValue = new Map<string, string | number | boolean>();

  for (const entry of values) {
    const key = String(entry.value);
    valueToLabel.set(key, entry.label);
    labelToValue.set(entry.label, entry.value);
  }

  return {
    values,
    toLabel(v) {
      if (v == null) return '';
      return valueToLabel.get(String(v)) ?? String(v);
    },
    toValue(label) {
      return labelToValue.get(label);
    },
  };
}
