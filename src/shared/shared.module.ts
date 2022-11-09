import { Module } from '@nestjs/common';

import { BooksModule } from 'src/books/books.module';
import { UsersModule } from 'src/users/users.module';
import { WishlistsModule } from 'src/wishlists/wishlists.module';

import { FirebaseService } from 'src/firebase/firebase.service';
import { SharedService } from './shared.service';
import { SharedController } from './shared.controller';

@Module({
    imports: [UsersModule, BooksModule, WishlistsModule],
    controllers: [SharedController],
    providers: [SharedService, FirebaseService],
    exports: [FirebaseService],
})
export class SharedModule {}
