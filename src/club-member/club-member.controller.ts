import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { MemberEntity } from '../member/member.entity';
import { MemberDto } from '../member/member.dto';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ClubMemberService } from './club-member.service';
import { plainToInstance } from 'class-transformer';

@UseInterceptors(BusinessErrorsInterceptor)
@Controller('clubs')
export class ClubMemberController {
    constructor(private readonly clubMemberService: ClubMemberService){}
    
    @Post(':clubId/members/:memberId')
    async addMemberToClub(@Param('clubId') clubId: string, @Param('memberId') memberId: string){
        return await this.clubMemberService.addMemberToClub(clubId, memberId);
    }

    @Get(':clubId/members/:memberId')
    async findMemberFromClub(@Param('clubId') clubId: string, @Param('memberId') memberId: string){
        return await this.clubMemberService.findMemberByClubIdMemberId(clubId, memberId);
    }

    @Get(':clubId/members')
    async findMembersFromClub(@Param('clubId') clubId: string){
        return await this.clubMemberService.findMembersByClubId(clubId);
    }

    @Put(':clubId/members')
    async updateMembersFromClub(@Body() memberDto: MemberDto[], @Param('clubId') clubId: string){
        return await this.clubMemberService.associateMembersClub(clubId, plainToInstance(MemberEntity, memberDto));
    }

    @Delete(':clubId/members/:memberId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMemberFromClub(@Param('clubId') clubId: string, @Param('memberId') memberId: string){
        return await this.clubMemberService.deleteMemberOfClub(clubId, memberId);
    }

}
