export const dashboardTypography = {
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--type-wordmark-size)',
    letterSpacing: 'var(--tracking-wordmark)',
    textTransform: 'uppercase',
  },
  hero: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--type-hero-size)',
    lineHeight: 1,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--type-page-title-size)',
    lineHeight: 1.02,
  },
  detailTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--type-detail-title-size)',
    lineHeight: 1.02,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--type-section-title-size)',
    lineHeight: 1.08,
  },
  sectionTitleCompact: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--type-section-title-compact-size)',
    lineHeight: 1.08,
  },
  bodyLarge: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--type-body-large-size)',
    lineHeight: 1.6,
  },
  body: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--type-body-size)',
    lineHeight: 1.5,
  },
  bodyCompact: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--type-body-compact-size)',
    lineHeight: 1.5,
  },
  label: {
    fontFamily: 'var(--font-label)',
    fontSize: 'var(--type-label-size)',
    letterSpacing: 'var(--tracking-label)',
    textTransform: 'uppercase',
  },
  labelCompact: {
    fontFamily: 'var(--font-label)',
    fontSize: 'var(--type-label-compact-size)',
    letterSpacing: 'var(--tracking-label-compact)',
    textTransform: 'uppercase',
  },
} as const
