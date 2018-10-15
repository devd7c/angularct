import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { SubheaderService } from '../../../core/services/layout/subheader.service';
// Components
import {
	LaboralShowDialogComponent
} from '../../pages/components/apps/e-commerce/empresas/_subs/laborals/laboral-show/laboral-show-dialog.component';
import {
	PatronalShowDialogComponent
} from '../../pages/components/apps/e-commerce/empresas/_subs/patronals/patronal-show/patronal-show-dialog.component';
@Component({
	selector: 'm-subheader',
	templateUrl: './subheader.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubheaderComponent implements OnInit {
	// Empresa ID
	_idEmpresa: number;

	constructor(
		public subheaderService: SubheaderService,
		public dialog: MatDialog) {}

	ngOnInit(): void {}

	getLaborals() {
		this._idEmpresa = 1;
		const dialogRef = this.dialog.open(LaboralShowDialogComponent, {
		data: {
			id: this._idEmpresa,
			idLaboral: 0
			// isNew: false,
		} });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}

	getPatronals() {
		this._idEmpresa = 1;
		const dialogRef = this.dialog.open(PatronalShowDialogComponent, {
		data: {
			id: this._idEmpresa,
			idPatronal: 0
			// isNew: false,
		} });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}
}
