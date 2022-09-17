import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocioService } from './socio.service';
import { SocioEntity } from './socio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocioEntity])],
  providers: [SocioService]
})
export class SocioModule {}
