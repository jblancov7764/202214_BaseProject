import {IsNotEmpty, IsUrl, IsString, IsDateString} from 'class-validator';
export class ClubDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsUrl()
    @IsNotEmpty()
    readonly image: string;

    @IsString()
    @IsNotEmpty()
    readonly description: string;

    @IsDateString()
    @IsNotEmpty()
    readonly foundationDate: Date;
}