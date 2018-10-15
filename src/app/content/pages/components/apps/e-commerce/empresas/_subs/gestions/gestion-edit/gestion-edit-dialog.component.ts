import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import * as _moment from 'moment';
import { GestionsService } from '../../../../_core/services/gestions.service';
import { GestionModel } from '../../../../_core/models/gestion.model';
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
	selector: 'm-gestion-edit-dialog',
	templateUrl: './gestion-edit-dialog.component.html',
	providers: [
		{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
		{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
	]
})
export class GestionEditDialogComponent implements OnInit {
	// dateParse = new FormControl(moment());
	// selectedNameIdForUpdate = new FormControl('', Validators.required);
	inicioForUpdate = new FormControl('', Validators.required);
	rangoForUpdate = new FormControl('', Validators.required);
	activoForUpdate = new FormControl('', Validators.required);

	gestionsTypes: GestionModel[] = [];

	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	public gestionId;

	constructor(public dialogRef: MatDialogRef<GestionEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private gestionsService: GestionsService
	) {
		// this.selectedNameIdForUpdate.setValue(this.data.id.toString());
		this.gestionId = +this.data.id.toString();
		this.inicioForUpdate.setValue(this.data.periodo_inicio);
		this.rangoForUpdate.setValue(this.data.periodo_rango);
		this.activoForUpdate.setValue(this.data.activo);

		this.gestionsTypes = this.data.gestionsTypes;
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
		if (this.rangoForUpdate.invalid) { this.rangoForUpdate.markAsTouched(); return; }
		if (this.activoForUpdate.invalid) { this.activoForUpdate.markAsTouched(); return; }

		this.loadingAfterSubmit = true;
		// this.viewLoading = true;

		// const gestionId = +this.selectedNameIdForUpdate.value;
		/* Server loading imitation. Remove this on real code */
		// setTimeout(() => {
			// this.viewLoading = false;
		this.closeDialog(this.gestionId);
		// }, 1500);
	}

	closeDialog(gestionId) {
		this.dialogRef.close({
			isUpdated: true,
			id: gestionId,
			periodo_inicio: this.inicioForUpdate.value,
			periodo_rango: this.rangoForUpdate.value,
			activo: this.activoForUpdate.value,
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
		return this.inicioForUpdate.valid && this.rangoForUpdate.valid && this.activoForUpdate.valid;
	}
}
