import { Module } from '@nestjs/common';

import { AuthModule } from '@thallesp/nestjs-better-auth';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { auth } from './auth';
import { EventsModule } from './events/events.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [AuthModule.forRoot({ auth }), EventsModule, UploadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
