export class PaginationResponseDto<T> {
  public items: T[];
  public total: number;
  public page: number;
  public limit: number;
  public totalPages: number;

  constructor(data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  }) {
    this.items = data.items;
    this.total = data.total;
    this.page = data.page;
    this.limit = data.limit;
    this.totalPages = Math.ceil(data.total / data.limit);
  }
}
