import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Plus, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { showCartToast } from '../../utils/toast';

const MAX_ADD_ONS = 3;

const formatPrice = (value) => Number(value || 0).toLocaleString('uz-UZ').replace(/,/g, ' ');

const getProductImage = (product) => {
  if (product?.image) return product.image;
  const firstImage = product?.images?.[0];
  return typeof firstImage === 'object' ? firstImage?.url : firstImage;
};

export default function CompleteTheLook({ currentProduct }) {
  const { products } = useProducts();
  const { addLookToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [currentProduct?.id]);

  const suggestions = useMemo(
    () => (products || [])
      .filter((product) => product.id !== currentProduct?.id && product.stock !== 0 && getProductImage(product))
      .slice(0, 6),
    [products, currentProduct?.id]
  );

  const selectedProducts = useMemo(
    () => suggestions.filter((product) => selectedIds.includes(product.id)),
    [suggestions, selectedIds]
  );

  const bundleProducts = currentProduct ? [currentProduct, ...selectedProducts] : selectedProducts;
  const originalPrice = bundleProducts.reduce((total, product) => total + Number(product.price || 0), 0);
  const discountPercent = selectedProducts.length * 10;
  const discountAmount = Math.round(originalPrice * (discountPercent / 100));
  const finalPrice = originalPrice - discountAmount;

  const toggleProduct = (productId) => {
    setSelectedIds((previous) => {
      if (previous.includes(productId)) return previous.filter((id) => id !== productId);
      if (previous.length >= MAX_ADD_ONS) return previous;
      return [...previous, productId];
    });
  };

  const addBundleToCart = () => {
    if (!currentProduct || selectedProducts.length === 0) return;

    setIsAdding(true);
    try {
      addLookToCart({
        id: `product-bundle-${currentProduct.id}`,
        title: `${currentProduct.name} to'plami`,
        heroImage: getProductImage(currentProduct),
        products: bundleProducts.map((product) => ({ ...product, image: getProductImage(product) })),
        originalPrice,
        discountType: 'percentage',
        discountValue: discountPercent,
      });
      showCartToast({
        itemName: `${bundleProducts.length} ta mahsulotli to'plam`,
        quantity: 1,
        duration: 5000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="bundle-builder">
      <div className="bundle-builder-heading">
        <div>
          <p>TO‘PLAM TUZING</p>
          <h2>Bu mahsulotga mos<br />uslubni yarating.</h2>
        </div>
        <span className="bundle-builder-rule">Har qo‘shilgan mahsulot: <b>−10%</b></span>
      </div>

      <div className="bundle-builder-layout">
        <div>
          <div className="bundle-selected-list">
            <article className="bundle-selected-product is-base">
              <div className="bundle-selected-image"><img src={getProductImage(currentProduct)} alt={currentProduct?.name} /></div>
              <div><small>ASOSIY MAHSULOT</small><h3>{currentProduct?.name}</h3><strong>{formatPrice(currentProduct?.price)} so‘m</strong></div>
              <Check size={17} />
            </article>

            {selectedProducts.map((product) => (
              <article key={product.id} className="bundle-selected-product">
                <div className="bundle-selected-image"><img src={getProductImage(product)} alt={product.name} /></div>
                <div><small>{product.category || 'MAHSULOT'}</small><h3>{product.name}</h3><strong>{formatPrice(product.price)} so‘m</strong></div>
                <button onClick={() => toggleProduct(product.id)} aria-label={`${product.name}ni olib tashlash`}><X size={16} /></button>
              </article>
            ))}
          </div>

          <div className="bundle-picker">
            <div className="bundle-picker-heading"><span>To‘plamga mahsulot qo‘shing</span><small>{selectedProducts.length}/{MAX_ADD_ONS} tanlandi</small></div>
            {suggestions.length > 0 ? (
              <div className="bundle-product-options">
                {suggestions.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isDisabled = !isSelected && selectedIds.length >= MAX_ADD_ONS;
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      disabled={isDisabled}
                      className={isSelected ? 'is-selected' : ''}
                    >
                      <img src={getProductImage(product)} alt="" />
                      <span><b>{product.name}</b><small>{formatPrice(product.price)} so‘m</small></span>
                      <i>{isSelected ? <Check size={14} /> : <Plus size={15} />}</i>
                    </button>
                  );
                })}
              </div>
            ) : <p className="bundle-empty-state">Hozircha to‘plam uchun boshqa mahsulotlar mavjud emas.</p>}
          </div>
        </div>

        <aside className="bundle-summary">
          <p>TO‘PLAM XULOSASI</p>
          <h3>{bundleProducts.length} ta mahsulot</h3>
          <div className="bundle-summary-lines">
            <span><i>Mahsulotlar narxi</i><b>{formatPrice(originalPrice)} so‘m</b></span>
            <span className={discountPercent ? 'has-discount' : ''}><i>To‘plam chegirmasi {discountPercent ? `(${discountPercent}%)` : ''}</i><b>{discountPercent ? `−${formatPrice(discountAmount)} so‘m` : '—'}</b></span>
          </div>
          <div className="bundle-summary-total"><span>Jami</span><strong>{formatPrice(finalPrice)} <small>so‘m</small></strong></div>
          <button onClick={addBundleToCart} disabled={!selectedProducts.length || isAdding}>
            {isAdding ? <Loader2 className="animate-spin" size={17} /> : <ShoppingBag size={17} />}
            {selectedProducts.length ? `To‘plamni savatga qo‘shish` : 'Mahsulot tanlang'}
          </button>
          {!selectedProducts.length && <small className="bundle-summary-hint">Chegirma olish uchun kamida bitta mahsulot qo‘shing.</small>}
        </aside>
      </div>
    </section>
  );
}
