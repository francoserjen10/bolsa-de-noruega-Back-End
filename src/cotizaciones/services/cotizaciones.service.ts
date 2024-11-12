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

    // Obtengo cotizaciones por rango de fecha y codigo de empresa
    async getCotizacionesByEmpresaAndDateRange(cod: string, startDate: string, endDate: string): Promise<Cotizacion[]> {
        try {
            //Verificar si el cod empresa existe 
            const empresa = await this.empresaModel.findOne({ codempresa: cod });
            //Si no exites erro
            if (!empresa) {
                throw new Error(`La empresa con código: ${cod} no se encuentra registrada.`);
            }
            // Si existe, accede a la url
            const response$ = this.httpService.get(`${baseURL}/empresas/${cod}/cotizaciones?fechaDesde=${startDate}&fechaHasta=${endDate}`);
            // Obtengo la data
            const responesData = await lastValueFrom(response$).then((value) => value.data);
            //Verifico si existe la data
            if (responesData.lenght === "") {
                throw new Error(`No se encuentran las cotizaciones.`);
            }
            // Recorro las cotizaciones en una sola peticion
            const savedCotizaciones = await Promise.all(
                responesData.map(async (cotData) => {
                    //Me retorna el objeto cotizaciones (Con codEmpresa)
                    return ({
                        ...cotData,
                        empresa: empresa.codempresa
                    });
                })
            );
            // Filtrar valores nulos (en caso de cotizaciones duplicadas)
            return savedCotizaciones;
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