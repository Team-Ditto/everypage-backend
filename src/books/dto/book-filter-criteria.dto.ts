import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import {
    DEFAULT_PAGE,
    DEFAULT_PER_PAGE,
    DEFAULT_SORT_BY,
    DEFAULT_SORT_ORDER,
    SortByValues,
    SortOrderValues,
} from 'src/constants';
import { BookReadingStatus } from 'src/books/entities/book.entity';

export class BookFilterCriteria {
    @IsString()
    @IsOptional()
    keyword: string;

    @IsOptional()
    page: number = DEFAULT_PAGE;

    @IsOptional()
    perPage: number = DEFAULT_PER_PAGE;

    @IsEnum(SortByValues)
    @IsOptional()
    sortBy: SortByValues = DEFAULT_SORT_BY;

    @IsEnum(SortOrderValues)
    @IsOptional()
    sortOrder: SortOrderValues = DEFAULT_SORT_ORDER;

    @IsString()
    @IsOptional()
    genre: string;

    @IsEnum(BookReadingStatus)
    @IsOptional()
    readingStatus: BookReadingStatus;
}
