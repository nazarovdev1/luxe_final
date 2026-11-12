// Product addresses carry the product name for search engines and end with the
// Mongo id, which is what the app actually loads: /product/bordo-jun-palto-697cb72c...
// Old /product/<id> links keep working because only the trailing id is read.

const LETTERS = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
};

const ID_PATTERN = /([a-f0-9]{24})$/i;

export const slugify = (value = '') => String(value)
  .toLowerCase()
  .replace(/[‘’ʻʼ`']/g, '')
  .split('')
  .map((char) => (LETTERS[char] ?? char))
  .join('')
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 70)
  .replace(/-+$/, '');

export const productIdOf = (product) => String(product?._id || product?.id || '');

export const productSlugId = (product) => {
  const id = productIdOf(product);
  const slug = slugify(product?.name);
  return slug && id ? `${slug}-${id}` : id;
};

export const productPath = (product, { mobile = false } = {}) =>
  `${mobile ? '/mobile' : ''}/product/${productSlugId(product)}`;

// Reads the id out of either "<slug>-<id>" or a bare "<id>" route param.
export const extractProductId = (param = '') => {
  const match = String(param).match(ID_PATTERN);
  return match ? match[1] : String(param);
};
