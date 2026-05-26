import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { gsapEase, duration, stagger } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const TrustBar = () => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  const trustItems = [
    { icon: Shield, label: t('licensed') },
    { icon: CheckCircle, label: t('inspected') },
    { icon: CreditCard, label: t('localTaxes') },
    { icon: Lock, label: t('safe') },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.trust-item', {
        y: 14,
        opacity: 0,
        duration: duration.base,
        stagger: stagger.tight,
        ease: gsapEase.editorial,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 92%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-brand-beige/50 border-t border-brand-ink/5"
    >
      <div className="content-wrapper py-7 md:py-9">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="trust-item group flex items-center justify-center gap-3"
              >
                <span className="grid place-items-center w-8 h-8 rounded-full border border-brand-action/30 bg-white text-brand-action transition-colors duration-500 ease-editorial group-hover:bg-brand-action group-hover:text-white">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="font-montserrat font-semibold text-brand-ink text-[0.68rem] uppercase tracking-[0.22em]">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
