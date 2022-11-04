export enum SortByValues {
    ID = '_id',
    CreatedAt = 'createdAt',
    Title = 'title',
}

export enum SortOrderValues {
    Asc = 'asc',
    Desc = 'desc',
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const DEFAULT_SORT_BY = SortByValues.ID;
export const DEFAULT_SORT_ORDER = SortOrderValues.Asc;
