import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PointSchemaType, ReaderType } from '../entities/user.entity';

export class UpdateUserDto {
    // @IsString()
    // @IsOptional()
    // displayName: string;

    @IsBoolean()
    @IsOptional()
    firstTimeLogin: boolean;

    @IsEnum(ReaderType)
    @IsOptional()
    readerType: ReaderType;

    @IsOptional()
    location: PointSchemaType;
}
