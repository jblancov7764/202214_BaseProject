import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { ClubSocioService } from './club-socio.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';



describe('ClubSocioService', () => {
  let service: ClubSocioService;
  let clubRepository: Repository<ClubEntity>;
  let socioRepository: Repository<SocioEntity>;
  let club: ClubEntity;
  let sociosList : SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubSocioService],
    }).compile();

    service = module.get<ClubSocioService>(ClubSocioService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    socioRepository = module.get<Repository<SocioEntity>>(getRepositoryToken(SocioEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    clubRepository.clear();
    socioRepository.clear();
    sociosList = [];
    for(let i = 0; i < 5; i++){
        const socio: SocioEntity = await socioRepository.save({
          nombre: faker.name.fullName(),
          correo: faker.internet.email(),
          fechaNacimiento: faker.date.past(10),
        });
        sociosList.push(socio)
    }

    club = await clubRepository.save({
      nombre: faker.name.fullName(),
      fechaFundacion: faker.date.past(10),
      descripcion: faker.lorem.sentence(),
      imagen: faker.internet.url(),
      socios: sociosList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSocioToClub should add a socio to a club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
    });

    const newClub = await clubRepository.save({
      nombre: faker.name.fullName(),
      fechaFundacion: faker.date.past(10),
      descripcion: faker.lorem.sentence(),
      imagen: faker.internet.url(),
    });
 
    const result: ClubEntity = await service.addSocioToClub(newClub.id, newSocio.id);
   
    expect(result.socios.length).toBe(1);
    expect(result.socios[0]).not.toBeNull();
    expect(result.socios[0].nombre).toBe(newSocio.nombre);
  });

  it('addSocioToClub should thrown exception for an invalid socio', async () => {

    const newClub = await clubRepository.save({
      nombre: faker.name.fullName(),
      fechaFundacion: faker.date.past(10),
      descripcion: faker.lorem.sentence(),
      imagen: faker.internet.url(),
    });
 
    await expect(() => service.addSocioToClub(newClub.id, "0")).rejects.toHaveProperty("message", "The socio with the given id was not found");
  });

  it('addSocioToClub should thrown exception for an invalid club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
    });

    await expect(() => service.addSocioToClub("0", newSocio.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findSocioByClubIdSocioId should return socio of the club', async () => {
    const socio: SocioEntity = sociosList[0];
    const storedSocio: SocioEntity = await service.findSocioByClubIdSocioId(club.id, socio.id);

    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombre).toBe(socio.nombre);
  });

  it('findSocioByClubIdSocioId should throw an exception for an invalid socio', async () => {
    await expect(()=> service.findSocioByClubIdSocioId(club.id, "0")).rejects.toHaveProperty("message", "The socio with the given id was not found");
  });

  it('findSocioByClubIdSocioId should throw an exception for an invalid club', async () => {
    const socio: SocioEntity = sociosList[0];

    await expect(()=> service.findSocioByClubIdSocioId("0", socio.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findSocioByClubIdSocioId should throw an exception for a socio not associated to the club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
    });
 
    await expect(
      ()=> service.findSocioByClubIdSocioId(club.id, newSocio.id)
      ).rejects.toHaveProperty("message", "The socio with the given id is not associated to the club");
  });

  it('findSociosByClubId should return socios of a  club', async ()=>{
    const socios: SocioEntity[] = await service.findSociosByClubId(club.id);
    expect(socios.length).toBe(sociosList.length)
  });

  it('findSociosByClubId should throw an exception for an invalid club', async () => {
    await expect(()=> service.findSociosByClubId("0")).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associateSociosClub should update socios list for a club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
    });
 
    const updatedClub: ClubEntity = await service.associateSociosClub(club.id, [newSocio]);

    expect(updatedClub.socios.length).toBe(1);
    expect(updatedClub.socios[0].nombre).toBe(newSocio.nombre);
  });

  it('associateSociosClub should throw an exception for an invalid club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
    });
 
    await expect(()=> service.associateSociosClub("0", [newSocio])).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associateSociosClub should throw an exception for an invalid artwork', async () => {
    const newSocio: SocioEntity= sociosList[0];
    newSocio.id = "0";
 
    await expect(()=> service.associateSociosClub(club.id, [newSocio])).rejects.toHaveProperty("message", "The socio with the given id was not found");
  });

  it('deleteSociooOfClub should remove a resturant from a club', async () => {
    const socio: SocioEntity = sociosList[0];
   
    await service.deleteSocioOfClub(club.id, socio.id);
 
    const storedClub: ClubEntity = await clubRepository.findOne({where: {id: club.id}, relations: ["socios"]});
    const deletedSocio: SocioEntity = storedClub.socios.find(r => r.id === socio.id);
 
    expect(deletedSocio).toBeUndefined();
 
  });

  it('deleteSociooOfClub should throw an exception for an invalid socio', async () => {
    await expect(()=> service.deleteSocioOfClub(club.id, "0")).rejects.toHaveProperty("message", "The socio with the given id was not found");
  });

  it('deleteSociooOfClub should throw an exception for an invalid club', async () => {
    const socio: SocioEntity = sociosList[0];

    await expect(()=> service.deleteSocioOfClub("0", socio.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('deleteSociooOfClub should throw an exception for a socio not associated to the club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
    });
 
    await expect(
      ()=> service.deleteSocioOfClub(club.id, newSocio.id)
      ).rejects.toHaveProperty("message", "The socio with the given id is not associated to the club");
  });

});
