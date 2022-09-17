import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';

@Injectable()
export class ClubSocioService {

    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>
    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>

    async addSocioToClub(clubId: string, socioId: string): Promise<ClubEntity> {
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socioId}});
        if (!socio)
          throw new BusinessLogicException("The socio with the given id was not found", BusinessError.NOT_FOUND);
      
        const club: ClubEntity = await this.clubRepository.findOne(
            {where: {id: clubId}, relations: ["socios"]}
            )
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);

        club.socios = [...club.socios, socio];
        return await this.clubRepository.save(club);
    }

    async findSocioByClubIdSocioId(clubId: string, socioId: string): Promise<SocioEntity> {

        const club: ClubEntity = await this.validate(clubId, socioId);
   
        return club.socios.find(r => r.id === socioId);
    }

    async findSociosByClubId(clubId: string): Promise<SocioEntity[]> {
        const club: ClubEntity = await this.clubRepository.findOne(
            {where: {id: clubId}, relations: ["socios"]}
            )
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
       
        return club.socios;
    }
    
    async associateSociosClub(clubId: string, socios: SocioEntity[]): Promise<ClubEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({where: {id: clubId}, relations: ["socios"]});
    
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND)
    
        for (let i = 0; i < socios.length; i++) {
          const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socios[i].id}});
          if (!socio)
            throw new BusinessLogicException("The socio with the given id was not found", BusinessError.NOT_FOUND)
        }
    
        club.socios = socios;
        return await this.clubRepository.save(club);
    }

    async deleteSocioOfClub(clubId: string, socioId: string){

        const club: ClubEntity = await this.validate(clubId, socioId);
   
        club.socios = club.socios.filter(r => r.id !== socioId);

        await this.clubRepository.save(club);
    }

    private async validate(clubId: string, socioId: string): Promise<ClubEntity> {
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id: socioId}});
        if (!socio)
          throw new BusinessLogicException("The socio with the given id was not found", BusinessError.NOT_FOUND);
      
        const club: ClubEntity = await this.clubRepository.findOne(
            {where: {id: clubId}, relations: ["socios"]}
            )
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
 
      const clubSocio: SocioEntity = club.socios.find(r => r.id === socio.id);
 
      if (!clubSocio)
        throw new BusinessLogicException("The socio with the given id is not associated to the club", BusinessError.PRECONDITION_FAILED)
 
      return club;
  }
}
