import { IsNotEmpty, IsString } from 'class-validator';

//visit https://www.npmjs.com/package/class-validator for more info

export class CreateBookDto {
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  author: string;
}
