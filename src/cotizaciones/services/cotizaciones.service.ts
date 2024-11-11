import { Injectable } from '@nestjs/common';
import { Cotizacion } from '../models/schemas/cotizacion';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { baseURL } from 'src/axios/config.gempresa';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CotizacionesService {

    constructor(
        @InjectModel(Cotizacion.name) private cotizacionModel: Model<Cotizacion>,
        private readonly httpService: HttpService) { }

    //Modificar nombre
    async getCotizacionesByEmpresaAndDateRange(cod: string, startDate: string, endDate: string): Promise<Cotizacion[]> {
        try {
            const response$ = this.httpService.get(`${baseURL}/empresas/${cod}/cotizaciones?fechaDesde=${startDate}&fechaHasta=${endDate}`);
            // /empresas/AAPL/cotizaciones?fechaDesde=2024-11-06T19%3A00&fechaHasta=2024-11-08T20%3A00
            if (response$) {
                const responesData = await lastValueFrom(response$).then((value) => value.data);
                console.log("responesData", responesData)
                return responesData
            }
        } catch (error) {
            throw new error
        }
    }
}
