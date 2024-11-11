import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './empresas/models/schemas/empresa.schema';
import { EmpresaService } from './empresas/services/empresa.service';
import { EmpresaController } from './empresas/controllers/empresa.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CotizacionesController } from './cotizaciones/controller/cotizaciones.controller';
import { CotizacionesService } from './cotizaciones/services/cotizaciones.service';
import { Cotizacion, CotizacionSchema } from './cotizaciones/models/schemas/cotizacion';
import { CronService } from './services/cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.API_MONGO_DB),
    MongooseModule.forFeature([
      {
        name: Empresa.name,
        schema: EmpresaSchema
      },
      {
        name: Cotizacion.name,
        schema: CotizacionSchema
      }
    ]),
    HttpModule,
  ],
  controllers: [AppController, EmpresaController, CotizacionesController],
  providers: [AppService, EmpresaService, CotizacionesService, CronService],
  exports: []
})
export class AppModule { }
