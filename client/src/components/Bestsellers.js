import React from 'react';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './ProductCardSkeleton';

const Bestsellers = () => {
  const { getBestsellerProducts, isLoading } = useProducts();
  const { t } = useLanguage();
  const products = getBestsellerProducts();

  return (
    <section id="bestsellers" className="py-20 bg-[#0e0818]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600 mb-4 pb-5">{t('bestsellers.title')}</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('bestsellers.description')}
          </p>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-gray-900 to-fuchsia-900/10 p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-purple-600/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/5 group-hover:border-purple-500/30 transition-all duration-300">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500 mb-3 group-hover:scale-110 transition-transform duration-300">98%</div>
              <div className="text-gray-400 font-medium">{t('bestsellers.satisfaction')}</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-gray-900 to-fuchsia-900/10 p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-purple-600/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/5 group-hover:border-purple-500/30 transition-all duration-300">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500 mb-3 group-hover:scale-110 transition-transform duration-300">100+</div>
              <div className="text-gray-400 font-medium">{t('bestsellers.sold')}</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-gray-900 to-fuchsia-900/10 p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-purple-600/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/5 group-hover:border-purple-500/30 transition-all duration-300">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500 mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-gray-400 font-medium">{t('bestsellers.support')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
