import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './member/member.module';
import { ClubModule } from './club/club.module';
import { ClubMemberModule } from './club-member/club-member.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './member/member.entity';
import { ClubEntity } from './club/club.entity';

@Module({
  imports: [MemberModule, ClubModule, ClubMemberModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'clubs-members',
      entities: [MemberEntity, ClubEntity],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
