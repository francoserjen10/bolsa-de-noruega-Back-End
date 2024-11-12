import { Injectable } from '@nestjs/common';
import { Cotizacion } from '../models/schemas/cotizacion';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { baseURL } from 'src/axios/config.gempresa';
import { lastValueFrom } from 'rxjs';
import { Empresa } from 'src/empresas/models/schemas/empresa.schema';

@Injectable()
export class CotizacionesService {

    constructor(
        @InjectModel(Cotizacion.name) private cotizacionModel: Model<Cotizacion>,
        @InjectModel(Empresa.name) private empresaModel: Model<Empresa>,
        private readonly httpService: HttpService) { }

    //Modificar nombre
    async getCotizacionesByEmpresaAndDateRange(cod: string, startDate: string, endDate: string): Promise<Cotizacion[]> {
        try {
            const response$ = this.httpService.get(`${baseURL}/empresas/${cod}/cotizaciones?fechaDesde=${startDate}&fechaHasta=${endDate}`);
            const responesData = await lastValueFrom(response$).then((value) => value.data);
            if (responesData.lenght !== 0) {
                const empresa = await this.empresaModel.findOne({ codempresa: cod });
                if (!empresa) {
                    throw new Error(`La empresa con código: ${cod} no se encuentra registrada.`);
                }
                const savedCotizaciones = await Promise.all(
                    responesData.map(async (cotData) => {
                        const newCotizacion = new this.cotizacionModel({
                            ...cotData,
                            empresa: empresa.codempresa
                        });
                        return await newCotizacion.save();
                    })
                );
                return savedCotizaciones;
            } else {
                console.warn("No se encontraron cotizaciones en el rango de fechas especificado.");
                return []; // Retornar un arreglo vacío si no hay datos
            }
        } catch (error) {
            console.error("Error al obtener cotizaciones:", error);
            throw new Error("Error al obtener las cotizaciones desde la API Gempresa.");
        }
    }

    async getCotizacionByDateAndHour(cod: string, date: string, hour: string) {
        try {
            const response$ = this.httpService.get(`${baseURL}/empresas/${cod}/cotizacion?fecha=${date}&hora=${hour}`);
            if (response$) {
                const responesData = await lastValueFrom(response$).then((value) => value.data);
                console.log("responesData", responesData);
                return responesData;
            }
        } catch (error) {
            throw new error;
        }
    }

}
