import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WishlistStatus } from '../entities/wishlist.entity';

//visit https://www.npmjs.com/package/class-validator for more info

export class CreateWishlistDto {
    @IsString()
    @IsNotEmpty()
    book: string;

    @IsEnum(WishlistStatus)
    @IsNotEmpty()
    status: WishlistStatus;

    @IsOptional()
    owner: string;
}
