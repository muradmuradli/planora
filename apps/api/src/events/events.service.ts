import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { db } from '../db';
import { events, ticketTypes } from '../db/schema';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  async create(organizerId: string, dto: CreateEventDto) {
    const eventId = randomUUID();

    const eventValues = {
      id: eventId,
      organizerId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      visibility: dto.visibility ?? ('public' as const),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isOnline: dto.isOnline,
      location: dto.isOnline ? null : dto.location,
      videoPlatform: dto.isOnline ? dto.videoPlatform : null,
      eventLink: dto.isOnline ? dto.eventLink : null,
      meetingId: dto.isOnline ? dto.meetingId : null,
      passcode: dto.isOnline ? dto.passcode : null,
      accessInstructions: dto.isOnline ? dto.accessInstructions : null,
      imageUrl: dto.imageUrl,
    };

    if (dto.ticketTypes.length > 0) {
      const ticketTypeValues = dto.ticketTypes.map((ticket) => ({
        id: randomUUID(),
        eventId,
        name: ticket.name,
        price: ticket.price.toFixed(2),
        quantity: ticket.quantity ?? null,
        salesEndDate: ticket.salesEndDate
          ? new Date(ticket.salesEndDate)
          : null,
      }));

      const [[event], createdTicketTypes] = await db.batch([
        db.insert(events).values(eventValues).returning(),
        db.insert(ticketTypes).values(ticketTypeValues).returning(),
      ]);

      return { ...event, ticketTypes: createdTicketTypes };
    }

    const [event] = await db.insert(events).values(eventValues).returning();
    return { ...event, ticketTypes: [] };
  }
}
