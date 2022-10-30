import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/users/users.module';

import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist, WishlistSchema } from './entities/wishlist.entity';

@Module({
    imports: [UsersModule, MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }])],
    controllers: [WishlistsController],
    providers: [WishlistsService],
})
export class WishlistsModule {}
