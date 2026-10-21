import React from 'react';
import SEO from '../../components/SEO';
import Catalogue from '../../mobile/pages/Catalogue';

export default function MobileProducts() {
  return (
    <>
      <SEO
        title="Premium ayollar kiyimlari katalogi"
        description="Luxx.uz ayollar kiyimlari katalogi: premium kostyumlar, jaketlar, paltolar va zamonaviy to‘plamlarni Toshkent bo‘ylab yetkazib berish bilan xarid qiling."
        canonicalPath="/products"
      />
      <Catalogue />
    </>
  );
}
