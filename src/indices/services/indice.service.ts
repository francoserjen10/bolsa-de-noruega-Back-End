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

    async postIndiceBursatilInGempresa(): Promise<IValueIndice[]> {
        try {
            const allIndicesBursatilLocal: IValueIndice[] = await this.getAllMyIndicesBursatiles();
            if (!allIndicesBursatilLocal.length) {
                console.log("No hay índices bursátiles en local para enviar.");
                return [];
            }
            const missingIndices: IValueIndice[] = await this.filterIndicesBursatilesMissing(allIndicesBursatilLocal);
            if (!missingIndices.length) {
                console.log("No hay índices bursátiles faltantes para enviar.");
                return [];
            }
            const batchSize = 50;
            const batches = [];
            for (let i = 0; i < missingIndices.length; i += batchSize) {
                batches.push(missingIndices.slice(i, i + batchSize));
            }
            const savedIndicesBursatiles: IValueIndice[] = [];
            for (const batch of batches) {
                const batchResults = await Promise.all(batch.map(async (indBur) => {
                    const createIndice: IValueIndice = {
                        fecha: indBur.fecha,
                        hora: indBur.hora,
                        codigoIndice: indBur.codigoIndice,
                        valorIndice: indBur.valorIndice
                    };
                    const response = this.httpService.post(`${baseURL}/indices/cotizaciones`, createIndice);
                    const responeData = await lastValueFrom(response).then((value) => value.data);
                    return responeData;
                })
                );
                savedIndicesBursatiles.push(...batchResults);
            }
            return savedIndicesBursatiles;
        } catch (error) {
            console.error("Error al enviar índices bursátiles:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }
            return [];
        }
    }


    async getAllMyIndicesBursatiles(): Promise<IValueIndice[]> {
        try {
            const allMyIndicesBursatiles: IValueIndice[] = await this.valueIndiceModel.find();
            if (allMyIndicesBursatiles.length <= 0) {
                throw new Error("No se encontraron índices bursátiles en la base de datos.");
            }
            return allMyIndicesBursatiles;
        } catch (error) {
            console.error("Error al traer los valores del indice bursatil", error);
            throw new Error("Error al obtener mis indices bursatiles.");
        }
    }

    async filterIndicesBursatilesMissing(allIndicesBursatilLocal: IValueIndice[]) {
        try {
            // Obtener índices existentes del servidor
            const existingIngices: IValueIndice[] = await lastValueFrom(
                this.httpService.get(`http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/indices/BRN/cotizaciones?fechaDesde=2024-01-01T01%3A00&fechaHasta=2025-01-01T00%3A00`)
            ).then((res) => res.data);
            const missingIndices: IValueIndice[] = allIndicesBursatilLocal.filter((indicelocal) => !existingIngices.some((indiceGempresa) => indiceGempresa.hora === indicelocal.hora && indiceGempresa.fecha === indicelocal.fecha));
            if (!missingIndices.length) {
                console.log("No hay índices nuevos para enviar.");
                return [];
            }
            return missingIndices;
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error al filtrar los índices bursátiles:", error.message);
            } else {
                console.error("Error desconocido al filtrar los índices bursátiles:", error);
            }
            return [];
        }
    }

    async verifyIfExistIndice(): Promise<ICotizacion[]> {
        try {
            const lastIndice = await this.valueIndiceModel.findOne().sort({ fechaDate: -1 });
            if (lastIndice === null) {
                const allCotizaciones: ICotizacion[] = await this.cotizacionModel.find();
                const cotizacionesInMarketHours: ICotizacion[] = this.filterByMarketHours(allCotizaciones);
                if (!allCotizaciones.length) {
                    console.log("No hay cotizaciones disponibles en la base de datos.");
                    return [];
                }
                this.calculateAndSaveIndiceBursatilInGempresa(cotizacionesInMarketHours, "BRN");
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
                    const cotizacionesInMarketHours: ICotizacion[] = this.filterByMarketHours(cotizacionesToCalculate);
                    this.calculateAndSaveIndiceBursatilInGempresa(cotizacionesInMarketHours, "BRN");
                }
            }
        } catch (error) {
            console.error("Error en verifyIfExistIndice:", error);
            throw new Error("Error al verificar si existen índices.");
        }
    }

    filterByMarketHours(cotizaciones: ICotizacion[]): ICotizacion[] {
        return cotizaciones.filter((cotMarket) => {
            const hour = parseInt(cotMarket.hora);
            return hour >= 8 && hour <= 15;
        });
    }

    async calculateAndSaveIndiceBursatilInGempresa(cotizaciones: ICotizacion[], indice: string): Promise<IValueIndice[]> {
        try {
            const cotizacionesByDayAndHour: Record<string, number[]> = cotizaciones.reduce((acc, cotizacion) => {
                const dateTime: string = `${cotizacion.fecha} ${cotizacion.hora}`;
                if (!acc[dateTime]) {
                    acc[dateTime] = [];
                }
                acc[dateTime].push(cotizacion.cotization);
                return acc;
            }, {} as Record<string, number[]>);
            const indicesByHour: IValueIndice[] = Object.keys(cotizacionesByDayAndHour).map(fechaHora => {
                const [fecha, hora] = fechaHora.split(" ");
                const sumCotizaciones = cotizacionesByDayAndHour[fechaHora].reduce((acc, curr) => acc + curr, 0);
                const amountOfCotizaciones = cotizacionesByDayAndHour[fechaHora].length;
                const value = parseFloat((sumCotizaciones / amountOfCotizaciones).toFixed(2));
                return {
                    codigoIndice: indice,
                    fecha,
                    hora,
                    fechaDate: new Date(`${fecha}T${hora}:00Z`),
                    valorIndice: value
                };
            });
            return this.saveIndicesBursatilesToDatabase(indicesByHour)
        } catch (error) {
            console.error("Error al calcular o guardar los índices:", error);
            throw new Error("Error al procesar las cotizaciones y enviar los índices.");
        }
    }

    private async saveIndicesBursatilesToDatabase(indicesBursatiles: IValueIndice[]): Promise<IValueIndice[]> {
        try {
            const savedIndBursatiles: IValueIndice[] = await this.valueIndiceModel.insertMany(indicesBursatiles);
            console.log("Indices bursatiles guardados exitosamente en la base de datos.", savedIndBursatiles);
            return savedIndBursatiles;
        } catch (error) {
            console.error("Error al guardar las cotizaciones en la base de datos:", error);
            throw new Error("No se pudo guardar las cotizaciones en la base de datos.");
        }
    }

    // creo mi indice
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
            const savedIndices: IIndice[] = await this.saveAllIndicesOfGempresa(indicesWithValues);
            return savedIndices;
        } catch (error) {
            console.error("Error al guardar los índices en MongoDB:", error.message);
            throw new Error("Error al guardar los índices en MongoDB.");
        }
    }

    async saveAllIndicesOfGempresa(indices: IIndice[]): Promise<IIndice[]> {
        const savedIndices = await Promise.all(
            indices.map(async (i: IIndice) => {
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
    }

    async getAllIndicesInLocal() {
        try {
            const indice = await this.indiceModel.find();
            if (!indice.length) {
                throw new Error('No se encontraron índices en la base de datos.');
            }
            return indice;
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error al obtener los índices:", error.message);
            } else {
                console.error("Error desconocido al obtener los índices:", error);
            }
            throw new Error('Hubo un problema al obtener los índices de la base de datos.');
        }
    }
}
