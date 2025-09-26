import { useLanguage } from '@/contexts/LanguageContext';

const DestinationMap = ({ mapUrl, destinationName, sectionRef }) => {
  const { t } = useLanguage();
  if (!mapUrl) return null;

  return (
    <section id="map" ref={sectionRef} className="section-padding bg-brand-ink/5">
      <div className="content-wrapper">
        <h2 className="h2-style text-center mb-12">{t('map')}</h2>
        <div className="aspect-video">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${destinationName}`}
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default DestinationMap;