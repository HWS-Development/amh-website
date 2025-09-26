import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import BookingStrip from '@/components/BookingStrip';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import SearchButton from './ui/SearchButton';
import i18n from '@/i18n';

const useScroll = () => {
  const [scrollData, setScrollData] = useState({
    y: 0,
    lastY: 0
  });
  useEffect(() => {
    const handleScroll = () => {
      setScrollData(prev => ({
        y: window.scrollY,
        lastY: prev.y
      }));
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollData;
};
const Header = ({
  date,
  onDateChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isStickyMenuOpen, setIsStickyMenuOpen] = useState(false);
  const [isBookingWidgetOpen, setIsBookingWidgetOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [riads, setRiads] = useState([]);
  const {
    currentLanguage,
    changeLanguage,
    t
  } = useLanguage();
  const {
    toast
  } = useToast();
  const dropdownTimeoutRef = useRef(null);
  const scrollData = useScroll();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const showStickyHeader = isHomePage ? scrollData.y > window.innerHeight * 0.8 : scrollData.y > 100;
  const showFullHeader = !showStickyHeader;
  useEffect(() => {
    const fetchNavData = async () => {
      const fetchExperiences = supabase.from('mgh_experiences').select('title_tr, slug').order('sort_order');
      const [experiencesRes] = await Promise.all([fetchExperiences]);
      if (experiencesRes.error) {
        console.error("Error fetching experiences:", experiencesRes.error);
      } else {
        setExperiences(experiencesRes.data.map(exp => ({
          label: getTranslated(exp.title_tr, currentLanguage),
          href: `/experiences/${exp.slug}`
        })));
      }
    };
    fetchNavData();
  }, [currentLanguage]);
  const languages = [{
    code: 'fr',
    name: 'Français'
  }, {
    code: 'en',
    name: 'English'
  }, {
    code: 'es',
    name: 'Español'
  }];
  const destinations = [{
    labelKey: 'marrakech',
    href: '/destinations/marrakech'
  }, {
    labelKey: 'essaouira',
    href: '/destinations/essaouira'
  }, {
    labelKey: 'ouarzazate',
    href: '/destinations/ouarzazate'
  }];
  const navLinks = [{
    labelKey: 'home',
    href: '/'
  }, {
    labelKey: 'allProperties',
    href: '/all-riads'
  }, {
    labelKey: 'experiences',
    dropdown: experiences
  }, {
    labelKey: 'destinations',
    dropdown: destinations
  }, {
    labelKey: 'about',
    href: '#'
  }];
  const handleMouseEnter = labelKey => {
    clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(labelKey);
  };
  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };
  useEffect(() => {
    const handleEsc = event => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsLanguageOpen(false);
        setIsMenuOpen(false);
        setIsStickyMenuOpen(false);
        setIsBookingWidgetOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    fetchRiads();
    return () => {
      window.removeEventListener('keydown', handleEsc);
      clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);
      const fetchRiads = async () => {
        console.log('heyyyyyyyyyy');
        
        const { data, error } = await supabase
          .from('mgh_properties')
          .select(`
            id,
            name,
            name_tr,
            city,
            area,
            area_tr,
            quartier,
            google_reviews_count,
            image_urls,
            amenities,
            sblink,
            property_type
          `);
  
        if (error) {
          console.error('Error fetching riads:', error);
          // toast({
          //   variant: 'destructive',
          //   title: 'Error',
          //   description: 'Could not fetch the list of riads.',
          // });
          setRiads([]);
        } else {
          const formattedRiads = data.map((riad) => ({
            id: riad.id,
            name: getTranslated(riad.name_tr, currentLanguage) || riad.name,
            area: getTranslated(riad.area_tr, currentLanguage) || riad.area,
            city: riad.city,
            quartier: riad.quartier,
            imageUrl: riad.image_urls && riad.image_urls.length > 0 ? riad.image_urls[0] : 'https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png',
            amenities: riad.amenities || [],
            google_reviews_count: riad.google_reviews_count,
            sblink: riad.sblink,
            property_type: riad.property_type,
          }));
          setRiads(data);
        }
      };
  
      
  const handleFeatureClick = (e, href) => {
    e.preventDefault();
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
    setIsMenuOpen(false);
    setIsStickyMenuOpen(false);
  };
  const NavItem = ({
    to,
    children,
    ...props
  }) => <RouterNavLink to={to} className={({
    isActive
  }) => `uppercase font-medium text-sm text-brand-ink hover:text-brand-action transition-colors duration-200 ${isActive ? 'text-brand-action' : ''}`} {...props}>
      {children}
    </RouterNavLink>;
  const DropdownNav = ({
    link
  }) => <div className="relative" onMouseEnter={() => handleMouseEnter(link.labelKey)} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center">
        {link.href ? <NavItem to={link.href}>{t(link.labelKey)}</NavItem> : <span className="uppercase font-medium text-sm text-brand-ink cursor-pointer">{t(link.labelKey)}</span>}
        <button className="p-1 -ml-1 text-brand-ink hover:text-brand-action flex items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-action rounded-sm" onFocus={() => handleMouseEnter(link.labelKey)} onBlur={handleMouseLeave}>
          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === link.labelKey ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <AnimatePresence>
      {openDropdown === link.labelKey && <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -10
      }} transition={{
        duration: 0.2
      }} className="absolute left-0 top-full mt-2 bg-white rounded-md shadow-lg border border-brand-ink/10 py-1 w-56 z-20">
            {link.dropdown.map(item => <Link key={item.href} to={item.href} className="block w-full px-4 py-2 text-left text-sm text-brand-ink hover:bg-brand-ink/5 hover:text-brand-action focus:bg-brand-ink/10 focus:text-brand-action focus:outline-none" onClick={() => setOpenDropdown(null)}>
                  {item.label || t(item.labelKey)}
               </Link>)}
         </motion.div>}
      </AnimatePresence>
    </div>;
  const headerVariants = {
    hidden: {
      y: '-100%'
    },
    visible: {
      y: 0
    }
  };
  return <>
      <AnimatePresence>
        {showFullHeader && <motion.header key="full-header" initial="hidden" animate="visible" exit="hidden" variants={headerVariants} transition={{
        duration: 0.25
      }} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-ink/10">
            <div className="content-wrapper flex items-center justify-between h-20">
                <Link to="/" className="flex items-center space-x-2">
                  <img alt="MGH Riad logo" className="h-10 md:h-12 w-auto" src="/images/slazzer-preview-v541a.png" />
                </Link>
                <nav className="hidden lg:flex items-center space-x-8">
                  {navLinks.map(link => link.dropdown && link.dropdown.length > 0 ? <DropdownNav key={link.labelKey} link={link} /> : link.href === '#' ? <button key={link.labelKey} onClick={e => handleFeatureClick(e, link.href)} className="uppercase font-medium text-sm text-brand-ink hover:text-brand-action transition-colors duration-200">{t(link.labelKey)}</button> : <NavItem key={link.labelKey} to={link.href}>{t(link.labelKey)}</NavItem>)}
                </nav>

                <div className="flex items-center gap-4">
                <SearchButton riads={riads} locale={i18n.language} />
                  <div className="relative hidden md:block">
                    <Button variant="ghost" size="icon" onClick={() => setIsLanguageOpen(!isLanguageOpen)} className="text-brand-ink/80 hover:bg-brand-ink/5 hover:text-brand-ink">
                      <Globe className="w-5 h-5" />
                    </Button>
                    
                    <AnimatePresence>
                    {isLanguageOpen && <motion.div initial={{
                  opacity: 0,
                  y: -10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} transition={{
                  duration: 0.2
                }} className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-lg border border-brand-ink/10 py-1 min-w-[120px]" onMouseLeave={() => setIsLanguageOpen(false)}>
                        {languages.map(lang => <button key={lang.code} onClick={() => {
                    changeLanguage(lang.code);
                    setIsLanguageOpen(false);
                  }} className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 ${currentLanguage === lang.code ? 'font-semibold text-brand-action' : 'text-brand-ink hover:bg-brand-ink/5'}`}>
                            <span>{lang.name}</span>
                          </button>)}
                      </motion.div>}
                    </AnimatePresence>
                  </div>

                  <Button variant="ghost" size="icon" className="lg:hidden text-brand-ink/80 hover:bg-brand-ink/5 h-12 w-12" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </Button>
                </div>
            </div>

            <AnimatePresence>
            {isMenuOpen && <motion.nav initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.3,
            ease: "easeInOut"
          }} className="lg:hidden bg-white border-t border-brand-ink/10 overflow-hidden">
                <div className="flex flex-col items-start p-4 space-y-2">
                  {navLinks.map(link => <Link key={link.labelKey} to={link.dropdown ? '#' : link.href} onClick={e => {
                if (link.href === '#') handleFeatureClick(e, link.href);
                if (link.dropdown) e.preventDefault();
                setIsMenuOpen(false);
              }} className="w-full text-left px-3 py-3 text-brand-ink uppercase text-sm font-medium rounded-md hover:bg-brand-ink/5">
                      {t(link.labelKey)}
                    </Link>)}
                </div>
              </motion.nav>}
            </AnimatePresence>
          </motion.header>}
      </AnimatePresence>

      <AnimatePresence>
        {showStickyHeader && <motion.div key="sticky-header" initial="hidden" animate="visible" exit="hidden" variants={headerVariants} transition={{
        duration: 0.25
      }} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <div className="content-wrapper flex items-center justify-between h-auto py-2">
              <div className="flex-none mr-2">
                <Button onClick={() => setIsStickyMenuOpen(!isStickyMenuOpen)} className="w-full h-14 px-7 text-left justify-start border-brand-ink/20">
                  <span>{t('menu')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isStickyMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              <div className="flex-grow hidden md:block">
                <BookingStrip date={date} onDateChange={onDateChange} isSticky={true} />
              </div>
              <div className="flex-grow md:hidden">
                <Button variant="outline" onClick={() => setIsBookingWidgetOpen(true)} className="w-full h-12 text-left justify-start border-brand-ink/20">
                  <Search className="w-4 h-4 mr-2 text-brand-ink/80" />
                  <span className="text-brand-ink/80">{t('searchDates')}</span>
                </Button>
              </div>
            </div>
            
            <AnimatePresence>
              {isStickyMenuOpen && <motion.nav initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.25,
            ease: "easeInOut"
          }} className="overflow- border-t border-brand-ink/10">
                  <div className="content-wrapper py-4 flex flex-col md:flex-row md:items-end items-center justify-center gap-10 space-y-2 z-10">
                    {/* {navLinks.map(link => <Link key={link.labelKey} to={link.dropdown ? '#' : link.href} onClick={e => {
                if (link.href === '#') handleFeatureClick(e, link.href);
                if (link.dropdown) e.preventDefault();
                setIsStickyMenuOpen(false);
              }} className="w-full text-center py-3 text-brand-ink uppercase text-sm font-medium rounded-sm hover:bg-brand-ink/5">
                        {t(link.labelKey)} 
                      </Link>)} */}
                      {navLinks.map(link => link.dropdown && link.dropdown.length > 0 ? <DropdownNav key={link.labelKey} link={link} /> : link.href === '#' ? <button key={link.labelKey} onClick={e => handleFeatureClick(e, link.href)} className="uppercase font-medium text-sm text-brand-ink hover:text-brand-action transition-colors duration-200">{t(link.labelKey)}</button> : <NavItem key={link.labelKey} to={link.href}>{t(link.labelKey)}</NavItem>)}
                  </div>
                </motion.nav>}
            </AnimatePresence>
            <AnimatePresence>
              {isBookingWidgetOpen && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="md:hidden border-t border-brand-ink/10">
                  <div className="p-4">
                    <BookingStrip date={date} onDateChange={onDateChange} isMobile={true} onSearch={() => setIsBookingWidgetOpen(false)} />
                  </div>
                </motion.div>}
            </AnimatePresence>
          </motion.div>}
      </AnimatePresence>
    </>;
};
export default Header;