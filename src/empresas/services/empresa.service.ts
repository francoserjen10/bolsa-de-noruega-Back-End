import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa } from '../models/schemas/empresa.schema';
import { IEmpresa } from '../models/interface/empresa.interface';
import { AxiosResponse } from 'axios';
import clienteAxios from 'axios';
import { baseURL } from 'src/services/axios/config';
@Injectable()
export class EmpresaService {

    constructor(
        @InjectModel(Empresa.name) private empresaModel: Model<Empresa>
    ) { }

    async getAllEmpresas(): Promise<Empresa[]> {
        const empresas = this.empresaModel.find().exec();
        return empresas;
    }

    async getEmpresaByCod(codEmpresa: string): Promise<Empresa> {
        try {
            const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/details`);

            console.log('respuesta.data:', respuesta.data)
            return respuesta.data;
        } catch (error) {
            console.log("error", error);
        }
    }
}