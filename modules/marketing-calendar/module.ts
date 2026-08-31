export const marketingCalendarModule = {
  id: "marketing-calendar",
  slug: "calendario-inteligente-marketing",
  version: "0.1.0",
  title: "Calendário Inteligente de Marketing",
  category: "marketing",
  tag: "PLANEJAMENTO + CAMPANHAS",
  status: "specification",
  description:
    "Calendário anual que reúne datas nacionais, do nicho, cidade, empresa, equipe e usuário e transforma cada data em oportunidade estratégica de marketing.",
  access: {
    calendar: "free",
    dates: "free",
    relevanceExplanation: "free",
    creativeIdeas: "paid",
    campaigns: "paid",
    copy: "paid",
    cta: "paid",
    markDeepDive: "paid"
  },
  usesCompanyProfile: true,
  persistence: {
    provider: "supabase",
    refreshOnEveryOpen: false,
    manualRefresh: true
  },
  analyticsEvents: [
    "calendar_opened",
    "calendar_configured",
    "calendar_refreshed",
    "event_opened",
    "event_filtered",
    "opportunity_saved",
    "creative_generated",
    "campaign_planned",
    "mark_opened_from_event"
  ]
} as const;
