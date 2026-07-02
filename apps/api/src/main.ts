import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,   // Required for Better Auth
  });

  app.enableCors({
    origin: "http://localhost:3001",   // Next.js frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  await app.listen(3000);   // ← Use 3001 to avoid conflict with Next.js
}

bootstrap();