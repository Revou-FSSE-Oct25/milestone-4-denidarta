import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import morgan from 'morgan';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const logger = new Logger('HTTP');

	app.setGlobalPrefix('api/v1');
	app.use(
		morgan('dev', {
			stream: { write: (message: string) => logger.log(message.trim()) },
		})
	);
	app.use(
		helmet({
			contentSecurityPolicy: false,
			crossOriginEmbedderPolicy: false,
		})
	);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		})
	);
	const config = new DocumentBuilder()
		.setTitle('API Documentation')
		.setDescription('Belum ada deskripsi')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('/', app, document);

	// BigInt is not serializable by default JSON.stringify
	(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
		return this.toString();
	};

	await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
