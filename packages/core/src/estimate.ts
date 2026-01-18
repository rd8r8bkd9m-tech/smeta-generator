import { cloneDeep, isEqual } from 'lodash';
import { nanoid } from 'nanoid';
import { 
  Estimate, 
  EstimateDiff, 
  EstimateMetadata, 
  LineItem, 
} from '@smeta/types';

export const computeTotals = (estimate: Estimate): Estimate => {
  const flat = flattenLineItems(estimate.lineItems);
  const subtotal = flat.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  
  const overhead = estimate.overhead || 0;
  const profit = estimate.profit || 0;
  
  // subtotal * (1 + vatRate) is a simple way, but let's be more precise
  const totalBeforeVat = subtotal + overhead + profit;
  const total = totalBeforeVat * (1 + estimate.vatRate);
  
  return { ...estimate, subtotal, total };
};

export const flattenLineItems = (items: LineItem[]): LineItem[] => {
  const list: LineItem[] = [];
  const traverse = (nodes: LineItem[]) => {
    nodes.forEach((node) => {
      list.push(node);
      if (node.children?.length) traverse(node.children);
    });
  };
  traverse(items);
  return list;
};

const buildLineItemMap = (items: LineItem[]) => {
  const map = new Map<string, LineItem>();
  const walk = (nodes: LineItem[]) => {
    nodes.forEach((node) => {
      map.set(node.id, node);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(items);
  return map;
};

export interface DiffChange<T> {
  field: keyof T;
  before: T[keyof T];
  after: T[keyof T];
}

export const diffEstimates = (prev: Estimate, next: Estimate): EstimateDiff => {
  const metadataKeys: Array<keyof EstimateMetadata> = [
    'id',
    'code',
    'name',
    'customer',
    'tags',
    'status',
    'lastSyncedAt',
    'updatedAt',
    'createdAt',
    'syncState',
    'userId',
    'projectId'
  ];

  const metadataChanges: any[] = metadataKeys.reduce((acc, key) => {
    const prevValue = prev[key];
    const nextValue = next[key];
    if (!isEqual(prevValue, nextValue)) {
      acc.push({ field: key, before: prevValue, after: nextValue });
    }
    return acc;
  }, [] as any[]);

  const prevItems = buildLineItemMap(prev.lineItems);
  const nextItems = buildLineItemMap(next.lineItems);
  const lineItemChanges: EstimateDiff['lineItemChanges'] = [];

  nextItems.forEach((item, id) => {
    const previous = prevItems.get(id);
    if (!previous) {
      lineItemChanges.push({ id, type: 'added', after: item });
    } else if (!isEqual(previous, item)) {
      lineItemChanges.push({ id, type: 'updated', before: previous, after: item });
    }
  });

  prevItems.forEach((item, id) => {
    if (!nextItems.has(id)) {
      lineItemChanges.push({ id, type: 'removed', before: item });
    }
  });

  return { metadataChanges, lineItemChanges };
};

export const applyLineItemUpdate = (
  items: LineItem[],
  updated: LineItem
): LineItem[] => {
  const copy = cloneDeep(items);
  const map = new Map(flattenLineItems(copy).map((item) => [item.id, item] as const));
  
  const updateRecursive = (nodes: LineItem[]): boolean => {
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].id === updated.id) {
        nodes[i] = { ...nodes[i], ...updated };
        return true;
      }
      if (nodes[i].children && updateRecursive(nodes[i].children!)) return true;
    }
    return false;
  };

  if (map.has(updated.id)) {
    updateRecursive(copy);
  }
  return copy;
};

export const removeLineItem = (items: LineItem[], id: string): LineItem[] => {
  const filterRecursive = (nodes: LineItem[]): LineItem[] =>
    nodes
      .filter((node) => node.id !== id)
      .map((node) => ({
        ...node,
        children: node.children ? filterRecursive(node.children) : []
      }));
  return filterRecursive(items);
};

export const insertChildLineItem = (items: LineItem[], parentId: string | null): LineItem[] => {
  const newItem: LineItem = {
    id: nanoid(),
    parentId,
    name: 'Новая позиция',
    unit: 'шт',
    quantity: 1,
    unitPrice: 0,
    sortOrder: Date.now(),
    children: []
  };
  
  if (!parentId) return [...items, newItem];
  
  const copy = cloneDeep(items);
  const walk = (nodes: LineItem[]): boolean => {
    for (const node of nodes) {
      if (node.id === parentId) {
        node.children = node.children ? [...node.children, newItem] : [newItem];
        return true;
      }
      if (node.children?.length && walk(node.children)) return true;
    }
    return false;
  };
  
  walk(copy);
  return copy;
};

export const buildEmptyEstimate = (userId: string): Estimate => {
  const now = Date.now();
  return {
    id: nanoid(),
    code: `EST-${now}`,
    name: 'Новая смета',
    tags: [],
    status: 'draft',
    updatedAt: now,
    createdAt: now,
    syncState: 'idle',
    userId: userId,
    lineItems: [],
    subtotal: 0,
    vatRate: 0.20,
    total: 0
  };
};
