import { BaseModel } from './_base.model';

export class PeriodoModel extends BaseModel {
	data: any;
	id: number;
    inicio_mes: string; // 2018-01-01
    iMes: Date;
    fin_mes: string; // 2018-01-01
    fMes: Date;
    procesado: number; // 1=Si, 2=No
    cierre: number; // //1=Si, 2=No
    cierre_ufv: number = 2; // Ejem: 2.14454
    gestion_id: number;
	clear() {
		this.iMes = new Date();
		this.fMes = new Date();
        this.procesado = 0;
        this.cierre = 0;
        this.cierre_ufv = 0;
        this.gestion_id = 0;
	}
}
