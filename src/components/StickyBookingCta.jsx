import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Premium sticky booking CTA — a floating "glass pill" with a soft beige
 * inner panel, gold (brand-action) accent bar, hairline ring, and a refined
 * entrance. No background label; the CTA itself communicates the action.
 *
 * - Auto-shows after the hero (scrollY > thresholdRatio * vh)
 * - Hides near the page bottom so the footer can breathe
 * - Honors prefers-reduced-motion
 */
const BOOK_DIRECT_URL =
  `${import.meta.env.VITE_SIMPLEBOOKING_BASE || "https://www.simplebooking.it/portal/256"}?lang=EN&cur=EUR`;

const StickyBookingCta = ({ thresholdRatio = 0.85 }) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let ticking = false;
    const compute = () => {
      const vh = window.innerHeight;
      const threshold = vh * thresholdRatio;
      const nearBottom =
        window.innerHeight + window.scrollY >
        document.documentElement.scrollHeight - 220;
      setVisible(window.scrollY > threshold && !nearBottom);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(compute);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    compute();
    return () => window.removeEventListener("scroll", onScroll);
  }, [thresholdRatio]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-booking-cta"
          initial={reduce ? { opacity: 0 } : { y: 64, opacity: 0, scale: 0.96 }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 64, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-4 z-[60] px-3 pointer-events-none"
          role="region"
          aria-label={t("bookYourStay") || "Book your stay"}
        >
          <motion.div
            className="mx-auto max-w-[680px] pointer-events-auto"
            animate={reduce ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative">
              {/* Soft glow halo */}
              <div
                aria-hidden
                className="absolute -inset-2 rounded-full bg-brand-action/15 blur-2xl opacity-70"
              />

              {/* Glass pill */}
              <div className="relative overflow-hidden rounded-full bg-white/85 backdrop-blur-2xl border border-brand-ink/10 shadow-[0_25px_70px_-20px_rgba(29,29,27,0.35)]">
                {/* Top gold hairline */}
                <span
                  aria-hidden
                  className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-action/60 to-transparent"
                />
                {/* Subtle sheen sweep */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 35%, rgba(191,103,62,0.10) 50%, transparent 65%)",
                    backgroundSize: "220% 100%",
                  }}
                  animate={reduce ? undefined : { backgroundPosition: ["220% 0", "-120% 0"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative flex items-center justify-between gap-3 pl-3 pr-2 sm:pl-5 sm:pr-2.5 py-2">
                  {/* Trust mark */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="relative grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-brand-beige to-white border border-brand-ink/10 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-brand-action" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="font-montserrat text-brand-ink/55 text-[0.55rem] uppercase tracking-[0.28em] font-semibold">
                        {t("bestPriceGuaranteed") || "Meilleur tarif garanti"}
                      </p>
                      <p className="font-display italic text-brand-ink text-[0.95rem] sm:text-[1.05rem] leading-none mt-1 truncate">
                        {t("stickyCtaSub") || "Sans commission · confirmation immédiate"}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.a
                    href={BOOK_DIRECT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={reduce ? undefined : { scale: 1.03 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    className="group shrink-0 inline-flex items-center gap-2 bg-brand-ink hover:bg-brand-action text-white font-montserrat font-bold uppercase tracking-[0.22em] text-[0.62rem] sm:text-[0.7rem] pl-5 pr-2 sm:pl-6 sm:pr-2.5 h-11 rounded-full shadow-[0_12px_30px_-10px_rgba(29,29,27,0.55)] transition-colors duration-500"
                    aria-label={t("bookNow") || "Book now"}
                  >
                    <span className="hidden sm:inline">{t("bookNow") || "Réserver"}</span>
                    <span className="sm:hidden">{t("bookNow") || "Réserver"}</span>
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-brand-action group-hover:bg-white text-white group-hover:text-brand-action transition-colors duration-500">
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} />
                    </span>
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyBookingCta;
