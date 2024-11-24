import { HydratedDocument } from "mongoose";
import { IIndice } from "../interface/indice.interface";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type IndiceDocument = HydratedDocument<IIndice>;
@Schema()
export class Indice {
    @Prop({ required: true, unique: true })
    id: number;
    @Prop({ required: true })
    code: string;
    @Prop({ required: true })
    name: string;
}
export const EmpresaSchema = SchemaFactory.createForClass(Indice);
