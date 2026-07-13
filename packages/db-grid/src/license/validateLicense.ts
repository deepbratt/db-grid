export type LicenseTier = 'community' | 'enterprise' | 'enterprise-bundle' | 'invalid';

export interface LicenseInfo {
  valid: boolean;
  tier: LicenseTier;
  company?: string;
  seats?: number;
  expiresAt?: string;
  features: string[];
  watermark: boolean;
  message?: string;
}

const ENTERPRISE_FEATURES = [
  'rowGrouping',
  'aggregation',
  'pivoting',
  'treeData',
  'masterDetail',
  'excelExport',
  'rangeSelection',
  'clipboard',
  'serverSideRowModel',
  'toolPanels',
  'contextMenu',
  'formulas',
  'sparklines',
  'find',
  'statusBar',
  'fillHandle',
  'undoRedo',
  'aiFilter',
  'realtimeCollab',
  'postgresAdapter',
];

const COMMUNITY_FEATURES = [
  'sorting',
  'filtering',
  'pagination',
  'cellEditing',
  'rowSelection',
  'columnResize',
  'columnPin',
  'csvExport',
  'themes',
  'virtualization',
  'keyboardNav',
  'customCellRenderer',
  'valueGetter',
  'valueFormatter',
];

/** Decode db-grid license keys: DBG.<base64url(json)>.<sig> — signature verified server-side; client checks payload + expiry. */
export function validateLicenseKey(key?: string | null): LicenseInfo {
  if (!key || !key.trim()) {
    return {
      valid: true,
      tier: 'community',
      features: COMMUNITY_FEATURES,
      watermark: false,
      message: 'Running db-grid Community (MIT)',
    };
  }

  try {
    const parts = key.trim().split('.');
    if (parts.length < 2 || parts[0] !== 'DBG') {
      return {
        valid: false,
        tier: 'invalid',
        features: COMMUNITY_FEATURES,
        watermark: true,
        message: 'Invalid license key format',
      };
    }
    const json = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const expiresAt = json.expiresAt as string | undefined;
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return {
        valid: false,
        tier: 'invalid',
        features: COMMUNITY_FEATURES,
        watermark: true,
        message: 'License expired',
        expiresAt,
        company: json.company,
      };
    }
    const tier = (json.tier as LicenseTier) || 'enterprise';
    const features =
      tier === 'community'
        ? COMMUNITY_FEATURES
        : [...COMMUNITY_FEATURES, ...ENTERPRISE_FEATURES];

    return {
      valid: true,
      tier,
      company: json.company,
      seats: json.seats,
      expiresAt,
      features,
      watermark: false,
      message: `Licensed to ${json.company || 'customer'} (${tier})`,
    };
  } catch {
    return {
      valid: false,
      tier: 'invalid',
      features: COMMUNITY_FEATURES,
      watermark: true,
      message: 'Could not parse license key — enterprise features watermarked',
    };
  }
}

export function hasFeature(info: LicenseInfo, feature: string): boolean {
  if (info.tier === 'community' && ENTERPRISE_FEATURES.includes(feature)) return false;
  if (!info.valid && ENTERPRISE_FEATURES.includes(feature)) return false;
  return info.features.includes(feature) || COMMUNITY_FEATURES.includes(feature);
}

export { COMMUNITY_FEATURES, ENTERPRISE_FEATURES };
