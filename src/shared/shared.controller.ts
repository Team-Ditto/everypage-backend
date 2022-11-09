import { Request } from 'express';
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';

import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { SharedService } from './shared.service';
import { HandleTriggerRequestDto } from './dto';
import { WishlistDocument } from 'src/wishlists/entities/wishlist.entity';

@Controller()
@UseGuards(FirebaseAuthGuard)
export class SharedController {
    constructor(private readonly sharedService: SharedService) {}

    @Post('trigger')
    handleTriggerRequest(
        @Req() req: Request,
        @Body() handleTriggerRequestDto: HandleTriggerRequestDto,
    ): Promise<void | WishlistDocument> {
        return this.sharedService.handleTriggerRequest(req, handleTriggerRequestDto);
    }
}
