import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa } from '../models/schemas/empresa.schema';
import { forkJoin, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { baseURL } from 'src/axios/config.gempresa';
import { empresasList } from '../models/empresas-mock-list';
@Injectable()
export class EmpresaService {

    constructor(
        @InjectModel(Empresa.name) private empresaModel: Model<Empresa>,
        private readonly httpService: HttpService,
    ) { }

    async getAllEmpresas() {
        try {
            // Crear una lista de observables para las llamadas de cada empresa
            const llamadasEmpresas = empresasList.map((empresa) =>
                this.httpService.get(`${baseURL}/empresas/${empresa}/details`)
            );

            // Usar `forkJoin` para ejecutar todas las llamadas en paralelo y luego convertir la respuesta a una promesa
            const responses = await lastValueFrom(forkJoin(llamadasEmpresas));

            // Extraer los datos de cada respuesta y retornarlos
            const data = responses.map((resp: any) => resp.data);
            console.log(data);  // Muestra la respuesta en consola
            return data;  // Retorna la data directamente

        } catch (error) {
            console.error("Error fetching empresas:", error);
            throw error;
        }
    }

    async getAndSaveEmpresaByCod(cod: string): Promise<Empresa> {
        try {
            const response$ = this.httpService.get(`${baseURL}/empresas/${cod}/details`);
            console.log("response$", response$)
            if (response$) {
                const empresaData = await lastValueFrom(response$).then((resp) => console.log("resp.data", resp.data));
                // if (empresaData) {
                console.log("empresaData", empresaData);
                const newEmpresa = new this.empresaModel(empresaData);
                const savedEmpresa = await newEmpresa.save();
                return savedEmpresa;
                // }
            }
        } catch (error) {
            console.error('Error al obtener y guardar la empresa: ', error);
            throw new InternalServerErrorException('Error al obtener las empresas');
        }
    }
}