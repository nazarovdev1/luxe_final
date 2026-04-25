import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import { ArrowRight } from 'lucide-react';

const NewCollection = () => {
  const { getNewCollectionProducts, isLoading } = useProducts();
  const products = getNewCollectionProducts();

  return (
    <section id="new-collection" className="py-20 bg-[#140e20]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600 mb-4 pb-5">Yangi Kolleksiya</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Eng so'nggi fashion tendentsiyalaridan ilhomlanib yaratilgan noyob dizaynlar
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
          >
            Barcha mahsulotlarni ko'rish
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
