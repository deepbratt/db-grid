import { useEffect, useMemo, useState } from 'react';
import { api } from './api/client';

type License = {
  id: string;
  org_name: string;
  plan_name: string;
  tier: string;
  license_key: string;
  seats: number;
  seats_used: number;
  status: string;
  issued_at: string;
  expires_at: string | null;
};

type Stats = {
  activeLicenses: number;
  seatsPurchased: number;
  seatsUsed: number;
  organizations: number;
  events: Array<{ event_type: string; count: number }>;
};

type Plan = {
  id: string;
  name: string;
  tier: string;
  price_per_seat_usd: number;
};

type User = {
  id: string;
  email: string;
  name: string;
  orgId: string;
  orgName: string;
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('db_grid_lic_token') ?? '');
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('admin@dbgrid.dev');
  const [password, setPassword] = useState('admin123');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<License | null>(null);
  const [activations, setActivations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [issueForm, setIssueForm] = useState({
    planId: 'enterprise',
    seats: 10,
    company: 'db-grid Demo Corp',
    trial: false,
    daysValid: 365,
  });
  const [busy, setBusy] = useState(false);
  const [offlineDemo, setOfflineDemo] = useState(false);

  const utilization = useMemo(() => {
    if (!stats?.seatsPurchased) return 0;
    return Math.round((stats.seatsUsed / stats.seatsPurchased) * 100);
  }, [stats]);

  const load = async (authToken = token) => {
    try {
      const [lic, st, pl] = await Promise.all([
        api<License[]>('/licenses'),
        api<Stats>('/licenses/stats'),
        api<Plan[]>('/licenses/plans'),
      ]);
      setLicenses(lic);
      setStats(st);
      setPlans(pl);
      setOfflineDemo(false);
      if (authToken) {
        const me = await api<User>('/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUser(me);
      }
    } catch (e: any) {
      setOfflineDemo(true);
      setError(e.message);
      // Demo data so UI is usable without DB
      setStats({
        activeLicenses: 2,
        seatsPurchased: 30,
        seatsUsed: 4,
        organizations: 1,
        events: [
          { event_type: 'issued', count: 2 },
          { event_type: 'validate', count: 12 },
        ],
      });
      setPlans([
        { id: 'community', name: 'Community', tier: 'community', price_per_seat_usd: 0 },
        { id: 'enterprise', name: 'Enterprise', tier: 'enterprise', price_per_seat_usd: 999 },
        {
          id: 'enterprise-bundle',
          name: 'Enterprise Bundle',
          tier: 'enterprise-bundle',
          price_per_seat_usd: 1499,
        },
      ]);
      setLicenses([
        {
          id: 'demo-1',
          org_name: 'db-grid Demo Corp',
          plan_name: 'Enterprise Bundle',
          tier: 'enterprise-bundle',
          license_key: 'DBG.demo.offline',
          seats: 25,
          seats_used: 3,
          status: 'active',
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 864e5).toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('db_grid_lic_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await load(res.token);
    } catch (err: any) {
      setError(err.message);
      setUser({
        id: 'local',
        email,
        name: 'Local Admin',
        orgId: 'local',
        orgName: 'Offline Mode',
      });
    } finally {
      setBusy(false);
    }
  };

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.orgId || user.orgId === 'local') {
      setError('Start API + seed DB to issue real signed keys.');
      return;
    }
    setBusy(true);
    try {
      await api('/licenses/issue', {
        method: 'POST',
        body: JSON.stringify({
          orgId: user.orgId,
          ...issueForm,
        }),
      });
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const openLicense = async (lic: License) => {
    setSelected(lic);
    if (offlineDemo || lic.id.startsWith('demo')) {
      setActivations([{ machine_id: 'dev-workstation', app_name: 'db-grid Demo', last_seen_at: new Date().toISOString() }]);
      setEvents([{ event_type: 'issued', created_at: lic.issued_at, payload: {} }]);
      return;
    }
    try {
      const [acts, evs] = await Promise.all([
        api<any[]>(`/licenses/${lic.id}/activations`),
        api<any[]>(`/licenses/${lic.id}/events`),
      ]);
      setActivations(acts);
      setEvents(evs);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const revoke = async (id: string) => {
    if (id.startsWith('demo')) return;
    await api(`/licenses/${id}/revoke`, { method: 'POST' });
    setSelected(null);
    await load();
  };

  if (!user) {
    return (
      <div className="login-shell">
        <div className="login-visual" aria-hidden>
          <div className="orb" />
          <div className="grid-lines" />
        </div>
        <form className="login-panel" onSubmit={login}>
          <p className="kicker">License Control Plane</p>
          <h1>db-grid</h1>
          <p className="sub">Issue keys, track seats, revoke deployments.</p>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Enter dashboard'}
          </button>
          <p className="fine">Demo: admin@dbgrid.dev / admin123</p>
        </form>
      </div>
    );
  }

  return (
    <div className="dash">
      <header className="dash-top">
        <div>
          <p className="kicker">Licensing</p>
          <h1>db-grid</h1>
        </div>
        <div className="who">
          <span>
            {user.name} · {user.orgName}
          </span>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              localStorage.removeItem('db_grid_lic_token');
              setToken('');
              setUser(null);
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {offlineDemo && (
        <p className="banner">
          API/DB offline — showing demo data. Run `docker compose up -d`, `npm run db:seed`, then
          `npm run dev:api`.
        </p>
      )}

      <section className="metrics">
        <article>
          <span>Active licenses</span>
          <strong>{stats?.activeLicenses ?? '—'}</strong>
        </article>
        <article>
          <span>Seats used</span>
          <strong>
            {stats?.seatsUsed ?? 0}
            <small> / {stats?.seatsPurchased ?? 0}</small>
          </strong>
        </article>
        <article>
          <span>Utilization</span>
          <strong>{utilization}%</strong>
          <div className="meter">
            <i style={{ width: `${utilization}%` }} />
          </div>
        </article>
        <article>
          <span>Organizations</span>
          <strong>{stats?.organizations ?? '—'}</strong>
        </article>
      </section>

      <div className="layout">
        <section className="panel">
          <div className="panel-head">
            <h2>Licenses</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Org</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Seats</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((l) => (
                  <tr
                    key={l.id}
                    className={selected?.id === l.id ? 'active' : ''}
                    onClick={() => void openLicense(l)}
                  >
                    <td>{l.org_name}</td>
                    <td>{l.plan_name}</td>
                    <td>
                      <span className={`pill ${l.status}`}>{l.status}</span>
                    </td>
                    <td>
                      {l.seats_used}/{l.seats}
                    </td>
                    <td>{l.expires_at ? new Date(l.expires_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="side">
          <section className="panel">
            <h2>Issue license</h2>
            <form className="issue" onSubmit={issue}>
              <label>
                Plan
                <select
                  value={issueForm.planId}
                  onChange={(e) => setIssueForm((f) => ({ ...f, planId: e.target.value }))}
                >
                  {plans
                    .filter((p) => p.id !== 'community')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · ${p.price_per_seat_usd}/seat
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Company
                <input
                  value={issueForm.company}
                  onChange={(e) => setIssueForm((f) => ({ ...f, company: e.target.value }))}
                />
              </label>
              <label>
                Seats
                <input
                  type="number"
                  min={1}
                  value={issueForm.seats}
                  onChange={(e) =>
                    setIssueForm((f) => ({ ...f, seats: Number(e.target.value) }))
                  }
                />
              </label>
              <label>
                Validity (days)
                <input
                  type="number"
                  min={1}
                  value={issueForm.daysValid}
                  onChange={(e) =>
                    setIssueForm((f) => ({ ...f, daysValid: Number(e.target.value) }))
                  }
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={issueForm.trial}
                  onChange={(e) => setIssueForm((f) => ({ ...f, trial: e.target.checked }))}
                />
                30-day style trial flag
              </label>
              <button type="submit" disabled={busy}>
                Generate signed key
              </button>
            </form>
          </section>

          {selected && (
            <section className="panel detail">
              <h2>License detail</h2>
              <p className="key">{selected.license_key}</p>
              <button type="button" className="ghost" onClick={() => void navigator.clipboard.writeText(selected.license_key)}>
                Copy key
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => void revoke(selected.id)}
                disabled={selected.status === 'revoked'}
              >
                Revoke
              </button>
              <h3>Activations</h3>
              <ul>
                {activations.map((a, i) => (
                  <li key={i}>
                    {a.machine_id} · {a.app_name} ·{' '}
                    {new Date(a.last_seen_at).toLocaleString()}
                  </li>
                ))}
                {!activations.length && <li>None yet</li>}
              </ul>
              <h3>Events</h3>
              <ul>
                {events.map((ev, i) => (
                  <li key={i}>
                    {ev.event_type} · {new Date(ev.created_at).toLocaleString()}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
