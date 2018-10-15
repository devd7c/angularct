import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import { LaboralsService } from '../../../../_core/services/laborals.service';
import { LaboralModel } from '../../../../_core/models/laboral.model';
import {default as _rollupMoment} from 'moment';

@Component({
	selector: 'm-laboral-edit-dialog',
	templateUrl: './laboral-edit-dialog.component.html',
	providers: []
})
export class LaboralEditDialogComponent implements OnInit {
	// dateParse = new FormControl(moment());
	// selectedNameIdForUpdate = new FormControl('', Validators.required);
	smnUpdate = new FormControl('', Validators.required);
	civUpdate = new FormControl('', Validators.required);
	siUpdate = new FormControl('', Validators.required);
	comision_afpUpdate = new FormControl('', Validators.required);
	proviviendaUpdate = new FormControl('', Validators.required);
	ivaUpdate = new FormControl('', Validators.required);
	asaUpdate = new FormControl('', Validators.required);
	ans_13Update = new FormControl('', Validators.required);
	ans_25Update = new FormControl('', Validators.required);
	ans_35Update = new FormControl('', Validators.required);
	cba_1Update = new FormControl('', Validators.required);
	cba_2Update = new FormControl('', Validators.required);
	cba_3Update = new FormControl('', Validators.required);
	cba_4Update = new FormControl('', Validators.required);
	cba_5Update = new FormControl('', Validators.required);
	cba_6Update = new FormControl('', Validators.required);
	cba_7Update = new FormControl('', Validators.required);
	activoUpdate = new FormControl('', Validators.required);
	empresa_idUpdate = new FormControl('', Validators.required);

	laboralsTypes: LaboralModel[] = [];

	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	public laboralId;

	constructor(public dialogRef: MatDialogRef<LaboralEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private laboralsService: LaboralsService
	) {
		// this.selectedNameIdForUpdate.setValue(this.data.id.toString());
		// console.log(data);
		this.laboralId = +this.data.id.toString();
		this.laboralsTypes = this.data.laboralsTypes;
		// console.log(this.laboralsTypes);
		this.laboralsService.getActiveLaboralByIdEmpresa(this.data.empresa_id).subscribe(res => {
			// console.log(res);
			this.smnUpdate.setValue(res.smn);
			this.civUpdate.setValue(res.civ);
			this.siUpdate.setValue(res.si);
			this.comision_afpUpdate.setValue(res.comision_afp);
			this.proviviendaUpdate.setValue(res.provivienda);
			this.ivaUpdate.setValue(res.iva);
			this.asaUpdate.setValue(res.asa);
			this.ans_13Update.setValue(res.ans_13);
			this.ans_25Update.setValue(res.ans_25);
			this.ans_35Update.setValue(res.ans_35);
			this.cba_1Update.setValue(res.cba_1);
			this.cba_2Update.setValue(res.cba_2);
			this.cba_3Update.setValue(res.cba_3);
			this.cba_4Update.setValue(res.cba_4);
			this.cba_5Update.setValue(res.cba_5);
			this.cba_6Update.setValue(res.cba_6);
			this.cba_7Update.setValue(res.cba_7);
			this.activoUpdate.setValue(res.activo);
			this.empresa_idUpdate.setValue(res.empresa_id);
		});
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
		if (this.smnUpdate.invalid) { this.smnUpdate.markAsTouched(); return; }
		if (this.civUpdate.invalid) { this.civUpdate.markAsTouched(); return; }
		if (this.siUpdate.invalid) { this.siUpdate.markAsTouched(); return; }
		if (this.comision_afpUpdate.invalid) { this.comision_afpUpdate.markAsTouched(); return; }
		if (this.proviviendaUpdate.invalid) { this.proviviendaUpdate.markAsTouched(); return; }
		if (this.ivaUpdate.invalid) { this.ivaUpdate.markAsTouched(); return; }
		if (this.asaUpdate.invalid) { this.asaUpdate.markAsTouched(); return; }
		if (this.ans_13Update.invalid) { this.ans_13Update.markAsTouched(); return; }
		if (this.ans_25Update.invalid) { this.ans_25Update.markAsTouched(); return; }
		if (this.ans_35Update.invalid) { this.ans_35Update.markAsTouched(); return; }
		if (this.cba_1Update.invalid) { this.cba_1Update.markAsTouched(); return; }
		if (this.cba_2Update.invalid) { this.cba_2Update.markAsTouched(); return; }
		if (this.cba_3Update.invalid) { this.cba_3Update.markAsTouched(); return; }
		if (this.cba_4Update.invalid) { this.cba_4Update.markAsTouched(); return; }
		if (this.cba_5Update.invalid) { this.cba_5Update.markAsTouched(); return; }
		if (this.cba_6Update.invalid) { this.cba_6Update.markAsTouched(); return; }
		if (this.cba_7Update.invalid) { this.cba_7Update.markAsTouched(); return; }
		if (this.activoUpdate.invalid) { this.activoUpdate.markAsTouched(); return; }
		// if (this.empresa_id.invalid) { this.empresa_id.markAsTouched(); return; }


		this.loadingAfterSubmit = true;
		// this.viewLoading = true;

		// const laboralId = +this.selectedNameIdForUpdate.value;
		/* Server loading imitation. Remove this on real code */
		// setTimeout(() => {
			// this.viewLoading = false;
		this.closeDialog(this.laboralId);
		// }, 1500);
	}

	closeDialog(laboralId) {
		this.dialogRef.close({
			isUpdated: true,
			id: laboralId,
			smn: this.smnUpdate.value,
			civ: this.civUpdate.value,
			si: this.siUpdate.value,
			comision_afp: this.comision_afpUpdate.value,
			provivienda: this.proviviendaUpdate.value,
			iva: this.ivaUpdate.value,
			asa: this.asaUpdate.value,
			ans_13: this.ans_13Update.value,
			ans_25: this.ans_25Update.value,
			ans_35: this.ans_35Update.value,
			cba_1: this.cba_1Update.value,
			cba_2: this.cba_2Update.value,
			cba_3: this.cba_3Update.value,
			cba_4: this.cba_4Update.value,
			cba_5: this.cba_5Update.value,
			cba_6: this.cba_6Update.value,
			cba_7: this.cba_7Update.value,
			activo: this.activoUpdate.value,
			empresa_id: this.empresa_idUpdate.value,
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
		return this.smnUpdate.valid && this.civUpdate.valid && this.siUpdate.valid && this.comision_afpUpdate.valid
		&& this.proviviendaUpdate.valid && this.ivaUpdate.valid && this.asaUpdate.valid && this.ans_13Update.valid
		&& this.ans_25Update.valid && this.ans_35Update.valid && this.cba_1Update.valid && this.cba_2Update.valid
		&& this.cba_3Update.valid && this.cba_4Update.valid	&& this.cba_5Update.valid && this.cba_6Update.valid
		&& this.cba_7Update.valid && this.activoUpdate.valid && this.empresa_idUpdate.valid;
	}
}
