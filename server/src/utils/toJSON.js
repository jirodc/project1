/** Shared toJSON options: expose `id`, hide Mongo internals. */
export const jsonOptions = {
  virtuals: true,
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
