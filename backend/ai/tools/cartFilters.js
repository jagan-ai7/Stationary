// tools/cartFilters.js

// ✅ Clean AI args
export const sanitizeCartFilters = (args = {}) => {
  const filters = {};

  // ✅ PRODUCT
  if (args.productName && args.productName.trim().length > 1) {
    filters.productName = args.productName.trim();
  }

  // ✅ QTY
  if (args.minQty) {
    const min = Number(args.minQty);
    if (!isNaN(min)) {
      filters.minQty = min;
    }
  }

  if (args.maxQty) {
    const max = Number(args.maxQty);
    if (!isNaN(max)) {
      filters.maxQty = max;
    }
  }

  // ✅ LIMIT
  if (args.limit) {
    const limit = Number(args.limit);
    if (!isNaN(limit) && limit > 0 && limit <= 50) {
      filters.limit = limit;
    }
  }

  return filters;
};

// ✅ Backup if AI fails
export const extractCartFallback = (message) => {
  const msg = message.toLowerCase();
  const filters = {};

  // ✅ PRODUCT
  const productMatch = msg.match(/cart (with|for|of)\s+([a-zA-Z]+)/);
  if (productMatch) {
    filters.productName = productMatch[2];
  }

  // ✅ MIN QTY
  const minMatch = msg.match(/(more than|above|over)\s*(\d+)/);
  if (minMatch) {
    filters.minQty = Number(minMatch[2]);
  }

  // ✅ MAX QTY
  const maxMatch = msg.match(/(less than|below|under)\s*(\d+)/);
  if (maxMatch) {
    filters.maxQty = Number(maxMatch[2]);
  }

  // ✅ RANGE
  const rangeMatch = msg.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (rangeMatch) {
    filters.minQty = Number(rangeMatch[1]);
    filters.maxQty = Number(rangeMatch[2]);
  }

  // ✅ LIMIT
  const limitMatch = msg.match(/(first|top)\s*(\d+)/);
  if (limitMatch) {
    filters.limit = Number(limitMatch[2]);
  }

  return filters;
};
