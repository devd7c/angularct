import { BaseModel } from './_base.model';

export class TbonoModel  extends BaseModel {
	id: number;
	cantidad: number;
	monto: number = 2;
	fecha: string;
	fBono: Date;
	descripcion: string;
	bono_id: number;

	// Refs
	/*_carName: string;
	_specificationName: string;*/

	clear(bono_id: number) {
		this.id = undefined;
		this.bono_id = bono_id;
		this.cantidad = 0;
		this.monto = 0;
		this.fBono = new Date();
		this.descripcion = '';
	}
}
