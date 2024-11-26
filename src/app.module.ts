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
import { IndiceController } from './indices/controllers/indice.controller';
import { IndiceService } from './indices/services/indice.service';
import { Indice, IndiceSchema } from './indices/models/schemas/indice.schema';
import { ValueIndice, ValueIndiceSchema } from './indices/models/schemas/value-indice';

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
      },
      {
        name: Indice.name,
        schema: IndiceSchema
      },
      {
        name: ValueIndice.name,
        schema: ValueIndiceSchema
      },
    ]),
    HttpModule,
  ],
  controllers: [AppController, EmpresaController, CotizacionesController, IndiceController],
  providers: [AppService, EmpresaService, CotizacionesService, CronService, IndiceService],
  exports: []
})
export class AppModule { }
