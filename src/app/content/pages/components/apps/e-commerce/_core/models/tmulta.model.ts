import { BaseModel } from './_base.model';

export class TmultaModel  extends BaseModel {
	id: number;
	monto: number = 2;
	fecha: string;
	fMulta: Date;
	descripcion: string;
	multa_id: number;

	// Refs
	/*_carName: string;
	_specificationName: string;*/

	clear(multa_id: number) {
		this.id = undefined;
		this.multa_id = multa_id;
		this.monto = 0;
		this.fMulta = new Date();
		this.descripcion = '';
	}
}
