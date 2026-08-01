import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import { ArrowRight } from 'lucide-react';

const AllProducts = () => {
    const { products, isLoading } = useProducts();
    const { t } = useLanguage();
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setIsVisible(true);
            return;
        }

        const element = sectionRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element);
                }
            },
            { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Show first 8 products on homepage
    const displayProducts = products.slice(0, 8);

    return (
        <section id="products" ref={sectionRef} className="py-20 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div 
                    className="text-center mb-16"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
                        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {t('allProducts.title')}
                    </h2>
                    <p className="text-lg text-gray-400 max-w-xl mx-auto">
                        {t('allProducts.subtitle')}
                    </p>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <ProductGridSkeleton count={8} />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {displayProducts.map((product, index) => (
                            <div
                                key={product.id}
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                                    transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                                    transitionDelay: `${index * 0.05}s`
                                }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {/* View All Button */}
                {products.length > 8 && (
                    <div 
                        className="text-center mt-12"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                            transitionDelay: '0.4s'
                        }}
                    >
                        <Link
                            to="/products"
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
                        >
                            Barcha mahsulotlarni ko'rish
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllProducts;
