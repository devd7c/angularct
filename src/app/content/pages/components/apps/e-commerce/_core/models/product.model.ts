import { BaseModel } from './_base.model';
import { ProductSpecificationModel } from './product-specification.model';
import { ProductRemarkModel } from './product-remark.model';

export class ProductModel extends BaseModel {
	data: any;
	id: number;
	nombre: string;
	nit: string;
	nombreRepLegal: string;
	tituloRepLegal: string;
	tipoDoc: number;
	nroDoc: string;
	expedidoDoc: string;
	/**------------- */
	model: string;
	manufacture: string;
	modelYear: number;
	mileage: number;
	description: string;
	color: string;
	price: number;
	condition: number;
	status: number;
	VINCode: string;

	_specs: ProductSpecificationModel[];
	_remarks: ProductRemarkModel[];

	clear() {
		this.nombre = '';
		this.nit = '';
		this.nombreRepLegal = '';
		this.tituloRepLegal = '';
		this.tipoDoc = 0;
		this.nroDoc = '';
		this.expedidoDoc = '';
		/**--------- */
		this.model = '';
		this.manufacture = '';
		this.modelYear = 2000;
		this.mileage = 0;
		this.description = '';
		this.color = 'Black';
		this.price = 1000;
		this.condition = 0;
		this.status = 0;
		this.VINCode = '';
	}
}
