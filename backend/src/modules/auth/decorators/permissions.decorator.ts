import { SetMetadata } from "@nestjs/common";

export const RequirePermission = (action: string, entity?: string) => SetMetadata('permissions_metadata', { action, entity });