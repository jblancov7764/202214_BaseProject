import {IsDate, IsNotEmpty, IsUrl, IsString} from 'class-validator';
export class ClubDto {

 @IsString()
 @IsNotEmpty()
 readonly nombre: string;
 
 @IsUrl()
 @IsNotEmpty()
 readonly imagen: string;

 @IsString()
 @IsNotEmpty()
 readonly descripcion: string;

 @IsDate()
 @IsNotEmpty()
 readonly fechaFundacion: Date;
}