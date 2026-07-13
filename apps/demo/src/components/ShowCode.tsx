import { useState } from 'react';

export type CodeLang = 'react' | 'js' | 'node';

export type CodeVariants = {
  react: string;
  js: string;
  node: string;
  /** Short how-to shown above the code sample */
  docs?: string;
};

const TABS: { id: CodeLang; label: string }[] = [
  { id: 'react', label: 'React' },
  { id: 'js', label: 'JS' },
  { id: 'node', label: 'Node' },
];

export function ShowCode({ codes, docs }: { codes: CodeVariants; docs?: string }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<CodeLang>('react');
  const [copied, setCopied] = useState(false);

  const blurb = docs ?? codes.docs;
  const source = codes[lang];

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="show-code">
      <button type="button" className="btn primary" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide code' : 'Show code'}
      </button>

      {open && (
        <div className="show-code-panel">
          {blurb ? (
            <div className="show-code-docs">
              {blurb.split('\n').map((line, i) =>
                line.trim() ? (
                  <p key={i}>{line}</p>
                ) : (
                  <br key={i} />
                )
              )}
            </div>
          ) : null}
          <div className="show-code-toolbar">
            <div className="show-code-tabs" role="tablist" aria-label="Code language">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={lang === tab.id}
                  className={`show-code-tab${lang === tab.id ? ' active' : ''}`}
                  onClick={() => setLang(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn" onClick={() => void onCopy()}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="show-code-pre">
            <code>{source}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
