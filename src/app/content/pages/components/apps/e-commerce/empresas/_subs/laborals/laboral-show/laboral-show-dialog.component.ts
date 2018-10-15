import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import * as _moment from 'moment';
import { LaboralsService } from '../../../../_core/services/laborals.service';
import { LaboralModel } from '../../../../_core/models/laboral.model';

@Component({
	selector: 'm-laboral-show-dialog',
	templateUrl: './laboral-show-dialog.component.html',
	providers: []
})
export class LaboralShowDialogComponent implements OnInit {
	public checked = true;
	public isActivo: boolean = true;
	public laboral: LaboralModel;
	public smn;
	public civ;
	public si;
	public comision_afp;
	public provivienda;
	public iva;
	public asa;
	public ans_13;
	public ans_25;
	public ans_35;
	public cba_1;
	public cba_2;
	public cba_3;
	public cba_4;
	public cba_5;
	public cba_6;
	public cba_7;
	public activo;
	public empresaId;
	public laboralId;
	// extras
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	constructor(
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<LaboralShowDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private laboralsService: LaboralsService) {}

	ngOnInit() {
		this.empresaId = +this.data.id.toString();
		this.laboralId = +this.data.idLaboral.toString();

		if (this.empresaId !== 0) {
			this.laboralsService.getActiveLaboralByIdEmpresa(this.empresaId).subscribe(res => {
				this.laboral = res;
				this.generateData(this.laboral);
			});
		}

		if (this.laboralId !== 0) {
			this.laboralsService.getLaboralById(this.laboralId).subscribe(res => {
				this.laboral = res;
				this.generateData(this.laboral);
			});
		}
	}

	generateData(laboral: LaboralModel) {
		laboral = laboral;

		this.smn = laboral.smn;
		this.civ = laboral.civ;
		this.si = laboral.si;
		this.comision_afp = laboral.comision_afp;
		this.provivienda = laboral.provivienda;
		this.iva = laboral.iva;
		this.asa = laboral.asa;
		this.ans_13 = laboral.ans_13;
		this.ans_25 = laboral.ans_25;
		this.ans_35 = laboral.ans_35;
		this.cba_1 = laboral.cba_1;
		this.cba_2 = laboral.cba_2;
		this.cba_3 = laboral.cba_3;
		this.cba_4 = laboral.cba_4;
		this.cba_5 = laboral.cba_5;
		this.cba_6 = laboral.cba_6;
		this.cba_7 = laboral.cba_7;
		this.activo = laboral.activo;
		console.log(this.activo);
		this.getValue();
	}
	getValue() {
		return this.checked = false;
	}
	onNoClick(): void {
		this.dialogRef.close();
	}
}
