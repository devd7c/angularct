import { BaseModel } from './_base.model';

export class ProductRemarkModel extends BaseModel {
	id: number;
	nombre: string;
	direccion: string;
	nit: string;
	ciudad: string;
	fono: string;
	nroPat: string;
	idEmpresa: number;
	/** ---------- */
	/*carId: number;
	text: string;
	type: number; // Info, Note, Reminder
	dueDate: string;*/

	// Refs
	_empresaNombre: string;
	//_carName: string;

	clear(/*carId: number, */idEmpresa: number) {
		this.id = undefined;
		this.idEmpresa = idEmpresa;
		this.nombre = '';
		this.direccion = '';
		this.nit = '';
		this.ciudad = '';
		this.fono = '';
		this.nroPat = '';
		/** --------- */
		/*this.carId = carId;
		this.text = '';
		this.type = 0;
		this.dueDate = '';*/
	}
}
