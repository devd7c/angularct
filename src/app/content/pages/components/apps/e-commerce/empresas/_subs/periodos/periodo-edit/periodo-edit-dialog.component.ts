import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import * as _moment from 'moment';
import { PeriodosService } from '../../../../_core/services/periodos.service';
import { PeriodoModel } from '../../../../_core/models/periodo.model';
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
	parse: {
	  dateInput: 'YYYY',
	},
	display: {
	  dateInput: 'YYYY',
	  monthYearLabel: 'YYYY',
	  dateA11yLabel: 'YYYY',
	  monthYearA11yLabel: 'YYYY',
	},
  };
@Component({
	selector: 'm-periodo-edit-dialog',
	templateUrl: './periodo-edit-dialog.component.html',
	providers: [
		{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
		{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
	]
})
export class PeriodoEditDialogComponent implements OnInit {
	// dateParse = new FormControl(moment());
	// selectedNameIdForUpdate = new FormControl('', Validators.required);
	inicioForUpdate = new FormControl('', Validators.required);
	finForUpdate = new FormControl('', Validators.required);
	procesadoForUpdate = new FormControl('', Validators.required);
	cierreForUpdate = new FormControl('', Validators.required);

	periodosTypes: PeriodoModel[] = [];

	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	public periodoId;

	constructor(public dialogRef: MatDialogRef<PeriodoEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private periodosService: PeriodosService
	) {
		// this.selectedNameIdForUpdate.setValue(this.data.id.toString());
		this.periodoId = +this.data.id.toString();
		this.inicioForUpdate.setValue(this.data.inicio_mes);
		this.finForUpdate.setValue(this.data.fin_mes);
		this.procesadoForUpdate.setValue(this.data.procesado);
		this.cierreForUpdate.setValue(this.data.cierre);

		this.periodosTypes = this.data.periodosTypes;
	}

	ngOnInit() {
		// setting the min date and thus the max birth date allowing < 100 year old choosable birthdate
		/* Server loading imitation. Remove this on real code */
		/*this.viewLoading = true;
		setTimeout(() => {
			this.viewLoading = false;
		}, 1500);*/
	}

	onNoClick(): void {
		this.dialogRef.close({ isUpdated : false });
	}

	save() {
		if (this.inicioForUpdate.invalid) { this.inicioForUpdate.markAsTouched(); return; }
		if (this.finForUpdate.invalid) { this.finForUpdate.markAsTouched(); return; }
		if (this.procesadoForUpdate.invalid) { this.procesadoForUpdate.markAsTouched(); return; }
		if (this.cierreForUpdate.invalid) { this.cierreForUpdate.markAsTouched(); return; }

		this.loadingAfterSubmit = true;
		// this.viewLoading = true;

		// const periodoId = +this.selectedNameIdForUpdate.value;
		/* Server loading imitation. Remove this on real code */
		// setTimeout(() => {
			// this.viewLoading = false;
		this.closeDialog(this.periodoId);
		// }, 1500);
	}

	closeDialog(periodoId) {
		this.dialogRef.close({
			isUpdated: true,
			id: periodoId,
			inicio_mes: this.inicioForUpdate.value,
			fin_mes: this.finForUpdate.value,
			procesado: this.procesadoForUpdate.value,
			cierre: this.cierreForUpdate.value,
			// _specificationName: this.getSpecificationsNameById(specId)
		});
	}

	/*getSpecificationsNameById(specId: number) {
		const s_index = _.findIndex(this.specificationsTypes, function (o) { return o.id === specId; });
		if (s_index > -1) {
			return this.specificationsTypes[s_index].name;
		}

		return '';
	}*/

	checkDataIsValid(): boolean {
		return this.inicioForUpdate.valid && this.finForUpdate.valid && this.procesadoForUpdate.valid && this.cierreForUpdate.valid;
	}
}
