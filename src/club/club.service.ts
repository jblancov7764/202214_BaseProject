import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';

@Injectable()
export class ClubService {
    constructor(
        @InjectRepository(ClubEntity)
        private readonly clubRepository: Repository<ClubEntity>
    ){}

    async findAll(): Promise<ClubEntity[]> {
        return await this.clubRepository.find({});
    }

    async findOne(id: string): Promise<ClubEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({where: {id}});
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
   
        return club;
    }

    async create(club: ClubEntity): Promise<ClubEntity> {
        if (club.descripcion.length > 100)
            throw new BusinessLogicException("The club description can not contain more than 100 characters", BusinessError.PRECONDITION_FAILED);
            
        return await this.clubRepository.save(club);
    }

    async update(id: string, club: ClubEntity): Promise<ClubEntity> {
        if (club.descripcion.length > 100)
            throw new BusinessLogicException("The club description can not contain more than 100 characters", BusinessError.PRECONDITION_FAILED);

        const persistedClub: ClubEntity = await this.clubRepository.findOne({where:{id}});
        if (!persistedClub)
            throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
       
        Object.assign(persistedClub, club);
       
        return await this.clubRepository.save(persistedClub);
    }

    async delete(id: string) {
        const club: ClubEntity = await this.clubRepository.findOne({where:{id}});
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
     
        await this.clubRepository.remove(club);
    }
}
