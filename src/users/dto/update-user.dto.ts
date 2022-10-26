import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PointSchemaType, ReaderType } from '../entities/user.entity';

export class UpdateUserDto {
    // @IsString()
    // @IsOptional()
    // displayName: string;

    // @IsString()
    // @IsOptional()
    // @IsOptional()
    // photoURL: string;

    @IsEnum(ReaderType)
    @IsOptional()
    readerType: ReaderType;

    @IsOptional()
    location: PointSchemaType;
}
