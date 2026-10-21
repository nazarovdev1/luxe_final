import React from 'react';
import SEO from '../../components/SEO';
import Home from '../../mobile/pages/Home';

export default function MobileHome() {
  return (
    <>
      <SEO
        title="Premium ayollar kiyimlari Toshkentda"
        description="Luxx.uz — Toshkentdagi premium ayollar kiyimlari. Uyda kiyib ko'ring, yoqsa to'laysiz. Shu kuni yetkazib berish."
        canonicalPath="/"
      />
      <Home />
    </>
  );
}
