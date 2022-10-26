import { IsEnum, IsNotEmpty } from 'class-validator';

import { WishlistStatus } from '../entities/wishlist.entity';

export class StatusWishlistDto {
    @IsEnum(WishlistStatus)
    @IsNotEmpty()
    status: WishlistStatus;
}
