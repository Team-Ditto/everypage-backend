import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as firebase from 'firebase-admin';

import { EnvironmentVariables } from 'src/env.validation';

@Injectable()
export default class FirebaseAuthStrategy extends PassportStrategy(Strategy) {
  firebaseApp: any;

  constructor(private config: ConfigService<EnvironmentVariables>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });

    // initialize firebase admin
    this.firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert({
        type: this.config.get<string>('FIREBASE_TYPE'),
        projectId: this.config.get<string>('FIREBASE_PROJECT_ID'),
        privateKeyId: this.config
          .get<string>('FIREBASE_PRIVATE_KEY_ID')
          .replace(/\\n/g, '\n'),
        privateKey: this.config.get<string>('FIREBASE_PRIVATE_KEY'),
        clientEmail: this.config.get<string>('FIREBASE_CLIENT_EMAIL'),
        clientId: this.config.get<string>('FIREBASE_CLIENT_ID'),
        authUri: this.config.get<string>('FIREBASE_AUTH_URI'),
        tokenUri: this.config.get<string>('FIREBASE_TOKEN_URI'),
        authProviderX509CertUrl: this.config.get<string>(
          'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
        ),
        clientC509CertUrl: this.config.get<string>(
          'FIREBASE_CLIENT_X509_CERT_URL',
        ),
      } as Partial<firebase.ServiceAccount>),
      databaseURL: this.config.get<string>('FIREBASE_DATABASE_URL'),
    });
  }

  async validate(token: string) {
    const firebaseUser: any = await this.firebaseApp
      .auth()
      .verifyIdToken(token, true)
      .catch((err: Error) => {
        console.log(err);

        throw new UnauthorizedException(err.message);
      });

    if (!firebaseUser) {
      throw new UnauthorizedException();
    }

    return firebaseUser;
  }
}
