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

    async verifyIfExistIndice(): Promise<ICotizacion[]> {
        try {
            const ultimoIndice = await this.valueIndiceModel.findOne().sort({ fechaDate: -1 });
            if (ultimoIndice === null) {
                const allCotizaciones: ICotizacion[] = await this.cotizacionModel.find();
                if (!allCotizaciones.length) {
                    console.log("No hay cotizaciones disponibles en la base de datos.");
                    return [];
                }
                this.calcularIndiceBursatil(allCotizaciones, "BRN");
            } else {
                const calculatedCotizacion = await this.cotizacionModel.findOne({ fecha: ultimoIndice.fecha, hora: ultimoIndice.hora });
                if (calculatedCotizacion) {
                    const cotizacionesToCalculate: ICotizacion[] = await this.cotizacionModel.find({
                        $or: [
                            {
                                fecha: { $gt: ultimoIndice.fecha }
                            },
                            {
                                fecha: ultimoIndice.fecha,
                                hora: { $gt: ultimoIndice.hora }
                            }
                        ]
                    });
                    this.calcularIndiceBursatil(cotizacionesToCalculate, "BRN");
                }
            }
        } catch (error) {
            console.error("Error en verifyIfExistIndice:", error);
            throw new Error("Error al verificar si existen índices.");
        }
    }

    async calcularIndiceBursatil(cotizaciones: ICotizacion[], indice: string): Promise<IValueIndice[]> {
        const cotizacionesPorDiaYHora: Record<string, number[]> = cotizaciones.reduce((acc, cotizacion) => {
            const fechaHora: string = `${cotizacion.fecha} ${cotizacion.hora}`;
            if (!acc[fechaHora]) {
                acc[fechaHora] = [];
            }
            acc[fechaHora].push(cotizacion.cotization);
            return acc;
        }, {} as Record<string, number[]>);
        const indicesPorHora = Object.keys(cotizacionesPorDiaYHora).map(fechaHora => {
            const [fecha, hora] = fechaHora.split(" ");
            const sumaCotizaciones = cotizacionesPorDiaYHora[fechaHora].reduce((acc, curr) => acc + curr, 0);
            const cantidadCotizaciones = cotizacionesPorDiaYHora[fechaHora].length;
            const valor = parseFloat((sumaCotizaciones / cantidadCotizaciones).toFixed(2));
            return {
                valor,
                fecha,
                hora,
                fechaDate: new Date(`${fecha}T${hora}:00Z`),
                codIndice: indice
            };
        });
        const savedIndices: IValueIndice[] = await this.valueIndiceModel.insertMany(indicesPorHora);
        console.log("Índices calculados y guardados:", savedIndices);
        return savedIndices;
    }
}
