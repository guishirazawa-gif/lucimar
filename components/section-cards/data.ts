import {
  Sparkles,
  ShieldCheck,
  Workflow,
  LineChart,
  Zap,
  Globe,
} from "lucide-react";
import type { CardProps } from "./Card";

export const cards: CardProps[] = [
  {
    icon: Sparkles,
    title: "Effortless onboarding",
    description:
      "Teams ship in minutes, not weeks. No setup calls, no migration project.",
    ctaLabel: "See how it works",
    href: "#",
  },
  {
    icon: Workflow,
    title: "Automation that adapts",
    description:
      "Workflows reshape themselves around your data — without writing a single rule.",
    ctaLabel: "Explore workflows",
    href: "#",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description:
      "SOC 2 Type II, SSO, and granular role controls — handled out of the box.",
    ctaLabel: "Read the report",
    href: "#",
  },
  {
    icon: LineChart,
    title: "Insights that move the needle",
    description:
      "Real-time analytics built on the metrics your operators already trust.",
    ctaLabel: "View live demo",
    href: "#",
  },
  {
    icon: Zap,
    title: "Built to disappear",
    description:
      "A platform that gets out of the way so your team can focus on the work.",
    ctaLabel: "Why we built this",
    href: "#",
  },
  {
    icon: Globe,
    title: "Global by default",
    description:
      "Localized in 14 languages with regional data residency where it matters.",
    ctaLabel: "See coverage",
    href: "#",
  },
];
