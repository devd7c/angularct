import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import * as _moment from 'moment';
import { SucursalsService } from '../../../../_core/services/sucursals.service';
import { SucursalModel } from '../../../../_core/models/sucursal.model';
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
	selector: 'm-sucursal-edit-dialog',
	templateUrl: './sucursal-edit-dialog.component.html',
	providers: [
		{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
		{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
	]
})
export class SucursalEditDialogComponent implements OnInit {
	// dateParse = new FormControl(moment());
	// selectedNameIdForUpdate = new FormControl('', Validators.required);
	nombreForUpdate = new FormControl('', Validators.required);
	direccionForUpdate = new FormControl('', Validators.required);
	nitForUpdate = new FormControl('', Validators.required);
	ciudadForUpdate = new FormControl('', Validators.required);
	fonoForUpdate = new FormControl('', Validators.required);
	nroPatForUpdate = new FormControl('', Validators.required);

	sucursalsTypes: SucursalModel[] = [];

	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	public sucursalId;

	constructor(public dialogRef: MatDialogRef<SucursalEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private sucursalsService: SucursalsService
	) {
		// this.selectedNameIdForUpdate.setValue(this.data.id.toString());
		this.sucursalId = +this.data.id.toString();
		this.nombreForUpdate.setValue(this.data.nombre);
		this.direccionForUpdate.setValue(this.data.direccion);
		this.nitForUpdate.setValue(this.data.nit);
		this.ciudadForUpdate.setValue(this.data.ciudad);
		this.fonoForUpdate.setValue(this.data.fono);
		this.nroPatForUpdate.setValue(this.data.nro_pat);


		this.sucursalsTypes = this.data.sucursalsTypes;
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
		if (this.nombreForUpdate.invalid) { this.nombreForUpdate.markAsTouched(); return; }
		if (this.direccionForUpdate.invalid) { this.direccionForUpdate.markAsTouched(); return; }
		if (this.nitForUpdate.invalid) { this.nitForUpdate.markAsTouched(); return; }
		if (this.ciudadForUpdate.invalid) { this.nitForUpdate.markAsTouched(); return; }
		if (this.fonoForUpdate.invalid) { this.nitForUpdate.markAsTouched(); return; }
		if (this.nroPatForUpdate.invalid) { this.nitForUpdate.markAsTouched(); return; }


		this.loadingAfterSubmit = true;
		// this.viewLoading = true;

		// const sucursalId = +this.selectedNameIdForUpdate.value;
		/* Server loading imitation. Remove this on real code */
		// setTimeout(() => {
			// this.viewLoading = false;
		this.closeDialog(this.sucursalId);
		// }, 1500);
	}

	closeDialog(sucursalId) {
		this.dialogRef.close({
			isUpdated: true,
			id: sucursalId,
			nombre: this.nombreForUpdate.value,
			direccion: this.direccionForUpdate.value,
			nit: this.nitForUpdate.value,
			ciudad: this.ciudadForUpdate.value,
			fono: this.fonoForUpdate.value,
			nro_pat: this.nroPatForUpdate.value,

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
		return this.nombreForUpdate.valid && this.direccionForUpdate.valid && this.nitForUpdate.valid
		&& this.ciudadForUpdate.valid && this.fonoForUpdate.valid && this.nroPatForUpdate.valid;
	}
}
