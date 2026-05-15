import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const TrustBar = () => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  const trustItems = [
    { icon: Shield, label: t('licensed') },
    { icon: CheckCircle, label: t('inspected') },
    { icon: CreditCard, label: t('localTaxes') },
    { icon: Lock, label: t('safe') }
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.trust-item', {
        y: 16, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white border-t border-brand-ink/5">
      <div className="content-wrapper py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="trust-item flex items-center justify-center space-x-2.5"
            >
              <item.icon className="w-4 h-4 text-brand-action" />
              <span className="font-medium text-brand-ink text-xs tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
