import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import FirebaseJwtStrategy from 'src/firebase/firebase-auth-strategy';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { WishlistsModule } from './wishlists/wishlists.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './env.validation';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        UsersModule,
        BooksModule,
        WishlistsModule,
        SharedModule,
    ],
    controllers: [AppController],
    providers: [FirebaseJwtStrategy, AppService],
    exports: [FirebaseJwtStrategy],
})
export class AppModule {}
