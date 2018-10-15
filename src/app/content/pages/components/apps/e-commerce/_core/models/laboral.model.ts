import { BaseModel } from './_base.model';

export class LaboralModel extends BaseModel {
	data: any;
    id: number;
    smn: number = 2;
    civ: number = 2;
    si: number = 2;
    comision_afp: number = 2;
    provivienda: number = 2;
    iva: number = 2;
    asa: number = 2;
    ans_13: number = 2;
    ans_25: number = 2;
    ans_35: number = 2;
    cba_1: number = 2;
    cba_2: number = 2;
    cba_3: number = 2;
    cba_4: number = 2;
    cba_5: number = 2;
    cba_6: number = 2;
    cba_7: number = 2;
    activo: number; // 1=Si, 2=No
    empresa_id: number;
	clear(empresa_id: number) {
        this.smn = 0;
        this.civ = 0;
        this.si = 0;
        this.comision_afp = 0;
        this.provivienda = 0;
        this.iva = 0;
        this.asa = 0;
        this.ans_13 = 0;
        this.ans_25 = 0;
        this.ans_35 = 0;
        this.cba_1 = 0;
        this.cba_2 = 0;
        this.cba_3 = 0;
        this.cba_4 = 0;
        this.cba_5 = 0;
        this.cba_6 = 0;
        this.cba_7 = 0;
        this.activo = 0;
        this.empresa_id = empresa_id;
	}
}
