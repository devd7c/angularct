import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import * as _moment from 'moment';
import { PatronalsService } from '../../../../_core/services/patronals.service';
import { PatronalModel } from '../../../../_core/models/patronal.model';

@Component({
	selector: 'm-patronal-show-dialog',
	templateUrl: './patronal-show-dialog.component.html',
	providers: []
})
export class PatronalShowDialogComponent implements OnInit {
	public checked = true;
	public isActivo: boolean = true;
	public patronal: PatronalModel;
	public sarp;
	public provivienda;
	public infocal;
	public cnss;
	public sip;
	public activo;
	public empresaId;
	public patronalId;
	// extras
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	constructor(
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<PatronalShowDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private patronalsService: PatronalsService) {}

	ngOnInit() {
		this.empresaId = +this.data.id.toString();
		this.patronalId = +this.data.idPatronal.toString();

		if (this.empresaId !== 0) {
			this.patronalsService.getActivePatronalByIdEmpresa(this.empresaId).subscribe(res => {
				this.patronal = res;
				this.generateData(this.patronal);
			});
		}

		if (this.patronalId !== 0) {
			this.patronalsService.getPatronalById(this.patronalId).subscribe(res => {
				this.patronal = res;
				this.generateData(this.patronal);
			});
		}
	}

	generateData(patronal: PatronalModel) {
		patronal = patronal;

		this.sarp = patronal.sarp;
		this.provivienda = patronal.provivienda;
		this.infocal = patronal.infocal;
		this.cnss = patronal.cnss;
		this.sip = patronal.sip;
		this.activo = patronal.activo;
		// console.log(this.activo);
		this.getValue();
	}
	getValue() {
		return this.checked = false;
	}
	onNoClick(): void {
		this.dialogRef.close();
	}
}
