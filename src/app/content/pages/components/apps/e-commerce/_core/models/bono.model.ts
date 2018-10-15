import { BaseModel } from './_base.model';
// import { ProductSpecificationModel } from './product-specification.model';
// import { ProductRemarkModel } from './product-remark.model';

export class BonoModel extends BaseModel {
	data: any;
	id: number;
	empleado_id: number;
	gestion_id: number;
	periodo_id: number;

	// _specs: ProductSpecificationModel[];
	// _remarks: ProductRemarkModel[];

	clear() {
		this.empleado_id = 0;
		this.gestion_id = 0;
		this.periodo_id = 0;
	}
}
