import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { EnvironmentVariables } from './env.validation';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService<EnvironmentVariables>);

    app.use(helmet());

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    app.setGlobalPrefix('api/v1', {
        exclude: [{ path: '', method: RequestMethod.GET }],
    });

    await app.listen(configService.get<number>('PORT'));

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}

bootstrap();
