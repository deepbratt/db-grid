import { useMemo, useState } from 'react';
import { DbGrid, type ColumnDef } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { DEMO_LICENSE_KEY } from '../data/instruments';

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  instrument: string;
  quantity: number;
  price: number;
};

const INVENTORY: InventoryItem[] = [
  { id: '1', sku: 'WDG-001', name: 'Widget A', category: 'Components', instrument: 'Widget', quantity: 420, price: 12.5 },
  { id: '2', sku: 'WDG-002', name: 'Widget B', category: 'Components', instrument: 'Widget', quantity: 180, price: 14.25 },
  { id: '3', sku: 'CBL-100', name: 'USB-C Cable', category: 'Peripherals', instrument: 'Cable', quantity: 950, price: 8.99 },
  { id: '4', sku: 'CBL-200', name: 'HDMI Cable', category: 'Peripherals', instrument: 'Cable', quantity: 640, price: 11.5 },
  { id: '5', sku: 'MON-010', name: '27" Monitor', category: 'Displays', instrument: 'Monitor', quantity: 72, price: 299 },
  { id: '6', sku: 'MON-020', name: '32" Monitor', category: 'Displays', instrument: 'Monitor', quantity: 38, price: 449 },
  { id: '7', sku: 'KEY-050', name: 'Mechanical Keyboard', category: 'Peripherals', instrument: 'Keyboard', quantity: 210, price: 89 },
  { id: '8', sku: 'MSE-060', name: 'Wireless Mouse', category: 'Peripherals', instrument: 'Mouse', quantity: 530, price: 34.99 },
  { id: '9', sku: 'SSD-128', name: 'NVMe 1TB', category: 'Storage', instrument: 'SSD', quantity: 156, price: 79 },
  { id: '10', sku: 'SSD-256', name: 'NVMe 2TB', category: 'Storage', instrument: 'SSD', quantity: 94, price: 129 },
  { id: '11', sku: 'RAM-016', name: 'DDR5 16GB', category: 'Components', instrument: 'Memory', quantity: 320, price: 54 },
  { id: '12', sku: 'RAM-032', name: 'DDR5 32GB', category: 'Components', instrument: 'Memory', quantity: 145, price: 98 },
];

export function InventoryDemoPage() {
  const [rowData] = useState(INVENTORY);

  const columnDefs = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      { field: 'sku', headerName: 'SKU', width: 110 },
      { field: 'name', headerName: 'Product', flex: 1, minWidth: 160 },
      { field: 'category', headerName: 'Category', width: 130, filter: 'set' },
      { field: 'instrument', headerName: 'Instrument', width: 120, filter: 'set' },
      {
        field: 'quantity',
        headerName: 'Qty',
        width: 100,
        editable: true,
        filter: 'number',
        enableValue: true,
        aggFunc: 'sum',
      },
      {
        field: 'price',
        headerName: 'Unit Price',
        width: 120,
        editable: true,
        filter: 'number',
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
      {
        colId: 'lineTotal',
        headerName: 'Line Total',
        width: 120,
        valueGetter: (p) => (p.data ? p.data.quantity * p.data.price : null),
        valueFormatter: (p) =>
          p.value == null ? '' : `$${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      },
    ],
    []
  );

  return (
    <main className="page page-wide">
      <h1>Inventory demo</h1>
      <p className="lede">
        Editable quantity and unit price with set filters on category and instrument type.
      </p>
      <section className="grid-stage">
        <DbGrid<InventoryItem>
          rowData={rowData}
          columnDefs={columnDefs}
          licenseKey={DEMO_LICENSE_KEY}
          floatingFilter
          undoRedoCellEditing
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          getRowId={(d) => d.id}
        />
      </section>
      <p className="hint">Double-click Qty or Unit Price to edit. Use column filters to narrow by category or instrument.</p>
    </main>
  );
}
