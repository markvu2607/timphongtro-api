import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

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

  async uploadFile(
    fileName: string,
    body: Buffer | Uint8Array | Blob | string,
  ) {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const key = `${uuidv4()}.${fileExtension}`;
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
      await this.s3Client.send(command);
      return key;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get<string>('aws.s3.bucketName'),
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}
