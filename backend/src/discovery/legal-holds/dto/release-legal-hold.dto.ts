import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class ReleaseLegalHoldDto {
  @IsDateString()
  releaseDate!: string;

  @IsString()
  releaseReason!: string;

  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @IsUUID()
  releasedBy!: string;
}
