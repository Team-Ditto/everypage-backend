import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import FirebaseJwtStrategy from 'src/firebase/firebase-auth-strategy';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './env.validation';
import { LibrariesModule } from './libraries/libraries.module';
import { WishlistsModule } from './wishlists/wishlists.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        BooksModule,
        UsersModule,
        LibrariesModule,
        WishlistsModule,
    ],
    controllers: [AppController],
    providers: [FirebaseJwtStrategy, AppService],
    exports: [FirebaseJwtStrategy],
})
export class AppModule {}
