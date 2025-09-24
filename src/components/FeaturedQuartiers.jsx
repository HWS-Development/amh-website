import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { getTranslated } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const FeaturedQuartiers = () => {
    const { t, currentLanguage } = useLanguage();
    const [quartiers, setQuartiers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuartiers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('amh_quartiers')
                .select('slug, name_tr, short_desc_tr, images')
                .eq('is_featured', true)
                .order('display_order')
                .limit(3);

            if (error) {
                console.error("Error fetching featured quartiers:", error);
            } else {
                setQuartiers(data);
            }
            setLoading(false);
        };
        fetchQuartiers();
    }, []);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };
    
    if (loading || quartiers.length === 0) {
        return null;
    }

    return (
        <section className="pb-16 bg-brand-ink/5">
            <div className="content-wrapper">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="h2-style">{t('medinaQuartiersTitle')}</h2>
                    <p className="body-text max-w-2xl mx-auto mt-2">{t('medinaQuartiersSubtitle')}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quartiers.map((quartier, index) => {
                        const name = getTranslated(quartier.name_tr, currentLanguage);
                        const shortDesc = getTranslated(quartier.short_desc_tr, currentLanguage);

                        return (
                            <motion.div
                                key={quartier.slug}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={cardVariants}
                            >
                                <Link to={`/quartiers-medina#${quartier.slug}`} className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                    <div className="relative h-64">
                                        <img
                                            src={quartier.images[0]}
                                            alt={name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-6">
                                            <h3 className="text-2xl font-bold text-white">{name}</h3>
                                            <p className="text-white/90 mt-1">{shortDesc}</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center mt-12"
                >
                    <Button asChild size="lg" className="btn-action">
                        <Link to="/quartiers-medina">
                            {t('discoverAllQuartiers')} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedQuartiers;