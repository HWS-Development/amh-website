import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-beige text-brand-ink py-4">
      <div className="content-wrapper">
        {/* Main row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Quick Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-montserrat">
            <Link to="/" className="hover:text-brand-action transition-colors">{t('home')}</Link>
            <Link to="/all-riads" className="hover:text-brand-action transition-colors">{t('allRiads')}</Link>
            <Link to="/about" className="hover:text-brand-action transition-colors">{t('about')}</Link>
            <Link to="/contact" className="hover:text-brand-action transition-colors">{t('contact')}</Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-brand-ink/60 hover:text-brand-action transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-brand-ink/60 hover:text-brand-action transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-brand-ink/60 hover:text-brand-action transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-brand-ink/60 hover:text-brand-action transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-brand-ink/10 text-center">
          <p className="text-xs text-brand-ink/50 font-montserrat">
            © 2026 Association Maisons d'Hôtes de Marrakech. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
