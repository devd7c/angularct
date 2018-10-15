import { BaseModel } from './_base.model';

export class SucursalModel extends BaseModel {
    data: any;
	id: number;
    nombre: string;
    direccion: string;
    nit: string;
    ciudad: string;
    fono: string;
    nro_pat: string;
    empresa_id: number;


    clear(empresa_id: number) {
        this.id = undefined;
        this.nombre = '';
        this.direccion = '';
        this.nit = '';
        this.ciudad = '';
        this.fono = '';
        this.nro_pat = '';
        this.empresa_id = empresa_id;
    }
}
