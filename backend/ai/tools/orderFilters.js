// ✅ Clean AI args
export const sanitizeOrderFilters = (args = {}) => {
  const filters = {};

  // ✅ STATUS
  const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
  if (args.status && validStatuses.includes(args.status.toLowerCase())) {
    filters.status = args.status.toLowerCase();
  }

  // ✅ AMOUNT (min + max)
  if (args.minAmount) {
    const min = Number(args.minAmount);
    if (!isNaN(min)) {
      filters.minAmount = min;
    }
  }

  if (args.maxAmount) {
    const max = Number(args.maxAmount);
    if (!isNaN(max)) {
      filters.maxAmount = max;
    }
  }

  // ✅ DATE
  if (args.fromDate) {
    const date = new Date(args.fromDate);
    if (!isNaN(date.getTime())) {
      filters.fromDate = date;
    }
  }

  // ✅ PRODUCT
  if (args.productName && args.productName.trim().length > 1) {
    filters.productName = args.productName.trim();
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
export const extractOrderFallback = (message) => {
  const msg = message.toLowerCase();
  const filters = {};

  // ✅ STATUS
  if (msg.includes("cancelled")) filters.status = "cancelled";
  else if (msg.includes("pending")) filters.status = "pending";
  else if (msg.includes("shipped")) filters.status = "shipped";
  else if (msg.includes("delivered")) filters.status = "delivered";

  // ✅ ABOVE / MIN
  const minMatch = msg.match(/(above|over|greater than)\s*(\d+)/);
  if (minMatch) {
    filters.minAmount = Number(minMatch[2]);
  }

  // ✅ BELOW / MAX
  const maxMatch = msg.match(/(below|under|less than)\s*(\d+)/);
  if (maxMatch) {
    filters.maxAmount = Number(maxMatch[2]);
  }

  // ✅ BETWEEN (RANGE 🔥)
  const rangeMatch = msg.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (rangeMatch) {
    filters.minAmount = Number(rangeMatch[1]);
    filters.maxAmount = Number(rangeMatch[2]);
  }

  // ✅ LIMIT (last 3 orders etc.)
  const limitMatch = msg.match(/(last|recent)\s*(\d+)/);
  if (limitMatch) {
    filters.limit = Number(limitMatch[2]);
  }

  // ✅ PRODUCT (basic heuristic)
  const productMatch = msg.match(/order(s)? (with|for|of)\s+([a-zA-Z]+)/);
  if (productMatch) {
    filters.productName = productMatch[3];
  }

  return filters;
};
