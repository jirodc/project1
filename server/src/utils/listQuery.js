export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Case-insensitive search where every word must match one of `fields`, so
 * "juan dela" finds first name "Juan" + last name "Dela Cruz".
 */
export function searchFilter(search, fields) {
  const words = (search ?? '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return {};
  return {
    $and: words.map((word) => {
      const pattern = new RegExp(escapeRegex(word), 'i');
      return { $or: fields.map((field) => ({ [field]: pattern })) };
    }),
  };
}

export const containsPattern = (search) => new RegExp(escapeRegex(search.trim()), 'i');

/** Runs a paginated find and returns the standard `{ items, pagination }` list shape. */
export async function paginate(Model, filter, { page, limit, sort = '-createdAt', populate } = {}) {
  let query = Model.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
  if (populate) query = query.populate(populate);

  const [items, total] = await Promise.all([query, Model.countDocuments(filter)]);
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
