import { BaseModel } from './_base.model';

export class PatronalModel extends BaseModel {
	data: any;
    id: number;
    sarp: number = 2;
    provivienda: number = 2;
    infocal: number = 2;
    cnss: number = 2;
    sip: number = 2;
    activo: number; // 1=Si, 2=No
    empresa_id: number;
	clear(empresa_id: number) {
        this.sarp = 0;
        this.provivienda = 0;
        this.infocal = 0;
        this.cnss = 0;
        this.sip = 0;
        this.activo = 0;
        this.empresa_id = empresa_id;
	}
}
