import { Request } from 'express';
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';

import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto, UpdateWishlistDto, StatusWishlistDto, DeleteWishlistDto } from './dto';
import { WishlistDocument } from './entities/wishlist.entity';

@Controller('wishlists')
@UseGuards(FirebaseAuthGuard)
export class WishlistsController {
    constructor(private readonly wishlistsService: WishlistsService) {}

    @Post()
    createNewWishlist(@Req() req: Request, @Body() createWishlistDto: CreateWishlistDto): Promise<WishlistDocument> {
        return this.wishlistsService.createNewWishlist(req, createWishlistDto);
    }

    @Get()
    getWishlistsByStatus(@Req() req: Request, @Query() wishlistStatus: StatusWishlistDto): Promise<WishlistDocument[]> {
        return this.wishlistsService.getWishlistsByStatus(req, wishlistStatus.status);
    }

    @Get(':id')
    getWishlistById(@Param('id') id: string): Promise<WishlistDocument> {
        return this.wishlistsService.getWishlistById(id);
    } 

    @Put(':id')
    updateWishlistById(
        @Param('id') id: string,
        @Body() updateWishlistDto: UpdateWishlistDto,
    ): Promise<WishlistDocument> {
        return this.wishlistsService.updateWishlistById(id, updateWishlistDto);
    }

    @Delete('')
    deleteMultipleWishlists(@Req() req: Request, @Body() deleteWishlistDto: DeleteWishlistDto): Promise<string[]> {
        return this.wishlistsService.deleteMultipleWishlists(req, deleteWishlistDto.ids);
    }

    @Delete('book/:id')
    deleteWishlistByBookId(@Req() req: Request, @Param('id') id: string): Promise<WishlistDocument> {
        return this.wishlistsService.deleteWishlistByBookId(req, id);
    }
}
