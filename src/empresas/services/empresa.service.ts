import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa } from '../models/schemas/empresa.schema';
@Injectable()
export class EmpresaService {

    constructor(
        @InjectModel(Empresa.name) private empresaModel: Model<Empresa>
    ) { }

    async getAllEmpresas(): Promise<Empresa[]> {
        const empresas = this.empresaModel.find().exec();
        return empresas;
    }
}