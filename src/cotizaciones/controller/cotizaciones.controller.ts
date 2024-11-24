import { Controller, Get, Param, Query } from '@nestjs/common';
import { CotizacionesService } from '../services/cotizaciones.service';
import { Cotizacion } from '../models/schemas/cotizacion';
import { error } from 'console';

@Controller('cotizaciones')
export class CotizacionesController {

    constructor(private cotizacionesService: CotizacionesService) { }

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
}
