"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CAPABILITY_CLUSTERS } from "@/lib/content/capabilities";
import { scrollState } from "@/lib/scroll/scroll-state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Capabilities() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (!ctx.conditions!.isDesktop) return;
          const panels = gsap.utils.toArray<HTMLElement>(".cap-panel");
          gsap.set(panels.slice(1), { autoAlpha: 0 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=300%",
              pin: true,
              scrub: 1,
              snap: { snapTo: 1 / 3, duration: 0.4, ease: "power1.inOut" },
              onUpdate: (self) => {
                scrollState.cluster = self.progress * 3; // 0..3 → CapabilityMatrix
              },
            },
          });
          panels.slice(1).forEach((panel, i) => {
            tl.to(panels[i], { autoAlpha: 0, y: -24, duration: 0.35 }, i)
              .to(panel, { autoAlpha: 1, y: 0, duration: 0.35 }, i + 0.15);
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <section id="capabilities" ref={root} className="relative min-h-dvh px-5 py-40 md:px-24">
      <div className="md:grid md:grid-cols-2 md:gap-12">
        <div className="relative md:min-h-[60vh]">
          {CAPABILITY_CLUSTERS.map((c, i) => (
            <article
              key={c.id}
              className={`cap-panel motion-safe:md:absolute motion-safe:md:inset-0 ${i > 0 ? "mt-16 motion-safe:md:mt-0 motion-safe:md:opacity-0" : ""}`}
            >
              <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-signal">{c.label}</p>
              <h3 className="mt-4 text-[length:var(--text-h2)] font-semibold leading-tight text-ink">{c.title}</h3>
              <p className="mt-5 max-w-[52ch] leading-relaxed text-ink-muted">{c.body}</p>
              <p className="mt-6 font-mono text-sm text-ink">{c.stack}</p>
              <p className="mt-3 inline-block rounded border border-hairline bg-surface px-3 py-1.5 font-mono text-[13px] uppercase tracking-[0.08em] text-signal">
                {c.proof}
              </p>
            </article>
          ))}
        </div>
        <div aria-hidden className="hidden md:block" /> {/* janela para a matriz no canvas */}
      </div>
    </section>
  );
}
