export const communicationChannelsModule = {
  id: "communication-channels",
  slug: "estrategias-meios-comunicacao",
  version: "0.1.0",
  title: "Estratégias para diversos meios de comunicação",
  category: "marketing",
  tag: "CANAIS",
  status: "specification",
  description:
    "Audita e orienta como estruturar os canais físicos, digitais e relacionais para transmitir profissionalismo e gerar oportunidades.",
  usesCompanyProfile: true,
  checklistStates: ["correct", "needs_improvement", "not_applicable"],
  persistence: {
    provider: "supabase",
    saveProgress: true
  },
  reports: {
    printable: true,
    shareable: true,
    persistent: true
  },
  analyticsEvents: [
    "channels_module_opened",
    "channel_opened",
    "channel_status_changed",
    "checklist_item_changed",
    "recommendation_opened",
    "suggestion_generated",
    "report_generated",
    "report_shared"
  ]
} as const;
