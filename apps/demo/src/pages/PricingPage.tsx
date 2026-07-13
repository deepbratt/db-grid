import { Link } from 'react-router-dom';

const PLANS = [
  {
    id: 'community',
    name: 'Community',
    price: 'Free',
    period: 'forever',
    blurb: 'MIT-licensed core grid — sorting, filtering, editing, CSV export, and virtualization.',
    features: [
      'Client-side row model',
      'Text, number, set & date filters',
      'Cell editing with undo/redo',
      'CSV export & clipboard',
      'ThemeParams (Quartz, Alpine, Balham, Material)',
    ],
    cta: 'Get started',
    ctaHref: '/docs/getting-started',
    internal: true,
    highlight: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$999',
    period: 'per seat / year',
    blurb: 'Grouping, pivot, Excel export, SSRM, formulas, and license validation.',
    features: [
      'Row grouping & aggregation',
      'Pivot mode & tree data',
      'Sparklines & Excel-like editing',
      'Excel export (SpreadsheetML)',
      'Server-side row model',
      'Master/detail & formulas',
    ],
    cta: 'Request license',
    ctaHref: 'http://localhost:5174',
    internal: false,
    highlight: true,
  },
  {
    id: 'enterprise-bundle',
    name: 'Enterprise Bundle',
    price: '$1,499',
    period: 'per seat / year',
    blurb: 'Enterprise plus priority support and multi-app deployment rights.',
    features: [
      'Everything in Enterprise',
      'Multi-product deployment',
      'SSRM PostgreSQL adapter',
      'Licensing API & dashboard',
      'Priority support SLA',
    ],
    cta: 'Talk to sales',
    ctaHref: 'http://localhost:5174',
    internal: false,
    highlight: false,
  },
];

export function PricingPage() {
  return (
    <main className="page page-wide pricing-page">
      <header className="page-hero compact">
        <p className="eyebrow">Plans</p>
        <h1>Pricing</h1>
        <p className="lede">
          Same tier structure as the licensing dashboard — Community is free; Enterprise unlocks
          analytics, charts, and SSRM.
        </p>
      </header>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`pricing-card ${plan.highlight ? 'highlight' : ''}`}
          >
            {plan.highlight && <span className="pricing-badge">Popular</span>}
            <h2>{plan.name}</h2>
            <p className="pricing-price">
              <strong>{plan.price}</strong>
              <span>{plan.period}</span>
            </p>
            <p className="pricing-blurb">{plan.blurb}</p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {plan.internal ? (
              <Link to={plan.ctaHref} className="btn primary">
                {plan.cta}
              </Link>
            ) : (
              <a href={plan.ctaHref} target="_blank" rel="noreferrer" className="btn primary">
                {plan.cta}
              </a>
            )}
          </article>
        ))}
      </div>

      <p className="hint pricing-foot">
        Manage seats and issue keys in the{' '}
        <a href="http://localhost:5174" target="_blank" rel="noreferrer">
          licensing dashboard
        </a>
        .
      </p>
    </main>
  );
}
