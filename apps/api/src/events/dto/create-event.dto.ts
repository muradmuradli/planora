import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  EVENT_CATEGORIES,
  EVENT_VISIBILITIES,
  VIDEO_PLATFORMS,
  type EventCategory,
  type EventVisibility,
  type VideoPlatform,
} from '../../db/schema';

export class CreateTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsDateString()
  salesEndDate?: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(EVENT_CATEGORIES)
  category!: EventCategory;

  @IsOptional()
  @IsIn(EVENT_VISIBILITIES)
  visibility?: EventVisibility;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsBoolean()
  isOnline!: boolean;

  @ValidateIf((dto: CreateEventDto) => !dto.isOnline)
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ValidateIf((dto: CreateEventDto) => dto.isOnline)
  @IsIn(VIDEO_PLATFORMS)
  videoPlatform?: VideoPlatform;

  @ValidateIf((dto: CreateEventDto) => dto.isOnline)
  @IsUrl()
  eventLink?: string;

  @IsOptional()
  @IsString()
  meetingId?: string;

  @IsOptional()
  @IsString()
  passcode?: string;

  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTypeDto)
  ticketTypes!: CreateTicketTypeDto[];
}
