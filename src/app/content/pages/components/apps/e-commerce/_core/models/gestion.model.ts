import { BaseModel } from './_base.model';

export class GestionModel extends BaseModel {
	data: any;
	id: number;
    periodo_inicio: string; // Ejem: 2018
    periodo_rango: string; // 1=Enero-Diciembre, 2=Abril-Marzo 3=Octubre-Septiembre
    activo: number; // 1=Si, 2=No
    empresa_id: number;
	clear(empresa_id: number) {
        this.periodo_inicio = '';
        this.periodo_rango = '';
        this.activo = 0;
        this.empresa_id = empresa_id;
	}
}
