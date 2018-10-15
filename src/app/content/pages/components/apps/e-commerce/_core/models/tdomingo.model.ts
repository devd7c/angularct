import { BaseModel } from './_base.model';

export class TdomingoModel  extends BaseModel {
	id: number;
	cantidad: number;
	monto: number = 2;
	fecha: string;
	fDomingo: Date;
	descripcion: string;
	domingo_id: number;

	// Refs
	/*_carName: string;
	_specificationName: string;*/

	clear(domingo_id: number) {
		this.id = undefined;
		this.domingo_id = domingo_id;
		this.cantidad = 0;
		this.monto = 0;
		this.fDomingo = new Date();
		this.descripcion = '';
	}
}
