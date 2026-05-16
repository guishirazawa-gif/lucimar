import { ArrowUpRight, type LucideIcon } from "lucide-react";

export type CardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  href?: string;
};

export function Card({
  icon: Icon,
  title,
  description,
  ctaLabel = "Learn more",
  href,
}: CardProps) {
  return (
    <article
      className="
        group relative flex h-full flex-col
        rounded-[32px] bg-[#F2EDE4]
        p-8 lg:p-10
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:bg-[#EBE4D6]
        hover:shadow-[0_30px_60px_-25px_rgba(31,41,55,0.12)]
        motion-reduce:transform-none motion-reduce:transition-none
      "
    >
      <div
        className="
          mb-8 inline-flex h-14 w-14 items-center justify-center
          rounded-2xl bg-white/70 text-stone-900
          transition-colors duration-300
          group-hover:bg-white
        "
      >
        <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
      </div>

      <h3 className="text-2xl font-semibold tracking-tight text-stone-900">
        {title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-stone-600">
        {description}
      </p>

      {href && (
        <a
          href={href}
          className="
            mt-auto inline-flex items-center gap-1.5 pt-8
            text-sm font-medium text-stone-900
            transition-[gap] duration-200 hover:gap-2.5
          "
        >
          {ctaLabel}
          <ArrowUpRight
            className="
              h-4 w-4 transition-transform duration-200
              group-hover:-translate-y-0.5 group-hover:translate-x-0.5
            "
            strokeWidth={2}
            aria-hidden="true"
          />
        </a>
      )}
    </article>
  );
}
