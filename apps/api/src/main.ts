import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);

  // Set a global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Body parser configuration
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Replace '*' with specific origin in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allows sending cookies and other credentials in requests
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API documentation for the Auth module')
    .setVersion('1.0')
    .addBearerAuth() // Enables Bearer token authentication
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
