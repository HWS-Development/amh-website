import { useLanguage } from '@/contexts/LanguageContext';

const DestinationHeader = ({ name, subtitle, heroImage }) => {
  const { t } = useLanguage();
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-white overflow-hidden">
      {heroImage && (
        <img src={heroImage} alt={`Hero image for ${name}`} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-brand-ink/40"></div>
      <div className="relative z-10 text-center">
        <h1 className="h1-style font-bold text-white/80">{name}</h1>
        <p className="text-xl text-white/60 md:text-2xl mt-2 tracking-wide uppercase">{subtitle}</p>
      </div>
    </section>
  );
};

export default DestinationHeader;