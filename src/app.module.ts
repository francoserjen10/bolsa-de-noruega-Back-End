import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './empresas/schemas/empresa.schema';
import { EmpresaService } from './empresas/services/empresa.service';
import { EmpresaController } from './empresas/controllers/empresa.controller';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017'),
    MongooseModule.forFeature([
      {
        name: Empresa.name,
        schema: EmpresaSchema
      }
    ])
  ],
  controllers: [AppController, EmpresaController],
  providers: [AppService, EmpresaService],
  exports: []
})
export class AppModule { }
