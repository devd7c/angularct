import { BaseModel } from './_base.model';
// import { ProductSpecificationModel } from './product-specification.model';
// import { ProductRemarkModel } from './product-remark.model';

export class RcivaModel extends BaseModel {
	data: any;
	id: number;
	haber_basico: number = 2;
	sueldo: number = 2;
	saldo: number = 2;
	factura: number = 2;
	ans: number = 2;
	sueldo_neto: number = 2;
	smn2: number = 2;
	base_imponible: number = 2;
	debito_fiscal: number = 2;
	credito_fiscal: number = 2;
	smn2_iva: number = 2;
	saldo_anterior: number = 2;
	saldo_anterior_actualizado: number = 2;
	saldo_anterior_nuevo: number = 2;
	impuesto_periodo: number = 2;
	credito_fiscal_dependiente: number = 2;
	gestion_id: number;
	periodo_id: number;
	empleado_id: number;

	clear() {
        this.id = undefined;
		this.haber_basico = 0;
		this.sueldo = 0;
		this.saldo = 0;
		this.factura = 0;
		this.ans = 0;
		this.sueldo_neto = 0;
		this.smn2 = 0;
		this.base_imponible = 0;
		this.debito_fiscal = 0;
		this.credito_fiscal = 0;
		this.smn2_iva = 0;
		this.saldo_anterior = 0;
		this.saldo_anterior_actualizado = 0;
		this.saldo_anterior_nuevo = 0;
		this.impuesto_periodo = 0;
		this.credito_fiscal_dependiente = 0;
		this.gestion_id = 0;
		this.periodo_id = 0;
		this.empleado_id = 0;
	}
}
