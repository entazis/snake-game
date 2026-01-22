/**
 * Lightweight client for submitting baseline metrics to the Metrics API.
 */

export type MetricType = 'counter';

export type Metric = Readonly<{
  name: string;
  type: MetricType;
  value: number;
  labels: Readonly<Record<string, string>>;
  timestamp: number;
}>;

export type MetricBatch = Readonly<{
  site: string;
  metrics: readonly Metric[];
  timestamp: number;
}>;

/**
 * Track a single page visit using same-origin `/api/track`.
 * @returns {Promise<void>}
 */
export const trackPageVisit = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }
  const site: string = window.location.host;
  const page: string = window.location.pathname;
  const metric: Metric = {
    name: 'web_page_visits_total',
    type: 'counter',
    value: 1,
    labels: { site, page },
    timestamp: Date.now(),
  };
  const batch: MetricBatch = {
    site,
    metrics: [metric],
    timestamp: Date.now(),
  };
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
      keepalive: true,
    });
  } catch {
    // Intentionally ignore all errors (best-effort telemetry).
  }
};

