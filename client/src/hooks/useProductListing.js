import { useCallback, useEffect, useMemo, useState } from 'react';

const parsePrice = (value) => {
  if (typeof value === 'string') return Number((value.match(/\d+/g) || []).join('')) || 0;
  return Number(value || 0);
};

const badgeScore = (badge = '') => {
  const normalized = badge.toUpperCase();
  if (normalized === 'BESTSELLER') return 3;
  if (normalized === 'NEW') return 2;
  return 1;
};

const productScore = (product) => (product.rating || 0) * 100 + badgeScore(product.badge) * 10;

const normalizeSizeList = (sizes = []) => (
  Array.isArray(sizes)
    ? [...new Set(
        sizes
          .flatMap((size) => (typeof size === 'string' && size.includes(' ') ? size.split(' ') : [size]))
          .map((size) => String(size).trim())
          .filter(Boolean)
      )]
    : []
);

export const useProductListing = ({
  products = [],
  categories = [],
  allLabel = 'Barchasi',
  categoryFromUrl,
  filterFromUrl,
  setSearchParams,
  initialSort = 'featured',
  pageSize = 12,
} = {}) => {
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || allLabel);
  const [isNewOnly, setIsNewOnly] = useState(filterFromUrl === 'new');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const derivedCategories = useMemo(() => {
    if (categories.length > 0) {
      return [allLabel, ...categories.filter(Boolean).filter((name) => name !== allLabel)];
    }

    const counts = new Map();
    products.forEach((product) => {
      if (!product.category) return;
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    });

    return [allLabel, ...Array.from(counts.keys()).sort((a, b) => a.localeCompare(b))];
  }, [allLabel, categories, products]);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || allLabel);
  }, [categoryFromUrl, allLabel]);

  useEffect(() => {
    setIsNewOnly(filterFromUrl === 'new');
  }, [filterFromUrl]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setVisibleCount(pageSize);

    if (!setSearchParams) return;
    const next = {};
    if (category && category !== allLabel) next.category = category;
    if (isNewOnly) next.filter = 'new';
    setSearchParams(next);
  }, [allLabel, isNewOnly, pageSize, setSearchParams]);

  const handleNewOnlyChange = useCallback((value) => {
    setIsNewOnly(value);
    setVisibleCount(pageSize);

    if (!setSearchParams) return;
    const next = {};
    if (selectedCategory && selectedCategory !== allLabel) next.category = selectedCategory;
    if (value) next.filter = 'new';
    setSearchParams(next);
  }, [allLabel, pageSize, selectedCategory, setSearchParams]);

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = selectedCategory === allLabel || product.category === selectedCategory;
      const newMatch = !isNewOnly || product.isNewCollection === true || (product.badge || '').toUpperCase() === 'NEW';
      const searchMatch =
        query.length === 0 ||
        (product.name || '').toLowerCase().includes(query) ||
        (product.category || '').toLowerCase().includes(query);
      return categoryMatch && newMatch && searchMatch;
    });
  }, [allLabel, isNewOnly, products, searchText, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'price-low':
        return list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      case 'price-high':
        return list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'bestseller':
        return list.sort((a, b) => badgeScore(b.badge) - badgeScore(a.badge));
      case 'featured':
      default:
        return list.sort((a, b) => productScore(b) - productScore(a));
    }
  }, [filteredProducts, sortBy]);

  const displayedProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + pageSize);
  }, [pageSize]);

  const resetFilters = useCallback(() => {
    setSearchText('');
    setSortBy(initialSort);
    handleNewOnlyChange(false);
    handleCategoryChange(allLabel);
  }, [allLabel, handleCategoryChange, handleNewOnlyChange, initialSort]);

  const toggleCompare = useCallback((product) => {
    setCompareList((prev) => {
      const id = product._id || product.id;
      const exists = prev.some((item) => (item._id || item.id) === id);
      if (exists) return prev.filter((item) => (item._id || item.id) !== id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  }, []);

  const isCompareSelected = useCallback((product) => {
    const id = product?._id || product?.id;
    return compareList.some((item) => (item._id || item.id) === id);
  }, [compareList]);

  return {
    selectedCategory,
    isNewOnly,
    searchText,
    sortBy,
    visibleCount,
    quickViewProduct,
    compareList,
    showComparison,
    derivedCategories,
    filteredProducts,
    sortedProducts,
    displayedProducts,
    hasMore,
    normalizeSizeList,
    setSearchText,
    setSortBy,
    setQuickViewProduct,
    setCompareList,
    setShowComparison,
    handleCategoryChange,
    handleNewOnlyChange,
    loadMore,
    resetFilters,
    toggleCompare,
    isCompareSelected,
  };
};

export default useProductListing;
