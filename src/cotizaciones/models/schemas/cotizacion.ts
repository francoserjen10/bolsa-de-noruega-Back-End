import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type IndiceDocument = HydratedDocument<Cotizacion>;

@Schema()
export class Cotizacion {
    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    fecha: string;

    @Prop({ required: true })
    hora: string;

    @Prop({ required: true })
    dateUTC: string;

    @Prop({ required: true, type: Number })
    cotization: number;

}
export const CotizacionSchema = SchemaFactory.createForClass(Cotizacion);