import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';

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

  async findAllPublic() {
    return db.query.events.findMany({
      where: eq(events.visibility, 'public'),
      with: { ticketTypes: true },
      orderBy: [asc(events.startDate)],
    });
  }

  async findOne(id: string, requesterId?: string) {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        ticketTypes: true,
        organizer: { columns: { id: true, name: true, image: true } },
      },
    });

    const isHidden =
      !event || (event.visibility === 'private' && event.organizerId !== requesterId);

    if (isHidden) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId === requesterId) {
      return event;
    }

    // Hide join details from everyone except the organizer, since there's no
    // attendee/RSVP gate yet to restrict who can see them.
    return {
      ...event,
      eventLink: null,
      meetingId: null,
      passcode: null,
      accessInstructions: null,
    };
  }
}
