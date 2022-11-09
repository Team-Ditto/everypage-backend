import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';

import { FirebaseService } from './firebase.service';
import { UsersService } from 'src/users/users.service';
import { UserDocument } from 'src/users/entities/user.entity';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface User extends UserDocument {}
    }
}

@Injectable()
export default class FirebaseAuthStrategy extends PassportStrategy(Strategy) {
    constructor(private firebaseService: FirebaseService, private userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(token: string): Promise<UserDocument> {
        const firebaseUser = await this.firebaseService.firebaseApp
            .auth()
            .verifyIdToken(token, true)
            .catch((err: Error) => {
                console.log(err);

                throw new UnauthorizedException(err.message);
            });

        if (!firebaseUser) {
            throw new UnauthorizedException();
        }

        const user = await this.userService.getUserById(firebaseUser.uid);

        return user;
    }
}
