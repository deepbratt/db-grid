export interface RowEditState<TData extends Record<string, unknown>> {
  draft: TData;
  original: TData;
}

export function createRowEditState<TData extends Record<string, unknown>>(data: TData): RowEditState<TData> {
  return {
    draft: { ...data },
    original: { ...data },
  };
}

export function commitRowEdit<TData extends Record<string, unknown>>(
  state: RowEditState<TData>
): TData {
  return { ...state.draft };
}

export function cancelRowEdit<TData extends Record<string, unknown>>(
  state: RowEditState<TData>
): TData {
  state.draft = { ...state.original };
  return state.draft;
}
