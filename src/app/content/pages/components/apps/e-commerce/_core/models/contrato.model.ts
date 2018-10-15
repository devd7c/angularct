import { BaseModel } from './_base.model';

export class ContratoModel extends BaseModel {
    data: any;
	id: number;
    nombre: string;
    descripcion: string;

    clear() {
        this.id = undefined;
        this.nombre = '';
        this.descripcion = '';
    }
}
