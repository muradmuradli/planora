import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Session() session: UserSession, @Body() dto: CreateEventDto) {
    return this.eventsService.create(session.user.id, dto);
  }

  @Get()
  @OptionalAuth()
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  @Get(':id')
  @OptionalAuth()
  findOne(
    @Param('id') id: string,
    @Session() session: UserSession | undefined,
  ) {
    return this.eventsService.findOne(id, session?.user.id);
  }
}
