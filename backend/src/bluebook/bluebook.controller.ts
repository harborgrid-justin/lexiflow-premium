import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse} from '@nestjs/swagger';
import { BluebookService } from './bluebook.service';
import {
  FormatCitationDto,
  BatchFormatDto,
  ValidateCitationDto,
} from './dto/format-citation.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Bluebook Citation Formatter')
@ApiBearerAuth('JWT-auth')

@Controller('bluebook')
export class BluebookController {
  constructor(private readonly bluebookService: BluebookService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parse a raw citation into structured format' })
  @ApiResponse({ status: 200, description: 'Citation parsed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid citation format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  parseCitation(@Body() dto: FormatCitationDto) {
    const parsed = this.bluebookService.parseCitation(dto.citation);
    return {
      success: parsed.type !== 'UNKNOWN',
      data: parsed,
    };
  }

  @Post('format')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Format a citation according to Bluebook rules' })
  @ApiResponse({ status: 200, description: 'Citation formatted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  formatCitation(@Body() dto: FormatCitationDto) {
    const parsed = this.bluebookService.parseCitation(dto.citation);
    const formatted = this.bluebookService.formatCitation(parsed, {
      italicizeCaseNames: dto.italicizeCaseNames,
      useSmallCaps: dto.useSmallCaps,
    });
    
    return {
      original: dto.citation,
      formatted,
      type: parsed.type,
      parsed,
    };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a citation against Bluebook rules' })
  @ApiResponse({ status: 200, description: 'Validation complete' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  validateCitation(@Body() dto: ValidateCitationDto) {
    const parsed = this.bluebookService.parseCitation(dto.citation);
    const errors = this.bluebookService.validateCitation(parsed);
    
    return {
      citation: dto.citation,
      isValid: errors.length === 0 || errors.every(e => e.severity !== 'ERROR'),
      type: parsed.type,
      errors,
      parsed,
    };
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batch format multiple citations' })
  @ApiResponse({ status: 200, description: 'Batch formatting complete' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  batchFormat(@Body() dto: BatchFormatDto) {
    const result = this.bluebookService.batchFormat(dto.citations, {
      format: dto.format,
      italicizeCaseNames: dto.italicizeCaseNames,
      useSmallCaps: dto.useSmallCaps,
    });
    
    return result;
  }

  @Post('table-of-authorities')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a table of authorities from citations' })
  @ApiResponse({ status: 200, description: 'Table of authorities generated' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  generateTableOfAuthorities(@Body() body: { citations: string[] }) {
    const html = this.bluebookService.generateTableOfAuthorities(body.citations);
    
    return {
      html,
      count: body.citations.length,
    };
  }
}
