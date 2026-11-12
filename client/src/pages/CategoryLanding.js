import React from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { resolveLanding } from '../config/categoryLandings';
import AllProducts from './AllProducts';
import NotFound from './NotFound';

// /kategoriya/:slug — the catalogue narrowed to one department, with its own
// heading, copy, canonical address and Russian twin.
const CategoryLanding = () => {
  const { slug } = useParams();
  const { products, isLoading } = useProducts();
  const landing = resolveLanding(slug, products);

  if (!landing && !isLoading) return <NotFound />;
  return <AllProducts landing={landing} />;
};

export default CategoryLanding;
