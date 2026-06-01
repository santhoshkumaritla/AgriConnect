/** Normalize MongoDB / populated user refs to a comparable string id. */
export const normalizeId = (value) => {
  if (value == null) return '';
  if (typeof value === 'object') {
    if (value._id != null) return String(value._id);
    if (value.id != null) return String(value.id);
  }
  return String(value);
};
