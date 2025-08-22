
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-ink text-white py-12 md:py-20">
      <div className="content-wrapper">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16 lg:gap-24 mb-12">
          {/* About Us */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-brand-action">
              {t('aboutUs')}
            </h3>
            <p className="text-sm text-white">
              {t('footerAboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-brand-action">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-white hover:text-brand-action transition-colors">{t('home')}</Link></li>
              <li><Link to="/all-riads" className="text-sm text-white hover:text-brand-action transition-colors">{t('allRiads')}</Link></li>
              <li><Link to="/collections" className="text-sm text-white hover:text-brand-action transition-colors">{t('collections')}</Link></li>
              <li><Link to="/about" className="text-sm text-white hover:text-brand-action transition-colors">{t('about')}</Link></li>
              <li><Link to="/contact" className="text-sm text-white hover:text-brand-action transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-brand-action">
              {t('contactUs')}
            </h3>
            <address className="not-italic space-y-3 text-sm text-white">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-white flex-shrink-0" />
                <span>{t('footerAddress')}</span>
              </div>
              <a href="mailto:contact@riads-marrakech.com" className="flex items-center hover:text-brand-action transition-colors">
                <Mail className="w-5 h-5 mr-3 text-white" />
                <span>contact@riads-marrakech.com</span>
              </a>
              <a href="tel:+212 524 385 241" className="flex items-center hover:text-brand-action transition-colors">
                <Phone className="w-5 h-5 mr-3 text-white" />
                <span>+212 524 385 241</span>
              </a>
            </address>
          </div>

          {/* Social Media */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-brand-action">
              {t('followUs')}
            </h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-brand-action transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-brand-action transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white hover:text-brand-action transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white hover:text-brand-action transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and Trademarks */}
        <div className="border-t border-brand-ink/20 pt-8 text-center">
          <p className="text-xs text-white/50 mb-2">
            © {currentYear} Association Maisons d'Hôtes de Marrakech. {t('allRightsReserved')}
          </p>
          <p className="text-xs text-white/50">
            {t('registeredTrademark')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
