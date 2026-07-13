import type { RowId, RowNode } from '../types';

export function forEachLeafNode<TData>(
  nodes: RowNode<TData>[],
  cb: (node: RowNode<TData>) => void
): void {
  for (const node of nodes) {
    if (node.group && node.childrenAfterGroup?.length) {
      forEachLeafNode(node.childrenAfterGroup, cb);
    } else if (!node.group) {
      cb(node);
    }
  }
}

export function getAllLeafData<TData>(nodes: RowNode<TData>[]): TData[] {
  const result: TData[] = [];
  forEachLeafNode(nodes, (node) => {
    if (node.data != null) result.push(node.data);
  });
  return result;
}

export function getBusinessKeyForNode<TData>(node: RowNode<TData>): RowId | null {
  if (node.group) return node.key ?? node.id;
  return node.id;
}
