import { MemberEntity } from "../member/member.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ClubEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    foundationDate: Date;

    @Column()
    image: string;

    @Column()
    description: string;

    @ManyToMany(() => MemberEntity, member => member.clubs)
    members: MemberEntity[];
}
