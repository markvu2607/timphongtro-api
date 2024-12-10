import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { ProvincesController } from './provinces.controller';
import { ProvincesService } from './provinces.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ProvincesService],
  controllers: [ProvincesController],
})
export class ProvincesModule {}
