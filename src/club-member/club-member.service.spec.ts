import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { ClubMemberService } from './club-member.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';



describe('ClubMemberService', () => {
  let service: ClubMemberService;
  let clubRepository: Repository<ClubEntity>;
  let memberRepository: Repository<MemberEntity>;
  let club: ClubEntity;
  let membersList : MemberEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubMemberService],
    }).compile();

    service = module.get<ClubMemberService>(ClubMemberService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    memberRepository = module.get<Repository<MemberEntity>>(getRepositoryToken(MemberEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    clubRepository.clear();
    memberRepository.clear();
    membersList = [];
    for(let i = 0; i < 5; i++){
        const member: MemberEntity = await memberRepository.save({
          name: faker.name.fullName(),
          email: faker.internet.email(),
          birthDate: faker.date.past(10),
        });
        membersList.push(member)
    }

    club = await clubRepository.save({
      name: faker.name.fullName(),
      foundationDate: faker.date.past(10),
      description: faker.lorem.sentence(),
      image: faker.internet.url(),
      members: membersList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add a member to a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      birthDate: faker.date.past(10),
    });

    const newClub = await clubRepository.save({
      name: faker.name.fullName(),
      foundationDate: faker.date.past(10),
      description: faker.lorem.sentence(),
      image: faker.internet.url(),
    });
 
    const result: ClubEntity = await service.addMemberToClub(newClub.id, newMember.id);
   
    expect(result.members.length).toBe(1);
    expect(result.members[0]).not.toBeNull();
    expect(result.members[0].name).toBe(newMember.name);
  });

  it('addMemberToClub should thrown exception for an invalid member', async () => {

    const newClub = await clubRepository.save({
      name: faker.name.fullName(),
      foundationDate: faker.date.past(10),
      description: faker.lorem.sentence(),
      image: faker.internet.url(),
    });
 
    await expect(() => service.addMemberToClub(newClub.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('addMemberToClub should thrown exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      birthDate: faker.date.past(10),
    });

    await expect(() => service.addMemberToClub("0", newMember.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findMemberByClubIdMemberId should return member of the club', async () => {
    const member: MemberEntity = membersList[0];
    const storedMember: MemberEntity = await service.findMemberByClubIdMemberId(club.id, member.id);

    expect(storedMember).not.toBeNull();
    expect(storedMember.name).toBe(member.name);
  });

  it('findMemberByClubIdMemberId should throw an exception for an invalid member', async () => {
    await expect(()=> service.findMemberByClubIdMemberId(club.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('findMemberByClubIdMemberId should throw an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];

    await expect(()=> service.findMemberByClubIdMemberId("0", member.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findMemberByClubIdMemberId should throw an exception for a member not associated to the club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      birthDate: faker.date.past(10),
    });
 
    await expect(
      ()=> service.findMemberByClubIdMemberId(club.id, newMember.id)
      ).rejects.toHaveProperty("message", "The member with the given id is not associated to the club");
  });

  it('findMembersByClubId should return members of a  club', async ()=>{
    const members: MemberEntity[] = await service.findMembersByClubId(club.id);
    expect(members.length).toBe(membersList.length)
  });

  it('findMembersByClubId should throw an exception for an invalid club', async () => {
    await expect(()=> service.findMembersByClubId("0")).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associateMembersClub should update members list for a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      birthDate: faker.date.past(10),
    });
 
    const updatedClub: ClubEntity = await service.associateMembersClub(club.id, [newMember]);

    expect(updatedClub.members.length).toBe(1);
    expect(updatedClub.members[0].name).toBe(newMember.name);
  });

  it('associateMembersClub should throw an exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      birthDate: faker.date.past(10),
    });
 
    await expect(()=> service.associateMembersClub("0", [newMember])).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associateMembersClub should throw an exception for an invalid artwork', async () => {
    const newMember: MemberEntity= membersList[0];
    newMember.id = "0";
 
    await expect(()=> service.associateMembersClub(club.id, [newMember])).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('deleteMemberoOfClub should remove a resturant from a club', async () => {
    const member: MemberEntity = membersList[0];
   
    await service.deleteMemberOfClub(club.id, member.id);
 
    const storedClub: ClubEntity = await clubRepository.findOne({where: {id: club.id}, relations: ["members"]});
    const deletedMember: MemberEntity = storedClub.members.find(r => r.id === member.id);
 
    expect(deletedMember).toBeUndefined();
 
  });

  it('deleteMemberoOfClub should throw an exception for an invalid member', async () => {
    await expect(()=> service.deleteMemberOfClub(club.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('deleteMemberoOfClub should throw an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];

    await expect(()=> service.deleteMemberOfClub("0", member.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('deleteMemberoOfClub should throw an exception for a member not associated to the club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.name.fullName(),
      email: faker.internet.email(),
      birthDate: faker.date.past(10),
    });
 
    await expect(
      ()=> service.deleteMemberOfClub(club.id, newMember.id)
      ).rejects.toHaveProperty("message", "The member with the given id is not associated to the club");
  });

});
