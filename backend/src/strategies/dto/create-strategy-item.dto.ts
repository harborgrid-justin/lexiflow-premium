import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateStrategyItemDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["Argument", "Defense", "Citation"])
  type: "Argument" | "Defense" | "Citation";

  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsOptional()
  title?: string; // Argument, Defense

  @IsString()
  @IsOptional()
  citation?: string; // Citation

  @IsString()
  @IsOptional()
  description?: string; // Argument, Defense

  @IsString()
  @IsOptional()
  @IsIn(["Affirmative", "Procedural", "Factual"])
  defenseType?: string; // Defense (mapped from 'type' in frontend sometimes vs separate field)

  // Frontend sends 'type' property inside the item for Defense type?
  // Wait, frontend sends { type: 'Defense', item: { type: 'Affirmative', ... } }
  // So the top level type is 'Defense'. The item's type is 'Affirmative'.

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  court?: string; // Citation

  @IsNumber()
  @IsOptional()
  year?: number; // Citation
}
