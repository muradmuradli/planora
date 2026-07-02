import { Module } from '@nestjs/common';

import { AuthModule } from '@thallesp/nestjs-better-auth';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { auth } from './auth';

@Module({
  imports: [AuthModule.forRoot({ auth }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
