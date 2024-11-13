import { Injectable } from '@nestjs/common';
import { Cotizacion } from '../models/schemas/cotizacion';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { baseURL } from 'src/axios/config.gempresa';
import { lastValueFrom } from 'rxjs';
import { Empresa } from 'src/empresas/models/schemas/empresa.schema';
import { empresasList } from 'src/empresas/models/empresas-mock-list';

@Injectable()
export class CotizacionesService {

    constructor(
        @InjectModel(Cotizacion.name) private cotizacionModel: Model<Cotizacion>,
        @InjectModel(Empresa.name) private empresaModel: Model<Empresa>,
        private readonly httpService: HttpService) { }

    // Método auxiliar para guardar un conjunto de cotizaciones en mi db de MongoDB
    private async saveCotizacionesToDatabase(cotizaciones: Cotizacion[]): Promise<Cotizacion[]> {
        try {
            // Usamos insertMany para insertar el array completo en una sola operación
            const savedCotizaciones: Cotizacion[] = await this.cotizacionModel.insertMany(cotizaciones);
            console.log("Cotizaciones guardadas exitosamente en la base de datos.");
            return savedCotizaciones;
        } catch (error) {
            console.error("Error al guardar las cotizaciones en la base de datos:", error);
            throw new Error("No se pudo guardar las cotizaciones en la base de datos.");
        }
    }

    async getLastDate(): Promise<string> {
        try {
            const findLasDate = await this.cotizacionModel.findOne().sort({ fecha: -1 });
            if (findLasDate !== null) {
                return `${findLasDate.fecha}T${findLasDate.hora}`;
            } else {
                return '2023-12-31T23:00';
            }
        } catch (error) {
            console.error(error)
        }
    }

    // Guardar todas las cotizaciones de todas las empresas de una (Llamando a getCotizacionesByEmpresaAndDateRange)
    async getAllCotizaciones(): Promise<Cotizacion[][]> {
        try {
            const itinialDate = await this.getLastDate();
            let newDate = new Date();
            const formatedDate = newDate.toISOString().slice(0, 16);
            const allCotizacionesPromises = empresasList.map(async (emp) => {
                if (emp === '') {
                    throw new Error(`Codigo de empresa desconocido.`);
                }
                const cotizacionesForEmp = this.getCotizacionesByEmpresaAndDateRange(emp, itinialDate, formatedDate);
                return cotizacionesForEmp;
            });
            const allSavedCotizaciones = await Promise.all(allCotizacionesPromises);
            for (const cotizaciones of allSavedCotizaciones) {
                if (cotizaciones.length > 0) {
                    await this.saveCotizacionesToDatabase(cotizaciones)
                }
            }
            return allSavedCotizaciones;
        } catch (error) {
            console.error("Error, no se pudieron obtener todas las cotizaciones de todas las empresas:", error);
            throw new Error("Error al obtener las cotizaciones desde la API Gempresa.");
        }
    }

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
            const responeData = await lastValueFrom(response$).then((value) => value.data);
            //Verifico si existe la data
            if (responeData.lenght === "") {
                throw new Error(`No se encuentran las cotizaciones.`);
            }
            // Recorro las cotizaciones en una sola peticion
            const savedCotizaciones = await Promise.all(
                responeData.map(async (cotData) => {
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
            throw new Error("Error al obtener las cotizaciones por dia y por fehca desde la API Gempresa.");
        }
    }

}


// Se verifica si existe esta cotizacion en la base de datos
// const existCotizacion = await this.cotizacionModel.findOne({
//     empresa: empresa.codempresa,
//     fecha: cotData.fecha
// });
// if (existCotizacion) {
//     throw new Error(`La cotizacion para la empresa: ${cod} ya existe para la fecha ${cotData.fecha}.`);
// }

