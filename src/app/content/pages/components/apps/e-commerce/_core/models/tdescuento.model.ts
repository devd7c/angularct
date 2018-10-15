import { BaseModel } from './_base.model';

export class TdescuentoModel  extends BaseModel {
	id: number;
	monto: number = 2;
	fecha: string;
	fDescuento: Date;
	descripcion: string;
	descuento_id: number;

	// Refs
	/*_carName: string;
	_specificationName: string;*/

	clear(descuento_id: number) {
		this.id = undefined;
		this.descuento_id = descuento_id;
		this.monto = 0;
		this.fDescuento = new Date();
		this.descripcion = '';
	}
}
