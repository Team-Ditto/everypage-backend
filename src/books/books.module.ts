import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/users/users.module';

import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book, BookSchema } from './entities/book.entity';

@Module({
    imports: [MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]), UsersModule],
    controllers: [BooksController],
    providers: [BooksService],
    exports: [BooksService],
})
export class BooksModule {}
