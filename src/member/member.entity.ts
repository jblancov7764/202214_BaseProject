import { ClubEntity } from "../club/club.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MemberEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    correo: string;

    @Column()
    fechaNacimiento: Date;

    @ManyToMany(() => ClubEntity, club => club.members)
    @JoinTable()
    clubs: ClubEntity[];
}
