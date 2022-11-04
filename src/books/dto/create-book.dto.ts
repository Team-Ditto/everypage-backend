import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
    language: string;

    @IsString()
    @IsNotEmpty()
    genre: string;

    @IsString()
    @IsNotEmpty()
    edition: string;

    @IsNumber()
    @IsNotEmpty()
    ISBN: number;

    @IsEnum(BookCondition)
    @IsNotEmpty()
    bookCondition: BookCondition;

    @IsEnum(BookReadingStatus)
    @IsNotEmpty()
    readingStatus: BookReadingStatus;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString({ each: true })
    images: string[];

    @IsBoolean()
    @IsNotEmpty()
    shareable: boolean;

    @IsOptional()
    owner: string;

    @IsString()
    notes: string;
}
