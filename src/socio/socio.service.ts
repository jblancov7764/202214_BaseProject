import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';

@Injectable()
export class SocioService {
    constructor(
        @InjectRepository(SocioEntity)
        private readonly socioRepository: Repository<SocioEntity>
    ){}

    async findAll(): Promise<SocioEntity[]> {
        return await this.socioRepository.find({});
    }

    async findOne(id: string): Promise<SocioEntity> {
        const socio: SocioEntity = await this.socioRepository.findOne({where: {id}});
        if (!socio)
          throw new BusinessLogicException("The socio with the given id was not found", BusinessError.NOT_FOUND);
   
        return socio;
    }

    async create(socio: SocioEntity): Promise<SocioEntity> {
        if (!socio.correo.includes("@"))
            throw new BusinessLogicException("Invalid email", BusinessError.PRECONDITION_FAILED);

        return await this.socioRepository.save(socio);
    }

    async update(id: string, socio: SocioEntity): Promise<SocioEntity> {
        if (!socio.correo.includes("@"))
            throw new BusinessLogicException("Invalid email", BusinessError.PRECONDITION_FAILED);

        const persistedSocio: SocioEntity = await this.socioRepository.findOne({where:{id}});
        if (!persistedSocio)
          throw new BusinessLogicException("The socio with the given id was not found", BusinessError.NOT_FOUND);
       
        Object.assign(persistedSocio, socio);
       
        return await this.socioRepository.save(persistedSocio);
    }

    async delete(id: string) {
        const socio: SocioEntity = await this.socioRepository.findOne({where:{id}});
        if (!socio)
          throw new BusinessLogicException("The socio with the given id was not found", BusinessError.NOT_FOUND);
     
        await this.socioRepository.remove(socio);
    }
}
