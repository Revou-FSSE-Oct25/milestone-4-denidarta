import { buildPaginationParams, buildPaginatedResult } from './pagination.helper';

describe('buildPaginationParams', () => {
  it('computes skip=0 for page 1', () => {
    expect(buildPaginationParams(1, 10)).toEqual({ skip: 0, take: 10 });
  });

  it('computes skip correctly for page > 1', () => {
    expect(buildPaginationParams(3, 20)).toEqual({ skip: 40, take: 20 });
  });
});

describe('buildPaginatedResult', () => {
  const data = [{ id: 1 }, { id: 2 }];

  it('computes totalPages correctly', () => {
    const result = buildPaginatedResult(data, 25, 1, 10);
    expect(result.totalPages).toBe(3);
  });

  it('sets hasNextPage=true when more pages exist', () => {
    const result = buildPaginatedResult(data, 25, 1, 10);
    expect(result.hasNextPage).toBe(true);
  });

  it('sets hasNextPage=false on last page', () => {
    const result = buildPaginatedResult(data, 10, 1, 10);
    expect(result.hasNextPage).toBe(false);
  });

  it('returns data, total, page, limit unchanged', () => {
    const result = buildPaginatedResult(data, 5, 2, 5);
    expect(result.data).toBe(data);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });

  it('handles total=0 correctly', () => {
    const result = buildPaginatedResult([], 0, 1, 10);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
