import { SectionCards } from "./SectionCards";
import { cards } from "./data";

export default function Example() {
  return (
    <SectionCards
      eyebrow="The platform"
      title={
        <>
          Built for teams that{" "}
          <span className="text-stone-500">ship faster.</span>
        </>
      }
      description="Everything you need to scale from your first customer to your hundred-thousandth — and nothing you don't."
      cards={cards}
    />
  );
}
