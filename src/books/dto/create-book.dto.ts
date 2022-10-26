import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { BookCondition, BookReadingStatus } from '../entities/book.entity';

//visit https://www.npmjs.com/package/class-validator for more info

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    author: string;

    @IsString()
    @IsNotEmpty()
    edition: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(BookCondition)
    @IsNotEmpty()
    condition: BookCondition;

    @IsString({ each: true })
    images: string[];

    @IsNumber()
    @IsNotEmpty()
    isbn: number;

    @IsString()
    @IsNotEmpty()
    language: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString({ each: true })
    tags: string[];

    @IsString()
    @IsNotEmpty()
    genre: string;

    @IsBoolean()
    @IsNotEmpty()
    shareable: boolean;

    @IsEnum(BookReadingStatus)
    @IsNotEmpty()
    readingStatus: BookReadingStatus;

    @IsOptional()
    owner: string;

    @IsString()
    notes: string;
}
