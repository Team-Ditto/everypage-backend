import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/users/users.module';

import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist, WishlistSchema } from './entities/wishlist.entity';

@Module({
    imports: [MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }]), UsersModule],
    controllers: [WishlistsController],
    providers: [WishlistsService],
    exports: [WishlistsService],
})
export class WishlistsModule {}
