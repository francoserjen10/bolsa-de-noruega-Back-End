import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EmpresaService } from '../services/empresa.service';
import { Empresa } from '../models/schemas/empresa.schema';
// import { Empresa } from '../models/entities/empresa.entity';

@Controller('empresa')
export class EmpresaController {

    constructor(private empresaService: EmpresaService) { }

    @Get()
    async getAllEmpresas(): Promise<Empresa[]> {
        return await this.empresaService.getAllEmpresas();
    }

    @Get('/:codEmp')
    async getAll(@Param('codEmp') codEmp: string): Promise<Empresa> {
        return this.empresaService.getEmpresaByCod(codEmp)
    }
}
