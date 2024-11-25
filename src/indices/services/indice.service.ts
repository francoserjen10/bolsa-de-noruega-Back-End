import { Injectable } from '@nestjs/common';
import { IIndice } from '../models/interface/indice.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Indice } from '../models/schemas/indice.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { baseURL } from 'src/axios/config.gempresa';
import { forkJoin, lastValueFrom } from 'rxjs';

@Injectable()
export class IndiceService {

    constructor(@InjectModel(Indice.name) private indiceModel: Model<Indice>, private readonly httpService: HttpService) { }

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
