import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

//visit https://www.npmjs.com/package/class-validator for more info

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    displayName: string;

    @IsString()
    @IsNotEmpty()
    photoURL: string;
}
