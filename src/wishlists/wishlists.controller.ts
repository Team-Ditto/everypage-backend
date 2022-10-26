import { Request } from 'express';
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';

import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto, UpdateWishlistDto, StatusWishlistDto, DeleteWishlistDto } from './dto';

@Controller('wishlists')
@UseGuards(FirebaseAuthGuard)
export class WishlistsController {
    constructor(private readonly wishlistsService: WishlistsService) {}

    @Post()
    createNewWishlist(@Req() req: Request, @Body() createWishlistDto: CreateWishlistDto) {
        return this.wishlistsService.createNewWishlist(req, createWishlistDto);
    }

    @Get()
    getWishlistsByStatus(@Req() req: Request, @Query() wishlistStatus: StatusWishlistDto) {
        console.log(wishlistStatus);

        return this.wishlistsService.getWishlistsByStatus(req, wishlistStatus.status);
    }

    @Get(':id')
    getWishlistById(@Param('id') id: string) {
        return this.wishlistsService.getWishlistById(id);
    }

    @Put(':id')
    updateWishlistById(@Param('id') id: string, @Body() updateWishlistDto: UpdateWishlistDto) {
        return this.wishlistsService.updateWishlistById(id, updateWishlistDto);
    }

    @Delete('')
    deleteMultipleWishlists(@Req() req: Request, @Body() deleteWishlistDto: DeleteWishlistDto) {
        return this.wishlistsService.deleteMultipleWishlists(req, deleteWishlistDto.ids);
    }
}
