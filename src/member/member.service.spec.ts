import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { MemberEntity } from './member.entity';
import { MemberService } from './member.service';

import { faker } from '@faker-js/faker';

describe('MemberService', () => {
  let service: MemberService;
  let repository: Repository<MemberEntity>;
  let membersList: MemberEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MemberService],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repository = module.get<Repository<MemberEntity>>(getRepositoryToken(MemberEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    membersList = [];
    for(let i = 0; i < 5; i++){
        const member: MemberEntity = await repository.save({
          nombre: faker.name.fullName(),
          correo: faker.internet.email(),
          fechaNacimiento: faker.date.past(10)
        });
        membersList.push(member)
   }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all members', async () => {
    const members: MemberEntity[] = await service.findAll();
    expect(members).not.toBeNull();
    expect(members).toHaveLength(membersList.length);
  });

  it('findOne should return a member by id', async () => {
    const storedMember: MemberEntity = membersList[0];
    const member: MemberEntity = await service.findOne(storedMember.id);
    expect(member).not.toBeNull();
    expect(member.nombre).toEqual(storedMember.nombre)
    expect(member.correo).toEqual(storedMember.correo)
    expect(member.fechaNacimiento).toEqual(storedMember.fechaNacimiento)
  });

  it('findOne should throw an exception for an invalid member', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The member with the given id was not found")
  });

  it('create should return a new member', async () => {
    const member: MemberEntity = {
      id: "",
      nombre: faker.name.fullName(),
      correo: faker.internet.email(),
      fechaNacimiento: faker.date.past(10),
      clubs : []
    }

    const newMember: MemberEntity = await service.create(member);
    expect(newMember).not.toBeNull();

    const storedMember: MemberEntity = await repository.findOne({where: {id: newMember.id}})
    expect(storedMember).not.toBeNull();
    expect(storedMember.nombre).toEqual(newMember.nombre)
    expect(storedMember.correo).toEqual(newMember.correo)
    expect(storedMember.fechaNacimiento).toEqual(newMember.fechaNacimiento)
  });

  it('update should modify a member', async () => {
    const member: MemberEntity  = membersList[0];
    member.nombre = "New name";
    member.correo = "New@Correo";
  
    const updatedMember: MemberEntity = await service.update(member.id, member);
    expect(updatedMember).not.toBeNull();
  
    const storedMember: MemberEntity = await repository.findOne({ where: { id: member.id } })
    expect(storedMember).not.toBeNull();
    expect(storedMember.nombre).toEqual(member.nombre)
    expect(storedMember.correo).toEqual(member.correo)
  });

  it('update should throw an exception for an invalid member', async () => {
    const member: MemberEntity  = membersList[0];
    member.nombre = "New name";
    member.correo = "New@Correo";

    await expect(() => service.update("0", member)).rejects.toHaveProperty("message", "The member with the given id was not found")
  });

  it('delete should remove a member', async () => {
    const member: MemberEntity = membersList[0];
    await service.delete(member.id);
  
    const deletedMember: MemberEntity = await repository.findOne({ where: { id: member.id } })
    expect(deletedMember).toBeNull();
  });

  it('delete should throw an exception for an invalid member', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The member with the given id was not found")
  });
  
});