import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
    const fileExtension = key.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    if (fileExtension) {
      switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
      }
    }

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('aws.s3.bucketName'),
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}
