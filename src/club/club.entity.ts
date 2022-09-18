import { MemberEntity } from "../member/member.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ClubEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    fechaFundacion: Date;

    @Column()
    imagen: string;

    @Column()
    descripcion: string;

    @ManyToMany(() => MemberEntity, member => member.clubs)
    members: MemberEntity[];
}
