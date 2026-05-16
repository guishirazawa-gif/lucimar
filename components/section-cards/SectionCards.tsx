import type { ReactNode } from "react";
import { Card, type CardProps } from "./Card";

export type SectionCardsProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  cards: CardProps[];
  className?: string;
};

export function SectionCards({
  eyebrow,
  title,
  description,
  cards,
  className,
}: SectionCardsProps) {
  return (
    <section
      className={
        "bg-[#FAF7F2] px-6 py-24 lg:py-32 " + (className ?? "")
      }
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 max-w-3xl lg:mb-20">
          {eyebrow && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              {eyebrow}
            </p>
          )}
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-stone-900 lg:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-stone-600">
              {description}
            </p>
          )}
        </header>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 lg:gap-8">
          {cards.map((card, i) => (
            <Card key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
