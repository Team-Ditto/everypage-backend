import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteWishlistDto {
    @IsString({ each: true })
    @IsNotEmpty()
    ids: string[];
}
