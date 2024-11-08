import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck(): string {
    return 'Server is running...too fast 🤣🤣🤣';
  }
}
