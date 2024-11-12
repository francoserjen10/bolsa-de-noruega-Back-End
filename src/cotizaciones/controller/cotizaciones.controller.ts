import { Controller, Get, Param, Query } from '@nestjs/common';
import { CotizacionesService } from '../services/cotizaciones.service';
import { Cotizacion } from '../models/schemas/cotizacion';
import { error } from 'console';

@Controller('cotizaciones')
export class CotizacionesController {

    constructor(private cotizacionesService: CotizacionesService) { }

    @Get()
    async getAllCotizaciones(): Promise<Cotizacion[][]> {
        try {
            const serviceResponse = this.cotizacionesService.getAllCotizaciones();
            console.log("serviceResponse controller", serviceResponse);
            return serviceResponse;
        } catch {
            throw error;
        }
    }

    @Get('by-date/:cod/:startDate/:endDate')
    async getAllCotizacionesByDate(@Param('cod') cod: string, @Param('startDate') startDate: string, @Param('endDate') endDate: string): Promise<Cotizacion[]> {
        try {
            const respones = this.cotizacionesService.getCotizacionesByEmpresaAndDateRange(cod, startDate, endDate);
            console.log("controller", respones);
            return respones;
        } catch {
            throw error;
        }
    }

    @Get('by-date-and-hour/:cod/:date/:hour')
    async getCotizacionesByDateAndHour(@Param('cod') cod: string, @Param('date') date: string, @Param('hour') hour: string): Promise<Cotizacion> {
        try {
            const respones = this.cotizacionesService.getCotizacionByDateAndHour(cod, date, hour);
            console.log("controller", respones);
            return respones;
        } catch {
            throw error;
        }
    }
}
