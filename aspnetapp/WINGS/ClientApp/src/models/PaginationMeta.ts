export type PaginationMeta = {
  page: number,
  size: number,
  pageCount: number,
  links: {
    self: string,
    first: string,
    previous: string,
    next: string,
    last: string
  }
};
