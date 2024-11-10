import { Controller, Get, Param } from '@nestjs/common';
import { EmpresaService } from '../services/empresa.service';
import { Empresa } from '../models/schemas/empresa.schema';
import { error } from 'console';

@Controller('empresa')
export class EmpresaController {

    constructor(private empresaService: EmpresaService) { }

    @Get()
    async getAllEmpresas() {
        try {
            return await this.empresaService.getAllEmpresas();
        } catch {
            throw error;
        }
    }

    @Get(':cod')
    async getEmpresaById(@Param('cod') cod: string): Promise<Empresa> {
        try {
            return this.empresaService.getAndSaveEmpresaByCod(cod);
        } catch {
            throw error;
        }
    }
}