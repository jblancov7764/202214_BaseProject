import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { SocioEntity } from '../socio/socio.entity';
import { SocioDto } from '../socio/socio.dto';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ClubSocioService } from './club-socio.service';
import { plainToInstance } from 'class-transformer';

@UseInterceptors(BusinessErrorsInterceptor)
@Controller('clubes')
export class ClubSocioController {
    constructor(private readonly clubSocioService: ClubSocioService){}
    
    @Post(':clubId/socios/:socioId')
    async addSocioToClub(@Param('clubId') clubId: string, @Param('socioId') socioId: string){
        return await this.clubSocioService.addSocioToClub(clubId, socioId);
    }

    @Get(':clubId/socios/:socioId')
    async findSocioByClubIdSocioId(@Param('clubId') clubId: string, @Param('socioId') socioId: string){
        return await this.clubSocioService.findSocioByClubIdSocioId(clubId, socioId);
    }

    @Get(':clubId/socios')
    async findSociosByClubId(@Param('clubId') clubId: string){
        return await this.clubSocioService.findSociosByClubId(clubId);
    }

    @Put(':clubId/socios')
    async associateSociosClub(@Body() socioDto: SocioDto[], @Param('clubId') clubId: string){
        return await this.clubSocioService.associateSociosClub(clubId, plainToInstance(SocioEntity, socioDto));
    }

    @Delete(':clubId/socios/:socioId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteSocioOfClub(@Param('clubId') clubId: string, @Param('socioId') socioId: string){
        return await this.clubSocioService.deleteSocioOfClub(clubId, socioId);
    }

}
