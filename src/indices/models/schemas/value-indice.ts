
import { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IValueIndice } from "../interface/value-indice.interface";

export type ValueIndiceDocument = HydratedDocument<IValueIndice>;
@Schema()
export class ValueIndice {
    @Prop({ type: Number, required: true })
    valorIndice: number;
    @Prop({ type: String, required: true })
    fecha: string;
    @Prop({ type: String, required: true })
    hora: string;
    @Prop({ type: Date, required: true })
    fechaDate: Date;
    @Prop({ type: String, required: true })
    codigoIndice: string
}
export const ValueIndiceSchema = SchemaFactory.createForClass(ValueIndice);
