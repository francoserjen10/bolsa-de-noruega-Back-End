import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { IIndice } from '../models/interface/indice.interface';
import { IndiceService } from '../services/indice.service';
import { IValueIndice } from '../models/interface/value-indice.interface';

@Controller('indice')
export class IndiceController {

    constructor(private indiceService: IndiceService) { }

    @Get()
    async getAllIndicesBursatilesInGempresa() {

    }

    @Get()
    async getAllMyIndicesBursatiles(): Promise<IValueIndice[]> {
        try {
            return await this.indiceService.getAllMyIndicesBursatiles();
        } catch (error) {
            console.error("Error en getAllMyIndicesBursatiles del controlador:", error);
            throw new HttpException(
                error.message || 'Error al obtener los índices bursátiles',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('all-indices-local')
    async getAllIndicesOfLocal(): Promise<IIndice[]> {
        try {
            return await this.indiceService.getAllIndicesInLocal();
        } catch (error) {
            console.error("Error en el controlador:", error.message);
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message || 'Error al obtener los índices desde la base de datos local',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    //Get de los indices de gempresa para cargar los que faltan subir
    @Get('all-indices-gempresa')
    async getAllIndicesOfGempresa(): Promise<IIndice[]> {
        try {
            return await this.indiceService.getAllIndicesOfGempresa();
        } catch (error) {
            console.error("Error en el controlador:", error.message);
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message || 'Error al obtener los índices desde la api de gempresa',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}