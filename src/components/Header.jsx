import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import BookingStrip from '@/components/BookingStrip';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { fetchCatalog } from '@/lib/catalogs';
import { usePartnerHotels } from '@/lib/partnerHotelsApi';
import SearchButton from './ui/SearchButton';
import i18n from '@/i18n';
import OptimizedImage from '@/components/ui/OptimizedImage';
import gsap from 'gsap';

const useScroll = () => {
  const [scrollData, setScrollData] = useState({ y: 0, lastY: 0 });
  useEffect(() => {
    const handleScroll = () => {
      setScrollData(prev => ({ y: window.scrollY, lastY: prev.y }));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollData;
};

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

const destinations = [
  { labelKey: 'marrakech', href: '/destinations/marrakech' },
  { labelKey: 'essaouira', href: '/destinations/essaouira' },
  { labelKey: 'ouarzazate', href: '/destinations/ouarzazate' },
];

const Header = ({ date, onDateChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isStickyMenuOpen, setIsStickyMenuOpen] = useState(false);
  const [isBookingWidgetOpen, setIsBookingWidgetOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [riads, setRiads] = useState([]);

  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { toast } = useToast();
  const dropdownTimeoutRef = useRef(null);
  const langRef = useRef(null);
  const scrollData = useScroll();
  const location = useLocation();

  const fullHeaderRef = useRef(null);
  const stickyHeaderRef = useRef(null);

  const isHomePage = location.pathname === '/';
  const showStickyHeader = isHomePage
    ? scrollData.y > window.innerHeight * 0.6
    : scrollData.y > 100;
  const showFullHeader = !showStickyHeader;

  // Animate headers on visibility change
  useEffect(() => {
    if (fullHeaderRef.current) {
      if (showFullHeader) {
        fullHeaderRef.current.style.display = 'block';
        gsap.to(fullHeaderRef.current, { y: 0, duration: 0.25, ease: 'power2.out' });
      } else {
        gsap.to(fullHeaderRef.current, { y: '-100%', duration: 0.25, ease: 'power2.in', onComplete: () => {
          if (fullHeaderRef.current) fullHeaderRef.current.style.display = 'none';
        }});
      }
    }
  }, [showFullHeader]);

  useEffect(() => {
    if (stickyHeaderRef.current) {
      if (showStickyHeader) {
        stickyHeaderRef.current.style.display = 'block';
        gsap.to(stickyHeaderRef.current, { y: 0, duration: 0.25, ease: 'power2.out' });
      } else {
        gsap.to(stickyHeaderRef.current, { y: '-100%', duration: 0.25, ease: 'power2.in', onComplete: () => {
          if (stickyHeaderRef.current) stickyHeaderRef.current.style.display = 'none';
        }});
      }
    }
  }, [showStickyHeader]);

  useEffect(() => {
    const fetchNavData = async () => {
      const res = await supabase
        .from('mgh_experiences')
        .select('title_tr, slug')
        .order('sort_order');
      if (res.error) {
        console.error('Error fetching experiences:', res.error);
      } else {
        setExperiences(
          res.data.map(exp => ({
            label: getTranslated(exp.title_tr, currentLanguage),
            href: `/experiences/${exp.slug}`,
          }))
        );
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
          fetchCatalog('mgh_cities', currentLanguage),
          fetchCatalog('mgh_neighborhoods', currentLanguage),
        ]);
        const citiesMap = Object.fromEntries(citiesArr.map(c => [c.id, c.label]));
        const neighborhoodsMap = Object.fromEntries(neighborhoodsArr.map(n => [n.id, n.label]));

        setRiads(
          hotelsData.map(riad => ({
            id: riad.id,
            name: getTranslated(riad.name, currentLanguage),
            name_tr: riad.name,
            city: citiesMap[riad.city_id] || '',
            quartier: neighborhoodsMap[riad.neighborhood_id] || '',
            image_urls: Array.isArray(riad.image_urls) ? riad.image_urls : [],
          }))
        );
      } catch (error) {
        console.error('Error processing riads:', error.message || error);
        setRiads([]);
      }
    };
    processHotels();
  }, [hotelsData, currentLanguage]);

  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setIsLanguageOpen(false);
        setIsMenuOpen(false);
        setIsStickyMenuOpen(false);
        setIsBookingWidgetOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsStickyMenuOpen(false);
    setIsBookingWidgetOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const navLinks = [
    { labelKey: 'home', href: '/' },
    { labelKey: 'allProperties', href: '/all-riads' },
    { labelKey: 'experiences', dropdown: experiences },
    { labelKey: 'destinations', dropdown: destinations },
    { labelKey: 'about', href: '/about' },
  ];

  const handleMouseEnter = key => {
    clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsStickyMenuOpen(false);
    setOpenDropdown(null);
  };

  const NavItem = ({ to, children, onClick, ...props }) => (
    <RouterNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `uppercase font-medium text-xs tracking-widest text-brand-ink hover:text-brand-action transition-colors duration-200 ${isActive ? 'text-brand-action' : ''}`
      }
      {...props}
    >
      {children}
    </RouterNavLink>
  );

  const DropdownNav = ({ link, onNavigate, inline = false }) => (
    <div
      className={inline ? '' : 'relative'}
      onMouseEnter={inline ? undefined : () => handleMouseEnter(link.labelKey)}
      onMouseLeave={inline ? undefined : handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 uppercase font-medium text-xs tracking-widest text-brand-ink hover:text-brand-action transition-colors duration-200"
        onClick={() =>
          setOpenDropdown(openDropdown === link.labelKey ? null : link.labelKey)
        }
      >
        <span>{t(link.labelKey)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === link.labelKey ? 'rotate-180' : ''}`}
        />
      </button>
      {inline ? (
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            openDropdown === link.labelKey ? 'max-h-[300px] opacity-100 mt-1' : 'max-h-0 opacity-0'
          }`}
        >
          {link.dropdown.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className="block pl-4 py-2 text-xs font-medium text-brand-ink hover:bg-brand-beige hover:text-brand-action transition-colors tracking-wide"
              onClick={() => {
                setOpenDropdown(null);
                onNavigate?.();
              }}
            >
              {item.label || t(item.labelKey)}
            </Link>
          ))}
        </div>
      ) : (
        <div
          className={`absolute left-0 top-full mt-2 bg-white shadow-xl border border-brand-ink/5 py-1.5 w-56 z-50 transition-all duration-150 origin-top ${
            openDropdown === link.labelKey ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {link.dropdown.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className="block px-4 py-2.5 text-xs font-medium text-brand-ink hover:bg-brand-beige hover:text-brand-action transition-colors tracking-wide"
              onClick={() => {
                setOpenDropdown(null);
                onNavigate?.();
              }}
            >
              {item.label || t(item.labelKey)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  const LanguageDropdown = ({ className = '' }) => (
    <div className={`relative ${className}`} ref={langRef}>
      <button
        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
        className="flex items-center gap-1.5 uppercase font-medium text-xs tracking-widest text-brand-ink hover:text-brand-action transition-colors duration-200"
      >
        <span>
          {currentLanguage === 'fr' ? 'Langues' : currentLanguage === 'es' ? 'Idiomas' : 'Languages'}
        </span>
      </button>
      <div
        className={`absolute right-0 top-full mt-2 bg-white shadow-xl border border-brand-ink/5 py-1.5 min-w-[140px] z-50 transition-all duration-150 origin-top ${
          isLanguageOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => {
              changeLanguage(lang.code);
              setIsLanguageOpen(false);
            }}
            className={`w-full px-4 py-2.5 text-left text-xs font-medium tracking-wide transition-colors ${
              currentLanguage === lang.code
                ? 'text-brand-action font-semibold bg-brand-beige/50'
                : 'text-brand-ink hover:bg-brand-beige hover:text-brand-action'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* FULL HEADER */}
      <header
        ref={fullHeaderRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-ink/5"
        style={{ transform: 'translateY(0%)' }}
      >
        <div className="content-wrapper flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <OptimizedImage
              src="/images/logo_mgh.svg"
              alt="Centrale des Riads"
              className="h-14 md:h-[5.25rem] lg:h-[6rem] w-auto"
            />
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              to="/about"
              className="hidden md:inline-block uppercase font-medium text-xs tracking-widest text-brand-ink hover:text-brand-action transition-colors duration-200"
            >
              {t('aboutPageTitle') || 'Qui sommes-nous ?'}
            </Link>

            <SearchButton riads={riads} locale={i18n.language} />
            <LanguageDropdown className="hidden md:block" />

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-9 h-9 flex items-center justify-center text-brand-ink hover:text-brand-action transition-colors duration-200"
              aria-label="Menu"
            >
              <span className={`transition-all duration-150 ${isMenuOpen ? 'opacity-0 rotate-90 absolute' : 'opacity-100 rotate-0'}`}>
                <Menu className="w-5 h-5" />
              </span>
              <span className={`transition-all duration-150 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 absolute'}`}>
                <X className="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>

        {/* Hamburger dropdown menu */}
        <div
          className={`bg-white border-t border-brand-ink/5 overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="content-wrapper py-6 flex flex-col space-y-1">
             {navLinks.map(link =>
              link.dropdown && link.dropdown.length > 0 ? (
                <div key={link.labelKey} className="py-2 px-3">
                  <DropdownNav link={link} onNavigate={closeAllMenus} inline />
                </div>
              ) : (
                <NavItem
                  key={link.labelKey}
                  to={link.href}
                  onClick={closeAllMenus}
                >
                  <span className="block px-3 py-3 hover:bg-brand-beige/50 transition-colors">
                    {t(link.labelKey)}
                  </span>
                </NavItem>
              )
            )}

            <div className="px-3 pt-2 md:hidden">
              <SearchButton riads={riads} locale={i18n.language} />
            </div>

            <div className="px-3 pt-2 md:hidden">
              <LanguageDropdown />
            </div>
          </nav>
        </div>
      </header>

      {/* STICKY HEADER */}
      <div
        ref={stickyHeaderRef}
        className="fixed top-0 left-0 right-0 z-50 bg-[#BF673E] shadow-sm"
        style={{ display: 'none', transform: 'translateY(-100%)' }}
      >
        <div className="content-wrapper flex items-center justify-between py-2 gap-3">
          {/* Menu button */}
          <div className="flex-none">
            <Button
              onClick={() => setIsStickyMenuOpen(!isStickyMenuOpen)}
              variant="outline"
              className="h-11 px-4 gap-2 border-white/25 text-white hover:border-white/50 hover:text-white/90 transition-colors bg-transparent"
            >
              <Menu className="w-4 h-4" />
              <span className="uppercase text-xs font-medium tracking-widest">
                {t('menu') || 'Menu'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isStickyMenuOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          {/* Booking strip — desktop */}
          <div className="flex-grow hidden md:block">
            <BookingStrip date={date} onDateChange={onDateChange} isSticky={true} />
          </div>

          {/* Booking trigger — mobile */}
          <div className="flex-grow md:hidden">
            <Button
              variant="outline"
              onClick={() => setIsBookingWidgetOpen(true)}
              className="w-full h-11 text-left justify-start border-white/25 bg-transparent text-white"
            >
              <Search className="w-4 h-4 mr-2 text-white/70" />
              <span className="text-white/70 text-xs">{t('searchDates') || 'Rechercher des dates'}</span>
            </Button>
          </div>
        </div>

        {/* Sticky menu dropdown */}
        <div
          className={`overflow-hidden border-t border-brand-ink/5 bg-white transition-all duration-250 ease-in-out ${
            isStickyMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="content-wrapper py-5 flex flex-col md:flex-row md:items-center md:justify-center gap-6 md:gap-10">
            {navLinks.map(link =>
              link.dropdown && link.dropdown.length > 0 ? (
                <DropdownNav
                  key={link.labelKey}
                  link={link}
                  onNavigate={closeAllMenus}
                  inline
                />
              ) : (
                <NavItem
                  key={link.labelKey}
                  to={link.href}
                  onClick={closeAllMenus}
                >
                  {t(link.labelKey)}
                </NavItem>
              )
            )}
            <SearchButton riads={riads} locale={i18n.language} />
            <LanguageDropdown />
          </nav>
        </div>

        {/* Mobile booking widget */}
        <div
          className={`md:hidden border-t border-brand-ink/5 overflow-hidden transition-all duration-250 ease-in-out ${
            isBookingWidgetOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4">
            <BookingStrip
              date={date}
              onDateChange={onDateChange}
              isMobile={true}
              onSearch={() => setIsBookingWidgetOpen(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
