import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const DestinationWhenToVisit = ({ whenToVisit, ctaLabel, ctaUrl, sectionRef }) => {
  const { t } = useLanguage();
  if (!whenToVisit) return null;

  return (
    <section id="when-to-visit" ref={sectionRef} className="section-padding">
      <div className="content-wrapper text-column text-center">
        <h2 className="h2-style mb-6">{t('whenToVisit')}</h2>
        <p className="body-text mb-8">{whenToVisit}</p>
        {ctaLabel && ctaUrl && (
          <Button asChild size="lg" className="btn-action">
            <RouterLink to={ctaUrl}>{ctaLabel} <ArrowRight className="w-5 h-5 ml-2" /></RouterLink>
          </Button>
        )}
      </div>
    </section>
  );
};

export default DestinationWhenToVisit;