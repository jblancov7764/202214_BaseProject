import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { ClubService } from './club.service';

import { faker } from '@faker-js/faker';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubsList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    clubsList = [];
    for(let i = 0; i < 5; i++){
        const club: ClubEntity = await repository.save({
          nombre: faker.name.fullName(),
          fechaFundacion: faker.date.past(10),
          descripcion: faker.lorem.sentence(),
          imagen: faker.internet.url()
        });
        clubsList.push(club)
   }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(clubsList.length);
  });

  it('findOne should return a club by id', async () => {
    const storedClub: ClubEntity = clubsList[0];
    const club: ClubEntity = await service.findOne(storedClub.id);
    expect(club).not.toBeNull();
    expect(club.nombre).toEqual(storedClub.nombre)
    expect(club.descripcion).toEqual(storedClub.descripcion)
    expect(club.imagen).toEqual(storedClub.imagen)
  });

  it('findOne should throw an exception for an invalid club', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The club with the given id was not found")
  });

  it('create should return a new club', async () => {
    const club: ClubEntity = {
      id: "",
      nombre: faker.name.fullName(),
      fechaFundacion: faker.date.past(10),
      descripcion: faker.lorem.sentence(),
      imagen: faker.internet.url(),
      members : []
    }

    const newClub: ClubEntity = await service.create(club);
    expect(newClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({where: {id: newClub.id}})
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(newClub.nombre)
    expect(storedClub.descripcion).toEqual(newClub.descripcion)
    expect(storedClub.imagen).toEqual(newClub.imagen)
  });

  it('update should modify a club', async () => {
    const club: ClubEntity  = clubsList[0];
    club.nombre = "New name";
    club.descripcion = "New Description";
  
    const updatedClub: ClubEntity = await service.update(club.id, club);
    expect(updatedClub).not.toBeNull();
  
    const storedClub: ClubEntity = await repository.findOne({ where: { id: club.id } })
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(club.nombre)
    expect(storedClub.descripcion).toEqual(club.descripcion)
  });

  it('update should throw an exception for an invalid club', async () => {
    const club: ClubEntity  = clubsList[0];
    club.nombre = "New name";
    club.descripcion = "New Description";

    await expect(() => service.update("0", club)).rejects.toHaveProperty("message", "The club with the given id was not found")
  });

  it('delete should remove a club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);
  
    const deletedClub: ClubEntity = await repository.findOne({ where: { id: club.id } })
    expect(deletedClub).toBeNull();
  });

  it('delete should throw an exception for an invalid club', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The club with the given id was not found")
  });
  
});