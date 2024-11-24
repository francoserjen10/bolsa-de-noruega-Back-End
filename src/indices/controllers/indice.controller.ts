import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { IIndice } from '../models/interface/indice.interface';
import { IndiceService } from '../services/indice.service';

@Controller('indice')
export class IndiceController {

    constructor(private indiceService: IndiceService) { }

    //Post de mi indice
    @Post('create')
    async createIndice(@Body() indice: IIndice) {
        try {
            return await this.indiceService.createIndice(indice);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: error.message || 'Error al crear el índice',
            }, HttpStatus.BAD_REQUEST);
        }
    }

    //Publico mi indice en gempresa
    @Post('post-in-gempresa')
    async sendIndiceToGempresa() {
        try {
            return await this.indiceService.sendIndiceToGempresa();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: error.message || 'Error al publicar el índice',
            }, HttpStatus.BAD_REQUEST);
        }
    }
}
