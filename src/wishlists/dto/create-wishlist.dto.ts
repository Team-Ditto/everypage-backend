import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WishlistStatus } from '../entities/wishlist.entity';

//visit https://www.npmjs.com/package/class-validator for more info

export class CreateWishlistDto {
    @IsString()
    @IsNotEmpty()
    book: string;

    @IsOptional()
    status: WishlistStatus;

    @IsOptional()
    owner: string;
}
