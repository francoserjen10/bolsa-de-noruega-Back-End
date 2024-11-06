import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './empresas/schemas/empresa.schema';
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
  controllers: [AppController],
  providers: [AppService],
  exports: []
})
export class AppModule { }
