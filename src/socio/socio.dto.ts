import {IsDate, IsNotEmpty, IsString} from 'class-validator';
export class SocioDto {

 @IsString()
 @IsNotEmpty()
 readonly nombre: string;

 @IsString()
 @IsNotEmpty()
 readonly correo: string;

 @IsDate()
 @IsNotEmpty()
 readonly fechaNacimiento: Date;
}