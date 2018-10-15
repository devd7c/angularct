import { BaseModel } from './_base.model';

export class ThoraModel  extends BaseModel {
	id: number;
	cantidad: number;
	monto: number = 2;
	fecha: string;
	fHora: Date;
	descripcion: string;
	hora_id: number;

	// Refs
	/*_carName: string;
	_specificationName: string;*/

	clear(hora_id: number) {
		this.id = undefined;
		this.hora_id = hora_id;
		this.cantidad = 0;
		this.monto = 0;
		this.fHora = new Date();
		this.descripcion = '';
	}
}
