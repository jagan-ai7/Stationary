// tools/cartFilters.js

// ✅ Clean AI args
export const sanitizeCartFilters = (args = {}) => {
  const filters = {};

  // ✅ PRODUCT
  if (args.productName && args.productName.trim().length > 1) {
    filters.productName = args.productName.trim();
  }

  // ✅ QTY
  if (args.minQty !== undefined) {
    const min = Number(args.minQty);
    if (!isNaN(min)) filters.minQty = min;
  }

  if (args.maxQty !== undefined) {
    const max = Number(args.maxQty);
    if (!isNaN(max)) filters.maxQty = max;
  }

  // ✅ PAGINATION
  const limit = Number(args.limit);
  const page = Number(args.page);

  filters.limit = !isNaN(limit) && limit > 0 && limit <= 50 ? limit : 10;

  filters.page = !isNaN(page) && page > 0 ? page : 1;

  return filters;
};

// ✅ Backup if AI fails
export const extractCartFallback = (message) => {
  const msg = message.toLowerCase();
  const filters = {};

  // ✅ PRODUCT
  const productMatch = msg.match(
    /(?:cart.*(?:with|for|of)\s+)([a-zA-Z0-9\s]+)/,
  );
  if (productMatch) {
    filters.productName = productMatch[1].trim();
  }

  // ✅ MIN QTY
  const minMatch = msg.match(/(more than|above|over)\s+(\d+)/);
  if (minMatch) {
    filters.minQty = Number(minMatch[2]);
  }

  // ✅ MAX QTY
  const maxMatch = msg.match(/(less than|below|under)\s+(\d+)/);
  if (maxMatch) {
    filters.maxQty = Number(maxMatch[2]);
  }

  // ✅ RANGE
  const rangeMatch = msg.match(/between\s+(\d+)\s+and\s+(\d+)/);
  if (rangeMatch) {
    filters.minQty = Number(rangeMatch[1]);
    filters.maxQty = Number(rangeMatch[2]);
  }

  // ✅ LIMIT
  const limitMatch = msg.match(/(first|top)\s+(\d+)/);
  if (limitMatch) {
    filters.limit = Number(limitMatch[2]);
  }

  // ✅ PAGE
  const pageMatch = msg.match(/page\s+(\d+)/);
  if (pageMatch) {
    filters.page = Number(pageMatch[1]);
  }

  return filters;
};
