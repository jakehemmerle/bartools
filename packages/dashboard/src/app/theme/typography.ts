export const dashboardTypography = {
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  hero: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(3rem, 7vw, 4.5rem)',
    lineHeight: 1,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(3rem, 5.4vw, 4rem)',
    lineHeight: 1.02,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
    lineHeight: 1.08,
  },
  body: {
    fontFamily: 'var(--font-body)',
    fontSize: '16px',
    lineHeight: 1.5,
  },
  label: {
    fontFamily: 'var(--font-label)',
    fontSize: '12px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
} as const
