// components/providers/ScrollOrchestrator.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { scrollState } from "@/lib/scroll/scroll-state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollOrchestrator({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)", noPreference: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (ctx.conditions!.reduceMotion) {
            document.documentElement.classList.add("reduced-motion");
            return () => document.documentElement.classList.remove("reduced-motion");
          }

          // Lenis dirigido pelo ticker do GSAP — fonte única de rAF
          const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
          lenis.on("scroll", ScrollTrigger.update);
          const tick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);

          ScrollTrigger.create({
            id: "global-progress",
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              scrollState.progress = self.progress;
              scrollState.velocity = self.getVelocity() / 1000;
            },
          });

          const smooth = gsap.quickTo(scrollState, "lerped", { duration: 0.6, ease: "power2.out" });
          const sync = () => {
            smooth(scrollState.progress);
          };
          gsap.ticker.add(sync);

          const onPointer = (e: PointerEvent) => {
            scrollState.pointer.x = (e.clientX / innerWidth) * 2 - 1;
            scrollState.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
          };
          addEventListener("pointermove", onPointer, { passive: true });

          // Reposicionar triggers quando as fontes carregarem (layout muda)
          document.fonts?.ready.then(() => ScrollTrigger.refresh());

          return () => {
            removeEventListener("pointermove", onPointer);
            gsap.ticker.remove(sync);
            gsap.ticker.remove(tick);
            lenis.destroy();
          };
        }
      );
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
