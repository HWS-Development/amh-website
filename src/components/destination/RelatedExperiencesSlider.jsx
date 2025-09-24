import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated } from '@/lib/utils';

const RelatedExperiencesSlider = ({ experienceSlugs }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!experienceSlugs || experienceSlugs.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('title_tr, slug, hero_image_url, short_intro_tr')
        .in('slug', experienceSlugs);

      if (error) {
        console.error("Error fetching related experiences:", error);
      } else {
        setExperiences(data.map(exp => ({
          ...exp,
          title: getTranslated(exp.title_tr, currentLanguage),
          short_intro: getTranslated(exp.short_intro_tr, currentLanguage),
        })));
      }
      setLoading(false);
    }
    if (currentLanguage) {
      fetchExperiences();
    }
  }, [experienceSlugs, currentLanguage]);

  if (loading || experiences.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="content-wrapper">
        <h2 className="h2-style text-center mb-12">Related Experiences</h2>
        <Carousel
          opts={{
            align: "start",
            loop: experiences.length > 2,
          }}
          className="w-full"
        >
          <CarouselContent>
            {experiences.map((exp) => (
              <CarouselItem key={exp.slug} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <RouterLink to={`/experiences/${exp.slug}`}>
                    <div className="h-96 overflow-hidden rounded-none group relative text-white">
                      <div className="absolute inset-0 z-0">
                        <img
                          src={exp.hero_image_url}
                          alt={exp.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                      </div>
                      <div className="relative z-10 flex flex-col justify-end h-full p-6">
                        <div>
                          <h3 className="text-2xl font-bold font-display mb-2">{exp.title}</h3>
                          <p className="text-white/90 text-sm mb-4">{exp.short_intro}</p>
                          <span className="flex items-center gap-2 font-semibold text-white">
                            Discover More
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-[-1rem] md:left-[-2rem]" />
          <CarouselNext className="right-[-1rem] md:right-[-2rem]" />
        </Carousel>
      </div>
    </section>
  );
};

export default RelatedExperiencesSlider;