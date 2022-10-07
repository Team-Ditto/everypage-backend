import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  FIREBASE_TYPE: string;

  @IsString()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  FIREBASE_PRIVATE_KEY_ID: string;

  @IsString()
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  FIREBASE_CLIENT_ID: string;

  @IsString()
  FIREBASE_AUTH_URI: string;

  @IsString()
  FIREBASE_TOKEN_URI: string;

  @IsString()
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: string;

  @IsString()
  FIREBASE_CLIENT_X509_CERT_URL: string;

  @IsString()
  FIREBASE_DATABASE_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
