import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import { ArrowRight } from 'lucide-react';

const AllProducts = () => {
    const { products, isLoading } = useProducts();

    // Show first 8 products on homepage
    const displayProducts = products.slice(0, 8);

    return (
        <section id="products" className="py-20 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Mahsulotlar
                    </h2>
                    <p className="text-lg text-gray-400 max-w-xl mx-auto">
                        Eng zamonaviy dizayn va yuqori sifatli mahsulotlarimiz
                    </p>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <ProductGridSkeleton count={8} />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {displayProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* View All Button */}
                {products.length > 8 && (
                    <div className="text-center mt-12">
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
