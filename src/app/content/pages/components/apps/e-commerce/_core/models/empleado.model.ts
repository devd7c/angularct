import { BaseModel } from './_base.model';
// import { ProductSpecificationModel } from './product-specification.model';
// import { ProductRemarkModel } from './product-remark.model';

export class EmpleadoModel extends BaseModel {
	data: any;
	id: number;
	tipo_doc: number; // 1=CI, 2=RUN, 3=Pasaporte, 4=Carnet de extranjero o 5=Otro
	nro_doc: string;
	exp_doc: string; // Ejm: LP = La Paz
	afiliacion: number; // 1=Previsión, 2=Futuro de Bolivia y 3=Otra
	nua_cua: string;
	ap_paterno: string;
	ap_materno: string;
	ap_casada: string;
	nombre: string;
	nacionalidad: string;
	fecha_nacimiento: string;
	fNacimiento: Date;
	sexo: number; // 1=F, 0=M
	jubilado: number; // 1=Si, 0=No
	fecha_ingreso: string;
	fIngreso: Date;
	fecha_retiro: string;
	fRetiro: Date;
	haber_basico: number = 2;
	nro_matricula: string; // 0 = Active | 1 = Suspended | Pending = 2
	categoria: string;
	domicilio: string;
	obrero: number; // 0 = Obrero | 1 = Empleado
	empresa_id: number;
	sucursal_id: number;
	contrato_id: number;
	puesto_id: number;
	cargo_id: number;

	// _specs: ProductSpecificationModel[];
	// _remarks: ProductRemarkModel[];

	clear() {
		this.tipo_doc = 0;
		this.nro_doc = '';
		this.exp_doc = '';
		this.afiliacion = 0;
		this.nua_cua = '';
		this.ap_paterno = '';
		this.ap_materno = '';
		this.ap_casada = '';
		this.nombre = '';
		this.nacionalidad = '';
		this.fNacimiento = new Date();
		this.sexo = 0;
		this.jubilado = 0;
		this.fIngreso = new Date();
		this.fRetiro = new Date();
		this.haber_basico = 0;
		this.nro_matricula = '';
		this.categoria = '';
		this.domicilio = '';
		this.obrero = 0;
		this.empresa_id = 0;
		this.sucursal_id = 0;
		this.contrato_id = 0;
		this.puesto_id = 0;
		this.cargo_id = 0;
	}
}
