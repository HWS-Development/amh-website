import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';

const DestinationFAQ = ({ faq, sectionRef }) => {
  const { t } = useLanguage();
  if (!faq || faq.length === 0) return null;

  return (
    <section id="faq" ref={sectionRef} className="bg-brand-ink/5 section-padding">
      <div className="content-wrapper text-column">
        <h2 className="h2-style text-center mb-8">{t('freqAskedQuestions')}</h2>
        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-brand-ink/80 text-base leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default DestinationFAQ;