import { Component, OnInit, ElementRef, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
// Services
import { TypesUtilsService } from '../../../../_core/utils/types-utils.service';
import { LayoutUtilsService, MessageType } from '../../../../_core/utils/layout-utils.service';
import { LaboralsService } from '../../../../_core/services/index';
// Models
import { LaboralModel } from '../../../../_core/models/laboral.model';
import { LaboralsDataSource } from '../../../../_core/models/data-sources/laborals.datasource';
import { QueryParamsModel } from '../../../../_core/models/query-models/query-params.model';
import { ListStateModel, StateActions } from '../../../../_core/utils/list-state.model';
// Components
import { LaboralEditDialogComponent } from '../laboral-edit/laboral-edit-dialog.component';
import { LaboralShowDialogComponent } from '../laboral-show/laboral-show-dialog.component';

@Component({
	selector: 'm-laborals-list',
	templateUrl: './laborals-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaboralsListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() laboralsListState: ListStateModel;
	// Table fields
	dataSource: LaboralsDataSource;
	displayedColumns = ['select', 'id', 'smn', 'comision_afp', 'provivienda', 'activo', 'actions'];
	laboralsTypes: LaboralModel[] = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<LaboralModel>(true, []);
	laboralsResult: LaboralModel[] = [];

	constructor(private laboralsService: LaboralsService,
		public dialog: MatDialog,
		public typesUtilsService: TypesUtilsService,
		private layoutUtilsService: LayoutUtilsService) { }

	/** LOAD DATA */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadLaboralsList();
				})
			)
			.subscribe();

		// Filtration, bind to searchInput
		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadLaboralsList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new LaboralsDataSource(this.laboralsService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadLaboralsList(true);
		this.dataSource.entitySubject.subscribe(res => this.laboralsResult = res);
		// this.createFormGroup();
	}

	// Loading
	loadLaboralsList(_isFirstLoading: boolean = false) {
		this.selection.clear();
		let queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		if (_isFirstLoading) {
			queryParams = new QueryParamsModel(this.filterConfiguration(), 'asc', 'id', 0, 10);
		}
		// console.log(this.laboralsListState);
		this.dataSource.loadLaborals(queryParams, this.laboralsListState);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.search = searchText;
		return filter;
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.laboralsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.laboralsResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteLaboral(_item: LaboralModel) {
		const _title: string = 'laboral Delete';
		const _description: string = 'Are you sure to permanently delete this laboral?';
		const _waitDesciption: string = 'laboral is deleting...';
		const _deleteMessage = `laboral has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.laboralsListState.setItem(_item, StateActions.DELETE);
			this.laboralsService.deleteLaboral(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadLaboralsList();
			});
		});
	}

	deleteLaborals() {
		const _title: string = 'laborals Delete';
		const _description: string = 'Are you sure to permanently delete selected laborals?';
		const _waitDesciption: string = 'laborals are deleting...';
		const _deleteMessage = 'Selected laborals have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.laboralsListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadLaboralsList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchLaborals() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	addLaboral() {
		// tslint:disable-next-line:prefer-const
		let newLaboral = new LaboralModel();
		newLaboral.clear(this.laboralsListState.entityId);
		const dialogRef = this.dialog.open(LaboralEditDialogComponent, {
			data: {
				id: '',
				smn: newLaboral.smn,
				civ: newLaboral.civ,
				si: newLaboral.si,
				comision_afp: newLaboral.comision_afp,
				provivienda: newLaboral.provivienda,
				iva: newLaboral.iva,
				asa: newLaboral.asa,
				ans_13: newLaboral.ans_13,
				ans_25: newLaboral.ans_25,
				ans_35: newLaboral.ans_35,
				cba_1: newLaboral.cba_1,
				cba_2: newLaboral.cba_2,
				cba_3: newLaboral.cba_3,
				cba_4: newLaboral.cba_4,
				cba_5: newLaboral.cba_5,
				cba_6: newLaboral.cba_6,
				cba_7: newLaboral.cba_7,
				activo: newLaboral.activo,
				empresa_id: newLaboral.empresa_id,

				isNew: true,
				laboralsTypes: this.laboralsTypes
			},
			// width: '650px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.isUpdated) {
				newLaboral.id = res.id;
				newLaboral.smn = res.smn;
				newLaboral.civ = res.civ;
				newLaboral.si = res.si;
				newLaboral.comision_afp = res.comision_afp;
				newLaboral.provivienda = res.provivienda;
				newLaboral.iva = res.iva;
				newLaboral.asa = res.asa;
				newLaboral.ans_13 = res.ans_13;
				newLaboral.ans_25 = res.ans_25;
				newLaboral.ans_35 = res.ans_35;
				newLaboral.cba_1 = res.cba_1;
				newLaboral.cba_2 = res.cba_2;
				newLaboral.cba_3 = res.cba_3;
				newLaboral.cba_4 = res.cba_4;
				newLaboral.cba_5 = res.cba_5;
				newLaboral.cba_6 = res.cba_6;
				newLaboral.cba_7 = res.cba_7;
				newLaboral.activo = res.activo;
				newLaboral.empresa_id = res.empresa_id;
				// console.log(newLaboral);
				// this.laboralsListState.setItem(newLaboral, StateActions.CREATE);
				this.laboralsService.createLaboral(newLaboral).subscribe(result => {
					this.loadLaboralsList();
					const saveMessage = `Laboral has been created`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Create, 10000, true, false);
				});
			}
		});
	}

	showLaboral(_item: LaboralModel) {
		// console.log(_item);
		const dialogRef = this.dialog.open(LaboralShowDialogComponent, {
			data: {
				id: 0,
				idLaboral: _item.id
				// isNew: false,
				// laboralsTypes: this.laboralsTypes
			},
			// width: '650px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}
}
