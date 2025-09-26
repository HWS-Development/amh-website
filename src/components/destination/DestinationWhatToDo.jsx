import { useLanguage } from '@/contexts/LanguageContext';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const DestinationWhatToDo = ({ whatToDo, sectionRef }) => {
  const { t } = useLanguage();
  if (!whatToDo || whatToDo.length === 0) return null;

  return (
    <section id="what-to-do" ref={sectionRef} className="section-padding">
      <div className="content-wrapper">
        <h2 className="h2-style text-center mb-12">{t('whatToDo')}</h2>
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-around">
          {whatToDo.map((activity, index) => (
            <div key={index} className="bg-white rounded-none border border-[#E5E8EB] overflow-hidden group h-full flex flex-col">
              <div className="h-48 overflow-hidden relative">
                {activity.image_url && <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-2">{activity.title}</h3>
                <p className="text-sm text-brand-ink/80 flex-grow">{activity.blurb}</p>
                {activity.link_url && (
                  <RouterLink to={activity.link_url} className="text-sm font-semibold text-brand-action mt-4 inline-flex items-center">
                    {t('learnMore')} <ArrowRight className="w-4 h-4 ml-1" />
                  </RouterLink>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationWhatToDo;