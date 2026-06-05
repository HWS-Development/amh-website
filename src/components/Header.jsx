import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Menu, X, Globe, ChevronDown, Search, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BookingStrip from "@/components/BookingStrip";
import { supabase } from "@/lib/customSupabaseClient";
import { listExperiences, listDestinations } from "@/lib/mghApi";
import { getTranslated } from "@/lib/utils";
import { fetchCatalog } from "@/lib/catalogs";
import { extractCentraHotelId, extractCentraOrganizationId, usePartnerHotels } from "@/lib/partnerHotelsApi";
import i18n from "@/i18n";
import OptimizedImage from "@/components/ui/OptimizedImage";
import gsap from "gsap";

const useScroll = () => {
  const [scrollData, setScrollData] = useState({ y: 0, lastY: 0 });
  useEffect(() => {
    const handleScroll = () => {
      setScrollData(prev => ({ y: window.scrollY, lastY: prev.y }));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return scrollData;
};

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English",  flag: "🇬🇧" },
  { code: "es", name: "Español",  flag: "🇪🇸" },
];

const LanguageSelector = ({ currentLanguage, changeLanguage }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((l) => l.code === currentLanguage) || languages[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group flex items-center gap-2 px-3 py-2 border border-brand-ink/10 hover:border-brand-action transition-colors duration-300"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brand-ink group-hover:text-brand-action transition-colors duration-300">
          {current.code}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round"
          className={`text-brand-ink/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        role="listbox"
        className={`absolute right-0 top-[calc(100%+8px)] min-w-[170px] bg-white border border-brand-ink/10 shadow-[0_18px_40px_-20px_rgba(20,20,20,0.25)] origin-top-right transition-all duration-300 ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {languages.map((lang) => {
          const active = lang.code === currentLanguage;
          return (
            <button
              key={lang.code}
              role="option"
              aria-selected={active}
              onClick={() => { changeLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${
                active
                  ? "bg-brand-beige/60 text-brand-action"
                  : "text-brand-ink hover:bg-brand-beige/40 hover:text-brand-action"
              }`}
            >
              <span className="text-lg leading-none">{lang.flag}</span>
              <span className="flex-1 font-montserrat text-[0.72rem] font-semibold tracking-wide">
                {lang.name}
              </span>
              <span className={`font-montserrat text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${active ? "text-brand-action" : "text-brand-ink/30"}`}>
                {lang.code}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = ({ open, onClose, navLinks, riads, t, currentLanguage, changeLanguage }) => {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tl = gsap.timeline();
    if (overlayRef.current) {
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0);
    }
    if (panelRef.current) {
      tl.fromTo(
        panelRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.5, ease: "power3.out" },
        0
      );
      tl.fromTo(
        panelRef.current.querySelectorAll("[data-sidebar-item]"),
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" },
        0.2
      );
    }
    return () => {
      document.body.style.overflow = prev;
      tl.kill();
    };
  }, [open]);

  useEffect(() => {
    if (!open) setOpenDropdown(null);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div ref={overlayRef} onClick={onClose} className="absolute inset-0 bg-brand-ink/70 backdrop-blur-sm" aria-hidden />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-brand-ink/5">
          <Link to="/" onClick={onClose}>
            <OptimizedImage
              src="/images/CR%20svg%20brown.svg"
              alt="Centrale des Riads"
              className="h-12 md:h-16 w-auto max-w-[72vw] object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center text-brand-ink/40 hover:text-brand-action transition-colors rounded-full hover:bg-brand-ink/5"
            aria-label={t("close") || "Close"}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          <ul className="space-y-1">
            {navLinks.map((link, i) => (
              <li key={link.labelKey} data-sidebar-item>
                {link.dropdown && link.dropdown.length > 0 ? (
                  <div>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === link.labelKey ? null : link.labelKey)}
                      className="w-full flex items-center justify-between py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.2em] text-brand-ink hover:text-brand-action transition-colors duration-200"
                    >
                      <span>{t(link.labelKey)}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          openDropdown === link.labelKey ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openDropdown === link.labelKey ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-4 pb-2 space-y-0.5 border-l-2 border-brand-beige ml-2">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={onClose}
                            className="block py-2.5 pl-3 font-montserrat text-xs text-brand-ink/60 hover:text-brand-action hover:bg-brand-beige/50 transition-all duration-200 rounded-sm"
                          >
                            {item.label || t(item.labelKey)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <RouterNavLink
                    to={link.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                        isActive ? "text-brand-action" : "text-brand-ink hover:text-brand-action"
                      }`
                    }
                  >
                    {t(link.labelKey)}
                  </RouterNavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

const Header = ({ date, onDateChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStickyMenuOpen, setIsStickyMenuOpen] = useState(false);
  const [isBookingWidgetOpen, setIsBookingWidgetOpen] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [riads, setRiads] = useState([]);

  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { toast } = useToast();
  const scrollData = useScroll();
  const location = useLocation();

  const fullHeaderRef = useRef(null);
  const stickyHeaderRef = useRef(null);

  const isHomePage = location.pathname === "/";
  const showStickyHeader = isHomePage
    ? scrollData.y > window.innerHeight * 0.6
    : scrollData.y > 100;
  const showFullHeader = !showStickyHeader;

  useEffect(() => {
    if (fullHeaderRef.current) {
      if (showFullHeader) {
        fullHeaderRef.current.style.display = "block";
        gsap.to(fullHeaderRef.current, { y: 0, duration: 0.25, ease: "power2.out" });
      } else {
        gsap.to(fullHeaderRef.current, {
          y: "-100%",
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            if (fullHeaderRef.current) fullHeaderRef.current.style.display = "none";
          },
        });
      }
    }
  }, [showFullHeader]);

  useEffect(() => {
    if (stickyHeaderRef.current) {
      if (showStickyHeader) {
        stickyHeaderRef.current.style.display = "block";
        gsap.to(stickyHeaderRef.current, { y: 0, duration: 0.25, ease: "power2.out" });
      } else {
        gsap.to(stickyHeaderRef.current, {
          y: "-100%",
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            if (stickyHeaderRef.current) stickyHeaderRef.current.style.display = "none";
          },
        });
      }
    }
  }, [showStickyHeader]);

  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const [exps, dests] = await Promise.all([
          listExperiences(),
          listDestinations(),
        ]);
        setExperiences(
          (exps || []).map(exp => ({
            label: getTranslated(exp.title_tr, currentLanguage),
            href: `/experiences/${exp.slug}`,
          }))
        );
        setDestinations(
          (dests || []).map(d => ({
            label: getTranslated(d.name_tr ?? d.name, currentLanguage),
            href: `/destinations/${d.slug}`,
          }))
        );
      } catch (error) {
        console.error("Error fetching nav data:", error);
      }
    };
    fetchNavData();
  }, [currentLanguage]);

  const { data: hotelsData } = usePartnerHotels();

  useEffect(() => {
    const processHotels = async () => {
      if (!hotelsData) return;
      try {
        const [citiesArr, neighborhoodsArr] = await Promise.all([
          fetchCatalog("mgh_cities", currentLanguage),
          fetchCatalog("mgh_neighborhoods", currentLanguage),
        ]);
        const citiesMap = Object.fromEntries(citiesArr.map(c => [c.id, c.label]));
        const neighborhoodsMap = Object.fromEntries(neighborhoodsArr.map(n => [n.id, n.label]));

        setRiads(
          hotelsData.map(riad => ({
            id: extractCentraHotelId(riad.image_urls) || riad.id,
            organizationId: extractCentraOrganizationId(riad.image_urls),
            name: getTranslated(riad.name, currentLanguage),
            name_tr: riad.name,
            city: citiesMap[riad.city_id] || "",
            quartier: neighborhoodsMap[riad.neighborhood_id] || "",
            image_urls: Array.isArray(riad.image_urls) ? riad.image_urls : [],
          }))
        );
      } catch (error) {
        console.error("Error processing riads:", error.message || error);
        setRiads([]);
      }
    };
    processHotels();
  }, [hotelsData, currentLanguage]);

  useEffect(() => {
    const handleEsc = e => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setIsStickyMenuOpen(false);
        setIsBookingWidgetOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setIsStickyMenuOpen(false);
    setIsBookingWidgetOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { labelKey: "home", href: "/" },
    { labelKey: "allProperties", href: "/all-riads" },
    { labelKey: "experiences", dropdown: experiences },
    { labelKey: "destinations", dropdown: destinations },
    { labelKey: "about", href: "/about" },
  ];

  const openSidebar = () => setSidebarOpen(true);

  return (
    <>
      <header
        ref={fullHeaderRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-ink/5"
        style={{ transform: "translateY(0%)" }}
      >
        <div className="content-wrapper flex items-center justify-between py-1 md:py-1">
          <Link to="/" className="flex-shrink-0">
            <OptimizedImage
              src="/images/CR%20svg%20brown.svg"
              alt="Centrale des Riads"
              className="h-12 md:h-16 lg:h-20 w-auto max-w-[62vw] md:max-w-none object-contain"
            />
          </Link>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden md:block">
              <LanguageSelector
                currentLanguage={currentLanguage}
                changeLanguage={changeLanguage}
              />
            </div>

            <Link
              to="/about"
              className="hidden md:inline-block uppercase font-medium text-xs tracking-widest text-brand-ink hover:text-brand-action transition-colors duration-200"
            >
              {t("aboutPageTitle") || "Qui sommes-nous ?"}
            </Link>

            <button
              onClick={openSidebar}
              className="relative w-10 h-10 flex items-center justify-center text-brand-ink hover:text-brand-action transition-all duration-200 group"
              aria-label="Menu"
            >
              <div className="flex flex-col gap-[5px] items-center justify-center">
                <span className="block w-5 h-[2px] bg-current transition-all duration-300 group-hover:w-6" />
                <span className="block w-5 h-[2px] bg-current" />
                <span className="block w-5 h-[2px] bg-current transition-all duration-300 group-hover:w-3 ml-auto" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={stickyHeaderRef}
        className="fixed top-0 left-0 right-0 z-50 bg-brand-action shadow-sm"
        style={{ display: "none", transform: "translateY(-100%)" }}
      >
        <div className="content-wrapper flex items-center justify-between py-2 gap-3">
          <button
            onClick={openSidebar}
            className="flex items-center gap-2 h-11 px-4 border border-white/25 text-white hover:border-white/50 hover:text-white/90 transition-colors bg-transparent"
          >
            <div className="flex flex-col gap-[4px]">
              <span className="block w-4 h-[2px] bg-current" />
              <span className="block w-4 h-[2px] bg-current" />
              <span className="block w-3 h-[2px] bg-current" />
            </div>
            <span className="uppercase text-xs font-semibold tracking-widest">{t("menu") || "Menu"}</span>
          </button>

          <div className="flex-grow hidden md:block">
            <BookingStrip date={date} onDateChange={onDateChange} isSticky />
          </div>

          <div className="flex-grow md:hidden">
            <button
              onClick={() => setIsBookingWidgetOpen(true)}
              className="w-full h-11 text-left px-4 border border-white/25 bg-transparent text-white flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">{t("searchDates") || "Rechercher"}</span>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden border-t border-white/15 overflow-hidden transition-all duration-250 ease-in-out ${
            isBookingWidgetOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4">
            <BookingStrip date={date} onDateChange={onDateChange} isMobile onSearch={() => setIsBookingWidgetOpen(false)} />
          </div>
        </div>
      </div>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navLinks={navLinks}
        riads={riads}
        t={t}
        currentLanguage={currentLanguage}
        changeLanguage={changeLanguage}
      />
    </>
  );
};

export default Header;
