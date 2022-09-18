import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { MemberEntity } from '../member/member.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';

@Injectable()
export class ClubMemberService {

    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>

    async addMemberToClub(clubId: string, memberId: string): Promise<ClubEntity> {
        const member: MemberEntity = await this.memberRepository.findOne({where: {id: memberId}});
        if (!member)
          throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND);
      
        const club: ClubEntity = await this.clubRepository.findOne(
            {where: {id: clubId}, relations: ["members"]}
            )
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);

        club.members = [...club.members, member];
        return await this.clubRepository.save(club);
    }

    async findMemberByClubIdMemberId(clubId: string, memberId: string): Promise<MemberEntity> {

        const club: ClubEntity = await this.validate(clubId, memberId);
   
        return club.members.find(r => r.id === memberId);
    }

    async findMembersByClubId(clubId: string): Promise<MemberEntity[]> {
        const club: ClubEntity = await this.clubRepository.findOne(
            {where: {id: clubId}, relations: ["members"]}
            )
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
       
        return club.members;
    }
    
    async associateMembersClub(clubId: string, members: MemberEntity[]): Promise<ClubEntity> {
        const club: ClubEntity = await this.clubRepository.findOne({where: {id: clubId}, relations: ["members"]});
    
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND)
    
        for (let i = 0; i < members.length; i++) {
          const member: MemberEntity = await this.memberRepository.findOne({where: {id: members[i].id}});
          if (!member)
            throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND)
        }
    
        club.members = members;
        return await this.clubRepository.save(club);
    }

    async deleteMemberOfClub(clubId: string, memberId: string){

        const club: ClubEntity = await this.validate(clubId, memberId);
   
        club.members = club.members.filter(r => r.id !== memberId);

        await this.clubRepository.save(club);
    }

    private async validate(clubId: string, memberId: string): Promise<ClubEntity> {
        const member: MemberEntity = await this.memberRepository.findOne({where: {id: memberId}});
        if (!member)
          throw new BusinessLogicException("The member with the given id was not found", BusinessError.NOT_FOUND);
      
        const club: ClubEntity = await this.clubRepository.findOne(
            {where: {id: clubId}, relations: ["members"]}
            )
        if (!club)
          throw new BusinessLogicException("The club with the given id was not found", BusinessError.NOT_FOUND);
 
      const clubMember: MemberEntity = club.members.find(r => r.id === member.id);
 
      if (!clubMember)
        throw new BusinessLogicException("The member with the given id is not associated to the club", BusinessError.PRECONDITION_FAILED)
 
      return club;
  }
}
