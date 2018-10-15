import { BaseModel } from './_base.model';

export class EmpresaModel extends BaseModel {
	data: any;
	id: number;
	nombre: string;
	nit: string;
	nombre_rep_legal: string;
	titulo_rep_legal: string;
	tipo_doc: number;
	nro_doc: string;
	exp_doc: string;
	clear() {
		this.nombre = '';
		this.nit = '';
		this.nombre_rep_legal = '';
		this.titulo_rep_legal = '';
		this.tipo_doc = 0;
		this.nro_doc = '';
		this.exp_doc = '';
	}
}
