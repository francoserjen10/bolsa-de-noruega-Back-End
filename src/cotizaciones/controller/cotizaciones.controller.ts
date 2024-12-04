import { Controller, Get, Param, Query } from '@nestjs/common';
import { CotizacionesService } from '../services/cotizaciones.service';
import { Cotizacion } from '../models/schemas/cotizacion';
import { error } from 'console';

@Controller('cotizaciones')
export class CotizacionesController {

    constructor(private cotizacionesService: CotizacionesService) { }

    @Get('all-cotizaciones')
    async getAllCotizaciones(): Promise<Cotizacion[]> {
        try {
            const respones = this.cotizacionesService.getAllCotizaciones();
            return respones;
        } catch {
            throw error;
        }
    }
    // Por fecha y hora desde mi base de datos
    @Get('all-cotizaciones/:cod')
    async getCotizaciones(@Param('cod') cod: string): Promise<Cotizacion[]> {
        try {
            const respones = this.cotizacionesService.getCotizacionesInLocal(cod);
            console.log("controller", respones);
            return respones;
        } catch {
            throw error;
        }
    }
    @Get('all-latest-cotizaciones')
    async getLatestCotizacionesInLocal(): Promise<Cotizacion[]> {
        try {
            const respones = this.cotizacionesService.getLatestCotizacionesInLocal();
            console.log("Ultimas cotizaciones", respones);
            return respones;
        } catch {
            throw error;
        }
    }
}

