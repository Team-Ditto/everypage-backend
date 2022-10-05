import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

//visit https://www.npmjs.com/package/class-validator for more info

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
