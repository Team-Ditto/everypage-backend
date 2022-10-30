import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

//visit https://www.npmjs.com/package/class-validator for more info

export class CreateWishlistDto {
    @IsString()
    @IsNotEmpty()
    book: string;

    @IsOptional()
    owner: string;
}
