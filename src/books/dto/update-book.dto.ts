import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookBorrowingStatus, BookCondition, BookReadingStatus } from 'src/books/entities/book.entity';

export class UpdateBookDto {
    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsOptional()
    author: string;

    @IsString()
    @IsOptional()
    edition: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsEnum(BookCondition)
    @IsOptional()
    condition: BookCondition;

    @IsString({ each: true })
    @IsOptional()
    images: string[];

    @IsNumber()
    @IsOptional()
    isbn: number;

    @IsString()
    @IsOptional()
    language: string;

    @IsString()
    @IsOptional()
    location: string;

    @IsString({ each: true })
    @IsOptional()
    tags: string[];

    @IsString()
    @IsOptional()
    genre: string;

    @IsBoolean()
    @IsOptional()
    shareable: boolean;

    @IsEnum(BookReadingStatus)
    @IsOptional()
    readingStatus: BookReadingStatus;

    @IsEnum(BookBorrowingStatus)
    @IsOptional()
    borrowingStatus: BookBorrowingStatus;

    @IsOptional()
    bearer: string;

    @IsOptional()
    requestor: string;

    @IsBoolean()
    @IsOptional()
    bookReturnRequest: boolean;

    @IsString()
    @IsOptional()
    notes: string;
}
