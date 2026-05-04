import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  async uploadAsset(
    fileName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ path: string; url: string }> {
    const bucket = this.readRequiredEnv('SUPABASE_ASSETS_BUCKET');
    const safeExtension = extname(fileName).toLowerCase();
    const path = `ai-assets/${randomUUID()}${safeExtension}`;

    const { error } = await this.getClient().storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase asset upload failed: ${error.message}`);
    }

    const { data } = this.getClient().storage.from(bucket).getPublicUrl(path);

    return {
      path,
      url: data.publicUrl,
    };
  }

  private getClient(): SupabaseClient {
    if (this.client) {
      return this.client;
    }

    this.client = createClient(
      this.readRequiredEnv('SUPABASE_URL'),
      this.readRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    return this.client;
  }

  private readRequiredEnv(key: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new Error(`${key} is not configured.`);
    }

    return value;
  }
}
