import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Empresa {
    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    codempresa: string;

    @Prop({ required: true })
    empresaNombre: string;

    @Prop({ required: true, type: Number })
    cotizationInicial: number;

    @Prop({ required: true, type: Number })
    cantidadAcciones: number;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);