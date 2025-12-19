import { PartialType } from '@nestjs/swagger';
import { CreateWarRoomDto } from './create-war-room.dto';

export class UpdateWarRoomDto extends PartialType(CreateWarRoomDto) {}
