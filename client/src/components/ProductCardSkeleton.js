import React from 'react';

const ProductCardSkeleton = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-white/5 animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-700"></div>

            {/* Content Skeleton */}
            <div className="p-5 space-y-4">
                {/* Category */}
                <div className="h-6 w-20 bg-gray-700/50 rounded-lg"></div>

                {/* Name */}
                <div className="h-5 w-3/4 bg-gray-700/50 rounded-lg"></div>

                {/* Rating */}
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-gray-700/50 rounded"></div>
                    ))}
                </div>

                {/* Price */}
                <div className="h-6 w-1/2 bg-gray-700/50 rounded-lg"></div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
    );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
};

export default ProductCardSkeleton;
