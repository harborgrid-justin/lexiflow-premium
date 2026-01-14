import { Public } from "@common/decorators/public.decorator";
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FeatureFlagsConfigService } from "../services/feature-flags-config.service";

/**
 * Feature Flags Controller
 * Provides feature flags to frontend for feature toggling
 */
@ApiTags("Features")
@Controller("features")
export class FeaturesController {
  constructor(
    private readonly featureFlagsService: FeatureFlagsConfigService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all feature flags" })
  @ApiResponse({ status: 200, description: "Returns all feature flags" })
  getFeatureFlags() {
    return {
      graphql: this.featureFlagsService.graphqlEnabled,
      swagger: this.featureFlagsService.swaggerEnabled,
      websockets: this.featureFlagsService.websocketsEnabled,
      realtime: this.featureFlagsService.realtimeEnabled,
      fileUpload: this.featureFlagsService.fileUploadEnabled,
      ocr: this.featureFlagsService.ocrEnabled,
      email: this.featureFlagsService.emailEnabled,
      sms: this.featureFlagsService.smsEnabled,
      mfa: this.featureFlagsService.mfaEnabled,
      apiVersioning: this.featureFlagsService.apiVersioningEnabled,
    };
  }
}
