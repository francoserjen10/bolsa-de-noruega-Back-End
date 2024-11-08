import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './empresas/models/schemas/empresa.schema';
import { EmpresaService } from './empresas/services/empresa.service';
import { EmpresaController } from './empresas/controllers/empresa.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.API_BASE_URL2),
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
