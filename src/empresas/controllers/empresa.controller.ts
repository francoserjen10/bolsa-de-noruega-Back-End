import { Controller } from '@nestjs/common';
import { EmpresaService } from '../services/empresa.service';

@Controller('empresa')
export class EmpresaController {

    constructor(private empresaService: EmpresaService) { }
}
