import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import {
  DateFormatType,
  LanguageType,
  ThemeType,
  TimeFormatType,
  ViewType,
} from "../entities/user-preferences.entity";

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({ enum: ["light", "dark", "auto"] })
  @IsOptional()
  @IsEnum(["light", "dark", "auto"])
  theme?: ThemeType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customTheme?: Record<string, unknown>;

  @ApiPropertyOptional({
    enum: ["en", "es", "fr", "de", "zh", "ja", "pt", "ru"],
  })
  @IsOptional()
  @IsEnum(["en", "es", "fr", "de", "zh", "ja", "pt", "ru"])
  language?: LanguageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD-MMM-YYYY"])
  dateFormat?: DateFormatType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(["12h", "24h"])
  timeFormat?: TimeFormatType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(["grid", "list", "kanban", "timeline"])
  defaultView?: ViewType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  itemsPerPage?: number;
}
