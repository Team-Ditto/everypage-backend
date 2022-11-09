import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { TriggerType } from '../shared.service';

export class HandleTriggerRequestDto {
    @IsString()
    @IsOptional()
    wishlist: string;

    @IsString()
    @IsOptional()
    book: string;

    @IsString()
    @IsNotEmpty()
    triggerType: TriggerType;
}
