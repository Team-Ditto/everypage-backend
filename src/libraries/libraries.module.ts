import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LibrariesService } from './libraries.service';
import { LibrariesController } from './libraries.controller';
import { Library, LibrarySchema } from './entities/library.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Library.name, schema: LibrarySchema }]),
  ],
  controllers: [LibrariesController],
  providers: [LibrariesService],
})
export class LibrariesModule {}
