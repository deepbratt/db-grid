import { useMemo, useState } from 'react';
import { DbGrid, type ColumnDef } from '@deepbratt55/db-grid';
import '@deepbratt55/db-grid/styles.css';
import { DEMO_LICENSE_KEY } from '../data/instruments';

type Employee = {
  id: string;
  orgPath: string[];
  title: string;
  email: string;
  location: string;
};

const EMPLOYEES: Employee[] = [
  { id: 'eng-fe-alice', orgPath: ['Engineering', 'Frontend', 'Alice Chen'], title: 'Staff Engineer', email: 'alice@dbgrid.dev', location: 'NYC' },
  { id: 'eng-fe-bob', orgPath: ['Engineering', 'Frontend', 'Bob Rivera'], title: 'Senior Engineer', email: 'bob@dbgrid.dev', location: 'Remote' },
  { id: 'eng-fe-cara', orgPath: ['Engineering', 'Frontend', 'Cara Singh'], title: 'Engineer', email: 'cara@dbgrid.dev', location: 'London' },
  { id: 'eng-be-dan', orgPath: ['Engineering', 'Backend', 'Dan Okonkwo'], title: 'Staff Engineer', email: 'dan@dbgrid.dev', location: 'NYC' },
  { id: 'eng-be-eva', orgPath: ['Engineering', 'Backend', 'Eva Martins'], title: 'Senior Engineer', email: 'eva@dbgrid.dev', location: 'Berlin' },
  { id: 'eng-plat-finn', orgPath: ['Engineering', 'Platform', 'Finn Walsh'], title: 'Principal Engineer', email: 'finn@dbgrid.dev', location: 'SF' },
  { id: 'sales-emea-gina', orgPath: ['Sales', 'EMEA', 'Gina Park'], title: 'Account Executive', email: 'gina@dbgrid.dev', location: 'Paris' },
  { id: 'sales-emea-hugo', orgPath: ['Sales', 'EMEA', 'Hugo Berg'], title: 'Sales Manager', email: 'hugo@dbgrid.dev', location: 'Stockholm' },
  { id: 'sales-na-ivy', orgPath: ['Sales', 'North America', 'Ivy Thompson'], title: 'Enterprise AE', email: 'ivy@dbgrid.dev', location: 'Chicago' },
  { id: 'ops-hr-jade', orgPath: ['Operations', 'HR', 'Jade Miller'], title: 'People Partner', email: 'jade@dbgrid.dev', location: 'Remote' },
  { id: 'ops-fin-kyle', orgPath: ['Operations', 'Finance', 'Kyle Brooks'], title: 'Finance Manager', email: 'kyle@dbgrid.dev', location: 'NYC' },
];

export function HrDemoPage() {
  const [rowData] = useState(EMPLOYEES);

  const columnDefs = useMemo<ColumnDef<Employee>[]>(
    () => [
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 160 },
      { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
      { field: 'location', headerName: 'Location', width: 120 },
    ],
    []
  );

  return (
    <main className="page page-wide">
      <h1>HR directory demo</h1>
      <p className="lede">
        Tree data org chart — departments and teams expand to show employees.
      </p>
      <section className="grid-stage">
        <DbGrid<Employee>
          rowData={rowData}
          columnDefs={columnDefs}
          licenseKey={DEMO_LICENSE_KEY}
          treeData
          getDataPath={(d) => d.orgPath}
          groupDefaultExpanded={1}
          autoGroupColumnDef={{ headerName: 'Organization', minWidth: 240, flex: 1.2 }}
          defaultColDef={{ sortable: true, resizable: true }}
          getRowId={(d) => d.id}
        />
      </section>
      <p className="hint">Expand Engineering or Sales to browse teams. First level opens by default.</p>
    </main>
  );
}
