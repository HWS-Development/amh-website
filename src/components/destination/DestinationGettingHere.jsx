import { useLanguage } from '@/contexts/LanguageContext';
import { Plane, Train, Bus, Car, Star } from 'lucide-react';

const iconMap = {
  plane: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  default: Star,
};

const DestinationGettingHere = ({ gettingHere, sectionRef }) => {
  const { t } = useLanguage();
  if (!gettingHere || gettingHere.length === 0) return null;

  return (
    <section id="getting-here" ref={sectionRef} className="bg-brand-ink/5 section-padding">
      <div className="content-wrapper">
        <h2 className="h2-style text-center mb-12">{t('gettingHere')}</h2>
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-around">
          {gettingHere.map((item, index) => {
            const Icon = iconMap[item.mode] || iconMap.default;
            return (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-brand-action/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-brand-action" />
                </div>
                <h3 className="h3-style text-xl mb-2">{item.title}</h3>
                <p className="body-text">{item.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DestinationGettingHere;