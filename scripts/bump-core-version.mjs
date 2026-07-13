import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(root, 'packages/db-grid/package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function latestOnNpm(name) {
  try {
    return execSync(`npm view ${name} version`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function parseSemver(v) {
  const m = String(v).trim().match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) throw new Error(`Invalid semver: ${v}`);
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

function format({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

/** @param {'major'|'minor'|'patch'} kind */
function bump(v, kind) {
  const s = parseSemver(v);
  if (kind === 'major') return format({ major: s.major + 1, minor: 0, patch: 0 });
  if (kind === 'minor') return format({ major: s.major, minor: s.minor + 1, patch: 0 });
  return format({ major: s.major, minor: s.minor, patch: s.patch + 1 });
}

function bumpKindFromCommits() {
  const forced = (process.env.FORCE_BUMP || '').trim();
  if (forced === 'major' || forced === 'minor' || forced === 'patch') return forced;

  const range = process.env.BUMP_COMMIT_RANGE || '';
  let log = '';
  try {
    log = range ? sh(`git log --format=%B ${range}`) : sh('git log -20 --format=%B');
  } catch {
    return 'patch';
  }
  if (/BREAKING CHANGE|^breaking(\(|:)/im.test(log)) return 'major';
  if (/^feat(\(|:)/im.test(log) || /^feature(\(|:)/im.test(log)) return 'minor';
  return 'patch';
}

const published = latestOnNpm(pkg.name);
const kind = bumpKindFromCommits();

/** First publish: keep package.json version. Later: always bump from registry. */
const next = published ? bump(published, kind) : pkg.version || '1.0.0';

pkg.version = next;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.error(`@deepbratt55/db-grid ${published ? `${published} → ${next} (${kind})` : `first publish ${next}`}`);
process.stdout.write(`${next}\n`);
