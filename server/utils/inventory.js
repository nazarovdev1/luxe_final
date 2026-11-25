// Stock reservation helpers for order creation.
//
// A product only has countable stock when its `stock` (or the picked variant's `stock`) is a
// number. Older catalogue entries have no stock field at all: those are sold without a limit,
// so they are never reserved. Reserving them used to fail on every order with
// "zaxirasi o'zgardi", because a missing field can never satisfy `stock >= quantity`.

export const isStockTracked = (value) => typeof value === 'number' && Number.isFinite(value)

// Only items with a counted stock take part in reservation.
export const needsReservation = (item) => item?.stockTracked === true

// The conditional update that takes `quantity` out of stock only if enough is left,
// so two shoppers racing for the last piece cannot both get it.
export const buildReservation = (item) => {
  if (item.variantId) {
    return {
      query: {
        _id: item.product,
        variants: { $elemMatch: { _id: item.variantId, isActive: { $ne: false }, stock: { $gte: item.quantity } } },
      },
      update: { $inc: { 'variants.$[variant].stock': -item.quantity, stock: -item.quantity } },
      options: { arrayFilters: [{ 'variant._id': item.variantId, 'variant.isActive': { $ne: false } }] },
    }
  }
  return {
    query: { _id: item.product, stock: { $gte: item.quantity }, 'variants.0': { $exists: false } },
    update: { $inc: { stock: -item.quantity } },
    options: {},
  }
}

// Order items are stored as-is; the bookkeeping flag must not leak into the order.
export const withoutInventoryFlags = (items) => items.map(({ stockTracked, ...item }) => item)
