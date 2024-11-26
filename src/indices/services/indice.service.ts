import { Injectable } from '@nestjs/common';
import { IIndice } from '../models/interface/indice.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Indice } from '../models/schemas/indice.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { baseURL } from 'src/axios/config.gempresa';
import { lastValueFrom } from 'rxjs';
import { ICotizacion } from 'src/cotizaciones/models/interface/cotizacion.interface';
import { Cotizacion } from 'src/cotizaciones/models/schemas/cotizacion';
import { IValueIndice } from '../models/interface/value-indice.interface';
import { ValueIndice } from '../models/schemas/value-indice';

@Injectable()
export class IndiceService {

    constructor(
        private readonly httpService: HttpService,
        @InjectModel(Indice.name) private indiceModel: Model<Indice>,
        @InjectModel(Cotizacion.name) private cotizacionModel: Model<Cotizacion>,
        @InjectModel(ValueIndice.name) private valueIndiceModel: Model<ValueIndice>
    ) { }

    async getAllMyIndicesBursatiles(): Promise<IValueIndice[]> {
        try {
            const allIndices: IValueIndice[] = await this.valueIndiceModel.find();
            console.log('allIndices', allIndices);
            if (allIndices.length <= 0) {
                throw new Error("No se encontraron índices bursátiles en la base de datos.");
            }
            return allIndices;
        } catch (error) {
            console.error("Error al traer los valores del indice bursatil", error);
            throw new Error("Error al obtener mis indices bursatiles.");
        }
    }

    async verifyIfExistIndice(): Promise<ICotizacion[]> {
        try {
            const lastIndice = await this.valueIndiceModel.findOne().sort({ fechaDate: -1 });
            if (lastIndice === null) {
                const allCotizaciones: ICotizacion[] = await this.cotizacionModel.find();
                if (!allCotizaciones.length) {
                    console.log("No hay cotizaciones disponibles en la base de datos.");
                    return [];
                }
                this.calculateIndiceBursatil(allCotizaciones, "BRN");
            } else {
                const calculatedCotizacion = await this.cotizacionModel.findOne({ fecha: lastIndice.fecha, hora: lastIndice.hora });
                if (calculatedCotizacion) {
                    const cotizacionesToCalculate: ICotizacion[] = await this.cotizacionModel.find({
                        $or: [
                            {
                                fecha: { $gt: lastIndice.fecha }
                            },
                            {
                                fecha: lastIndice.fecha,
                                hora: { $gt: lastIndice.hora }
                            }
                        ]
                    });
                    this.calculateIndiceBursatil(cotizacionesToCalculate, "BRN");
                }
            }
        } catch (error) {
            console.error("Error en verifyIfExistIndice:", error);
            throw new Error("Error al verificar si existen índices.");
        }
    }

    async calculateIndiceBursatil(cotizaciones: ICotizacion[], indice: string): Promise<IValueIndice[]> {
        const cotizacionesByDayAndHour: Record<string, number[]> = cotizaciones.reduce((acc, cotizacion) => {
            const dateTime: string = `${cotizacion.fecha} ${cotizacion.hora}`;
            if (!acc[dateTime]) {
                acc[dateTime] = [];
            }
            acc[dateTime].push(cotizacion.cotization);
            return acc;
        }, {} as Record<string, number[]>);
        const indicesByHour = Object.keys(cotizacionesByDayAndHour).map(fechaHora => {
            const [fecha, hora] = fechaHora.split(" ");
            const sumCotizaciones = cotizacionesByDayAndHour[fechaHora].reduce((acc, curr) => acc + curr, 0);
            const amountOfCotizaciones = cotizacionesByDayAndHour[fechaHora].length;
            const value = parseFloat((sumCotizaciones / amountOfCotizaciones).toFixed(2));
            return {
                valor: value,
                fecha,
                hora,
                fechaDate: new Date(`${fecha}T${hora}:00Z`),
                codIndice: indice
            };
        });
        const savedIndices: IValueIndice[] = await this.valueIndiceModel.insertMany(indicesByHour);
        console.log("Índices calculados y guardados:", savedIndices);
        return savedIndices;
    }

    async createIndice(indice: IIndice): Promise<IIndice> {
        try {
            if (!indice.code || !indice.name) {
                throw new Error(`No se pudo crear el indice de ${indice.name}`);
            }
            const newIndice = new this.indiceModel(indice);
            return await newIndice.save();
        } catch (error) {
            console.error("Error al crear el indice:", error);
            throw new Error("Error al crear el indice.");
        }
    }

    async sendIndiceToGempresa(): Promise<IIndice> {
        try {
            const indice = await this.indiceModel.findOne({ name: "BORSEN" });
            if (!indice) {
                throw new Error("Índice no encontrado");
            }
            const body: IIndice = {
                code: indice.code,
                name: indice.name
            }
            const response = await lastValueFrom(this.httpService.post(`${baseURL}/indices`, body));
            return response.data;
        } catch (error) {
            console.error("Error al publicar mi indice:", error);
            if (error.response) {
                `Error de Gempresa: ${error.response.data?.message || error.message}`
            }
            throw new Error("Error al publicar mi indice.");
        }
    }

    async getAllIndicesOfGempresa(): Promise<IIndice[]> {
        try {
            const response = await lastValueFrom(this.httpService.get(`${baseURL}/indices`));
            if (!response || !response.data) {
                throw new Error('No se recibieron índices desde Gempresa');
            }
            const indicesWithValues: IIndice[] = response.data.filter((i: IIndice) => i.name && i.code);
            const savedIndices = await Promise.all(
                indicesWithValues.map(async (i: IIndice) => {
                    const existingIndice = await this.indiceModel.findOne({ code: i.code, name: i.name });
                    if (existingIndice) {
                        console.log(`Índice ya existe en la base de datos: ${i.code}`);
                        return null
                    }
                    const newIndice = new this.indiceModel(i);
                    const savedIndice = await newIndice.save();
                    return savedIndice;
                })
            );
            return savedIndices.filter(savedIndice => savedIndice !== null);
        } catch (error) {
            console.error("Error al guardar los índices en MongoDB:", error.message);
            throw new Error("Error al guardar los índices en MongoDB.");
        }
    }
}
