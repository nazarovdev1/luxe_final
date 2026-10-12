// Community-style modules stay hidden from navigation until the shop has the content
// and staff time to run them. Routes still exist; enable via VITE_ENABLE_FEATURES=style-feed,live
export const OPTIONAL_FEATURES = ['style-feed', 'challenges', 'live'];

export const parseEnabledFeatures = (raw) => new Set(
  String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

export const isFeatureEnabled = (id, raw = import.meta.env?.VITE_ENABLE_FEATURES) => (
  !OPTIONAL_FEATURES.includes(id) || parseEnabledFeatures(raw).has(id)
);
