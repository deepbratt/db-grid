type NoteKey = string;

function noteKey(rowId: string | number, colId: string): NoteKey {
  return `${rowId}::${colId}`;
}

const notesStore = new Map<NoteKey, string>();

export function setNote(rowId: string | number, colId: string, text: string): void {
  notesStore.set(noteKey(rowId, colId), text);
}

export function getNote(rowId: string | number, colId: string): string | undefined {
  return notesStore.get(noteKey(rowId, colId));
}

export function getAllNotes(): Map<NoteKey, string> {
  return new Map(notesStore);
}

export function clearNote(rowId: string | number, colId: string): void {
  notesStore.delete(noteKey(rowId, colId));
}
