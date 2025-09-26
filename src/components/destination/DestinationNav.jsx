import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const DestinationNav = ({ destination, stickyNavRef, scrollToSection }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const anchorLinks = useMemo(() => [
    destination.getting_here_tr?.length > 0 && { id: 'getting-here', label: 'Getting Here' },
    destination.what_to_do_tr?.length > 0 && { id: 'what-to-do', label: 'What to Do' },
    destination.good_to_know_tr?.length > 0 && { id: 'good-to-know', label: 'Good to Know' },
    destination.when_to_visit_tr && { id: 'when-to-visit', label: 'When to Visit' },
    destination.faq_tr?.length > 0 && { id: 'faq', label: 'FAQ' },
    destination.gallery_urls?.length > 0 && { id: 'gallery', label: 'Gallery' },
  ].filter(Boolean), [destination]);

  return (
    <nav ref={stickyNavRef} className="sticky top-[79px] bg-white z-30 shadow-md">
      <div className="content-wrapper">
        <div className="flex justify-center items-center overflow-x-auto no-scrollbar -mx-4">
          {anchorLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                navigate(`#${link.id}`);
                scrollToSection(link.id);
              }}
              className="flex-shrink-0 px-4 md:px-6 py-4 text-sm font-semibold uppercase tracking-wider text-brand-ink/70 hover:text-brand-action border-b-2 border-transparent hover:border-brand-action focus:outline-none focus:text-brand-action transition-all"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default DestinationNav;