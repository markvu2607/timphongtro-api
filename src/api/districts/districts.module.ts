import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { DistrictsController } from './districts.controller';
import { DistrictsService } from './districts.service';

@Module({
  imports: [RepositoriesModule],
  providers: [DistrictsService],
  controllers: [DistrictsController],
})
export class DistrictsModule {}
