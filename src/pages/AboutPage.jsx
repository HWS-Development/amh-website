import React, { useRef, useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Shield, Heart, Globe, Home, Users, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const { t } = useLanguage();
  const pageRef = useRef(null);

  const cards = [
    {
      icon: CheckCircle,
      title: t('aboutCard1Title'),
      type: 'bullets',
      intro: t('aboutCard1Intro'),
      bullets: [
        t('aboutCard1Bullet1'),
        t('aboutCard1Bullet2'),
        t('aboutCard1Bullet3'),
        t('aboutCard1Bullet4'),
        t('aboutCard1Bullet5'),
      ],
      footer: t('aboutCard1Footer'),
    },
    { icon: Shield, title: t('aboutCard2Title'), text: t('aboutCard2Text') },
    { icon: Globe, title: t('aboutCard3Title'), text: t('aboutCard3Text') },
    { icon: Heart, title: t('aboutCard4Title'), text: t('aboutCard4Text') },
    { icon: Home, title: t('aboutCard5Title'), text: t('aboutCard5Text') },
    { icon: Users, title: t('aboutCard6Title'), text: t('aboutCard6Text') },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.about-hero-title', { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out' });
      gsap.from('.about-hero-line', { scaleX: 0, duration: 0.6, delay: 0.4, ease: 'power2.out', transformOrigin: 'center' });

      // Scroll-reveal sections
      ['.about-intro', '.about-s1', '.about-s2', '.about-s3'].forEach(sel => {
        gsap.from(`${sel} .about-reveal`, {
          y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: sel, start: 'top 80%', once: true },
        });
      });

      // Banner
      gsap.from('.about-banner-text', {
        opacity: 0, scale: 0.96, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-banner', start: 'top 80%', once: true },
      });

      // Cards grid
      gsap.from('.about-card', {
        y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-cards-grid', start: 'top 80%', once: true },
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <Helmet>
        <title>{t('aboutPageTitle')} | LA CENTRALE DES RIADS</title>
        <meta name="description" content={t('aboutMetaDesc')} />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-brand-action overflow-hidden min-h-[45vh] flex items-center justify-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative flex flex-col items-center justify-center text-center w-full pt-36 pb-28 md:pt-44 md:pb-36">
          <h1 className="about-hero-title text-center text-[1.55rem] md:text-[1.9rem] lg:text-[2.4rem] font-bold text-white font-montserrat tracking-[0.1em] uppercase">
            {t('aboutPageTitle')}
          </h1>
          <div className="about-hero-line h-[2px] w-20 bg-white/40 mx-auto mt-6" />
        </div>
      </section>

      {/* Intro */}
      <section className="about-intro bg-brand-beige py-20 md:py-28">
        <div className="content-wrapper max-w-3xl mx-auto space-y-7">
          <p className="about-reveal text-base md:text-lg leading-[1.85] text-brand-ink font-montserrat" dangerouslySetInnerHTML={{ __html: t('aboutIntro1') }} />
          <p className="about-reveal text-base md:text-lg leading-[1.85] text-brand-ink font-montserrat" dangerouslySetInnerHTML={{ __html: t('aboutIntro2') }} />
        </div>
      </section>

      {/* Section 1 */}
      <section className="about-s1 bg-white py-20 md:py-28">
        <div className="content-wrapper max-w-3xl mx-auto space-y-6">
          <div className="about-reveal flex items-center gap-4 mb-2">
            <div className="w-10 h-[2px] bg-brand-action" />
            <h2 className="text-xl md:text-2xl font-bold text-brand-ink font-montserrat tracking-wide">
              {t('aboutSection1Title')}
            </h2>
          </div>
          <p className="about-reveal text-sm md:text-base leading-[1.85] text-brand-ink/70 font-montserrat pl-14">
            {t('aboutSection1Text')}
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="about-s2 bg-brand-beige py-20 md:py-28">
        <div className="content-wrapper max-w-3xl mx-auto space-y-6">
          <div className="about-reveal flex items-center gap-4 mb-2">
            <div className="w-10 h-[2px] bg-brand-action" />
            <h2 className="text-xl md:text-2xl font-bold text-brand-ink font-montserrat tracking-wide">
              {t('aboutSection2Title')}
            </h2>
          </div>
          <p className="about-reveal text-sm md:text-base leading-[1.85] text-brand-ink/70 font-montserrat pl-14">
            {t('aboutSection2Text1')}
          </p>
          <p className="about-reveal text-sm md:text-base leading-[1.85] text-brand-ink/80 font-montserrat font-semibold pl-14">
            {t('aboutSection2Text2')}
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="about-s3 bg-white py-20 md:py-28">
        <div className="content-wrapper max-w-3xl mx-auto space-y-6">
          <div className="about-reveal flex items-center gap-4 mb-2">
            <div className="w-10 h-[2px] bg-brand-action" />
            <h2 className="text-xl md:text-2xl font-bold text-brand-ink font-montserrat tracking-wide">
              {t('aboutSection3Title')}
            </h2>
          </div>
          <p className="about-reveal text-sm md:text-base leading-[1.85] text-brand-ink/70 font-montserrat pl-14">
            {t('aboutSection3Text')}
          </p>
        </div>
      </section>

      {/* Banner */}
      <section className="about-banner relative bg-brand-action py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative content-wrapper text-center">
          <p className="about-banner-text text-lg md:text-xl lg:text-2xl font-bold text-white font-montserrat tracking-wider uppercase">
            {t('aboutBanner')}
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="bg-brand-beige py-20 md:py-28">
        <div className="content-wrapper">
          <div className="about-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="about-card bg-white p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-brand-ink/[0.03]"
                  onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -4, duration: 0.25, ease: 'power2.out' })}
                  onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.25, ease: 'power2.out' })}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-action/15 to-brand-action/5 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-brand-action" />
                  </div>
                  <h3 className="text-[15px] font-bold text-brand-ink font-montserrat mb-3 tracking-wide">
                    {card.title}
                  </h3>

                  {card.type === 'bullets' ? (
                    <>
                      <p className="text-xs text-brand-ink/55 font-montserrat mb-3">
                        {card.intro}
                      </p>
                      <ul className="space-y-2 mb-4">
                        {card.bullets.map((bullet, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-xs text-brand-ink/65 font-montserrat leading-relaxed">
                            <Check className="w-3.5 h-3.5 text-brand-action mt-0.5 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-brand-ink/70 font-montserrat font-medium italic border-t border-brand-ink/5 pt-3">
                        {card.footer}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs leading-[1.85] text-brand-ink/60 font-montserrat">
                      {card.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
