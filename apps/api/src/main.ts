import dns from 'node:dns';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Node's fetch (undici) can hang trying IPv6 first on networks where it's
// broken/unreachable, which surfaces as ETIMEDOUT when calling out to Google's
// OAuth endpoints. Prefer IPv4 resolution to avoid that.
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,   // Required for Better Auth
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.enableCors({
    origin: "http://localhost:3001",   // Next.js frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  await app.listen(3000);   // ← Use 3001 to avoid conflict with Next.js
}

bootstrap();