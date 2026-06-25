export const sanitizeProductFilters = (args = {}) => {
  const filters = {};

  // 🔎 QUERY
  if (args.query && args.query.trim().length > 1) {
    filters.query = args.query.trim();
  }

  // 💰 PRICE
  if (args.minPrice != null) {
    const min = Number(args.minPrice);
    if (!isNaN(min)) filters.minPrice = min;
  }

  if (args.maxPrice != null) {
    const max = Number(args.maxPrice);
    if (!isNaN(max)) filters.maxPrice = max;
  }

  // 📦 CATEGORY
  if (args.category && args.category.trim().length > 1) {
    filters.category = args.category.trim().toLowerCase();
  }

  // 📦 STOCK
  if (typeof args.inStock === "boolean") {
    filters.inStock = args.inStock;
  }

  // 📊 SORT
  const validSorts = [
    "price_low",
    "price_high",
    "newest",
    "oldest",
    "stock_high",
    "stock_low",
  ];
  if (args.sortBy && validSorts.includes(args.sortBy)) {
    filters.sortBy = args.sortBy;
  }

  // 📄 PAGINATION
  if (args.page) {
    const page = Number(args.page);
    if (!isNaN(page) && page > 0) filters.page = page;
  }

  if (args.limit) {
    const limit = Number(args.limit);
    if (!isNaN(limit) && limit > 0 && limit <= 50) {
      filters.limit = limit;
    }
  }

  return filters;
};

export const extractProductFallback = (message) => {
  const msg = message.toLowerCase();
  const filters = {};

  // 🔎 QUERY (basic)
  const queryMatch = msg.match(/(search|find|show)\s+(.*)/);
  if (queryMatch) {
    filters.query = queryMatch[2];
  }

  // 💰 PRICE
  const minMatch = msg.match(/(above|over)\s*(\d+)/);
  if (minMatch) {
    filters.minPrice = Number(minMatch[2]);
  }

  const maxMatch = msg.match(/(below|under)\s*(\d+)/);
  if (maxMatch) {
    filters.maxPrice = Number(maxMatch[2]);
  }

  const rangeMatch = msg.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (rangeMatch) {
    filters.minPrice = Number(rangeMatch[1]);
    filters.maxPrice = Number(rangeMatch[2]);
  }

  // 📦 STOCK
  if (msg.includes("in stock")) filters.inStock = true;

  // 📊 SORT
  if (msg.includes("cheap")) filters.sortBy = "price_low";
  if (msg.includes("expensive")) filters.sortBy = "price_high";

  return filters;
};
