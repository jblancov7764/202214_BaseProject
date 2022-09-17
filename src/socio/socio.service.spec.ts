import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';
import { SocioService } from './socio.service';

import { faker } from '@faker-js/faker';

describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(getRepositoryToken(SocioEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    sociosList = [];
    for(let i = 0; i < 5; i++){
        const socio: SocioEntity = await repository.save({
          nombre: faker.name.fullName(),
          correo: faker.internet.email(),
          fechaNacimiento: faker.date.past(10)
        });
        sociosList.push(socio)
   }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all socios', async () => {
    const socios: SocioEntity[] = await service.findAll();
    expect(socios).not.toBeNull();
    expect(socios).toHaveLength(sociosList.length);
  });

  it('findOne should return a socio by id', async () => {
    const storedSocio: SocioEntity = sociosList[0];
    const socio: SocioEntity = await service.findOne(storedSocio.id);
    expect(socio).not.toBeNull();
    expect(socio.nombre).toEqual(storedSocio.nombre)
    expect(socio.correo).toEqual(storedSocio.correo)
    expect(socio.fechaNacimiento).toEqual(storedSocio.fechaNacimiento)
  });

  it('findOne should throw an exception for an invalid socio', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The socio with the given id was not found")
  });

  it('create should return a new socio', async () => {
    const socio: SocioEntity = {
      id: "",
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
      clubes : []
    }

    const newSocio: SocioEntity = await service.create(socio);
    expect(newSocio).not.toBeNull();

    const storedSocio: SocioEntity = await repository.findOne({where: {id: newSocio.id}})
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombre).toEqual(newSocio.nombre)
    expect(storedSocio.correo).toEqual(newSocio.correo)
    expect(storedSocio.fechaNacimiento).toEqual(newSocio.fechaNacimiento)
  });

  it('update should modify a socio', async () => {
    const socio: SocioEntity  = sociosList[0];
    socio.nombre = "New name";
    socio.correo = "New@Correo";
  
    const updatedSocio: SocioEntity = await service.update(socio.id, socio);
    expect(updatedSocio).not.toBeNull();
  
    const storedSocio: SocioEntity = await repository.findOne({ where: { id: socio.id } })
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombre).toEqual(socio.nombre)
    expect(storedSocio.correo).toEqual(socio.correo)
  });

  it('update should throw an exception for an invalid socio', async () => {
    const socio: SocioEntity  = sociosList[0];
    socio.nombre = "New name";
    socio.correo = "New@Correo";

    await expect(() => service.update("0", socio)).rejects.toHaveProperty("message", "The socio with the given id was not found")
  });

  it('delete should remove a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);
  
    const deletedSocio: SocioEntity = await repository.findOne({ where: { id: socio.id } })
    expect(deletedSocio).toBeNull();
  });

  it('delete should throw an exception for an invalid socio', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The socio with the given id was not found")
  });
  
});