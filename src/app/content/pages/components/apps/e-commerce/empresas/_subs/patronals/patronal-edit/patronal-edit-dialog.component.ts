import {Component, Inject, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _ from 'lodash';
import { PatronalsService } from '../../../../_core/services/patronals.service';
import { PatronalModel } from '../../../../_core/models/patronal.model';
import {default as _rollupMoment} from 'moment';

@Component({
	selector: 'm-patronal-edit-dialog',
	templateUrl: './patronal-edit-dialog.component.html',
	providers: []
})
export class PatronalEditDialogComponent implements OnInit {
	// dateParse = new FormControl(moment());
	// selectedNameIdForUpdate = new FormControl('', Validators.required);
	sarpUpdate = new FormControl('', Validators.required);
	proviviendaUpdate = new FormControl('', Validators.required);
	infocalUpdate = new FormControl('', Validators.required);
	cnssUpdate = new FormControl('', Validators.required);
	sipUpdate = new FormControl('', Validators.required);
	activoUpdate = new FormControl('', Validators.required);
	empresa_idUpdate = new FormControl('', Validators.required);
	patronalsTypes: PatronalModel[] = [];
	// extras
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	public patronalId;

	constructor(public dialogRef: MatDialogRef<PatronalEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private patronalsService: PatronalsService
	) {
		// this.selectedNameIdForUpdate.setValue(this.data.id.toString());
		// console.log(data);
		this.patronalId = +this.data.id.toString();
		this.patronalsTypes = this.data.patronalsTypes;
		// console.log(this.laboralsTypes);
		this.patronalsService.getActivePatronalByIdEmpresa(this.data.empresa_id).subscribe(res => {
			// console.log(res);
			this.sarpUpdate.setValue(res.sarp);
			this.proviviendaUpdate.setValue(res.provivienda);
			this.infocalUpdate.setValue(res.infocal);
			this.cnssUpdate.setValue(res.cnss);
			this.sipUpdate.setValue(res.sip);
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
		if (this.sarpUpdate.invalid) { this.sarpUpdate.markAsTouched(); return; }
		if (this.proviviendaUpdate.invalid) { this.proviviendaUpdate.markAsTouched(); return; }
		if (this.infocalUpdate.invalid) { this.infocalUpdate.markAsTouched(); return; }
		if (this.cnssUpdate.invalid) { this.cnssUpdate.markAsTouched(); return; }
		if (this.sipUpdate.invalid) { this.sipUpdate.markAsTouched(); return; }
		if (this.activoUpdate.invalid) { this.activoUpdate.markAsTouched(); return; }
		// if (this.empresa_id.invalid) { this.empresa_id.markAsTouched(); return; }


		this.loadingAfterSubmit = true;
		// this.viewLoading = true;

		// const laboralId = +this.selectedNameIdForUpdate.value;
		/* Server loading imitation. Remove this on real code */
		// setTimeout(() => {
			// this.viewLoading = false;
		this.closeDialog(this.patronalId);
		// }, 1500);
	}

	closeDialog(patronalId) {
		this.dialogRef.close({
			isUpdated: true,
			id: patronalId,
			sarp: this.sarpUpdate.value,
			provivienda: this.proviviendaUpdate.value,
			infocal: this.infocalUpdate.value,
			cnss: this.cnssUpdate.value,
			sip: this.sipUpdate.value,
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
		return this.sarpUpdate.valid && this.proviviendaUpdate.valid && this.infocalUpdate.valid && this.cnssUpdate.valid
		&& this.sipUpdate.valid && this.activoUpdate.valid && this.empresa_idUpdate.valid;
	}
}
