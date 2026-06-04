import { useMemo, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DestinationNav = ({ destination, stickyNavRef, scrollToSection }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const hasData = (field) => {
    const val = destination[field];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  };

  const anchorLinks = useMemo(
    () =>
      [
        hasData('getting_here') && {
          id: "getting-here",
          label: t("gettingHere") || "Getting Here",
        },
        hasData('what_to_do') && {
          id: "what-to-do",
          label: t("whatToDo") || "What to Do",
        },
        hasData('good_to_know') && {
          id: "good-to-know",
          label: t("goodToKnow") || "Good to Know",
        },
        hasData('when_to_visit') && {
          id: "when-to-visit",
          label: t("whenToVisit") || "When to Visit",
        },
        hasData('faq') && {
          id: "faq",
          label: "FAQ",
        },
        destination.gallery_urls?.length > 0 && {
          id: "gallery",
          label: t("photoGallery") || "Gallery",
        },
      ].filter(Boolean),
    [destination, t]
  );

  useEffect(() => {
    if (!navRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: navRef.current, start: "top 90%", once: true } }
      );
    }, navRef);
    return () => ctx.revert();
  }, []);

  if (anchorLinks.length === 0) return null;

  return (
    <nav
      ref={(el) => {
        navRef.current = el;
        if (stickyNavRef) stickyNavRef.current = el;
      }}
      className="sticky top-[79px] bg-white/95 backdrop-blur-md z-30 border-b border-brand-ink/5"
    >
      <div className="content-wrapper">
        <div className="flex justify-center items-center overflow-x-auto no-scrollbar -mx-4" ref={navRef}>
          {anchorLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                navigate(`#${link.id}`);
                scrollToSection(link.id);
              }}
              className="flex-shrink-0 px-5 md:px-7 py-4 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-brand-ink/50 hover:text-brand-action border-b-2 border-transparent hover:border-brand-action transition-all duration-300"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default DestinationNav;
