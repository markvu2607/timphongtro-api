import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
    });
  }

  async uploadFile(key: string, body: Buffer | Uint8Array | Blob | string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('aws.s3.bucketName'),
      Key: key,
      Body: body,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFile(key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('aws.s3.bucketName'),
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }
}
