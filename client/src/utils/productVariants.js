export const getVariants = (product) => Array.isArray(product?.variants) ? product.variants : [];

export const getAvailableVariants = (product) => getVariants(product).filter((variant) =>
  variant.isActive !== false && (variant.stock === undefined || Number(variant.stock) > 0)
);

export const getProductOptions = (product, field) => {
  const variantValues = getAvailableVariants(product).map((variant) => variant[field]).filter(Boolean);
  const legacyValues = Array.isArray(product?.[`${field}s`]) ? product[`${field}s`] : [];
  return [...new Set([...variantValues, ...legacyValues.flatMap((value) => typeof value === 'string' ? value.split(/\s+/) : [value])].map(String).map((value) => value.trim()).filter(Boolean))];
};

export const findVariant = (product, color, size) => getAvailableVariants(product).find((variant) =>
  (!color || variant.color === color) && (!size || variant.size === size)
) || null;
