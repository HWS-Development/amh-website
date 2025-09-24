import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TrustBar = () => {
  const { t } = useLanguage();

  const trustItems = [
    { icon: Shield, label: t('licensed') },
    { icon: CheckCircle, label: t('inspected') },
    { icon: CreditCard, label: t('localTaxes') },
    { icon: Lock, label: t('safe') }
  ];

  return (
    <section className="bg-brand-ink/5">
      <div className="content-wrapper py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-3"
            >
              <item.icon className="w-5 h-5 text-brand-ink" />
              <span className="font-medium text-brand-ink text-sm text-center">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;