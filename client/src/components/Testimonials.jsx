import React, { useEffect, useState } from 'react';
import api from '../utils/api'; // Ensure you have an axios instance or use axios directly
import { FaTiktok } from 'react-icons/fa'; // Make sure react-icons is installed, or use lucide equivalent if not
import { getImageUrl } from '../utils/imageHelper';
import { Quote } from 'lucide-react';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                // Public endpoint
                const res = await api.get('/api/testimonials');
                setTestimonials(res.data);
            } catch (error) {
                console.error("Error fetching testimonials", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    if (loading) return null; // Or skeleton

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif font-bold text-primary mb-4">Ils parlent de nous !</h2>
                    <p className="text-gray-600 dark:text-gray-300">Découvrez les retours de nos clients satisfaits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {testimonials.map(t => (
                        <div key={t.id} className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative">
                            <Quote className="absolute top-4 right-4 text-orange-100 dark:text-gray-600 rotate-180" size={48} />
                            <div className="flex items-center gap-4 mb-4">
                                {t.image ? (
                                    <img src={getImageUrl(t.image)} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-sm" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center font-bold text-primary text-xl">
                                        {t.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-lg dark:text-white">{t.name}</h4>
                                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 italic relative z-10">
                                "{t.content}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* TikTok Button */}
                <div className="flex justify-center">
                    <a
                        href="https://www.tiktok.com/@attiekedekoungbe?is_from_webapp=1&sender_device=pc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:scale-105"
                    >
                        {/* If FaTiktok fails imports, use text or svg */}
                        <FaTiktok size={24} />
                        <span>Nous suivre sur TikTok</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
