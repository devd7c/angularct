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
import { SucursalsService } from '../../../../_core/services/index';
// Models
import { SucursalModel } from '../../../../_core/models/sucursal.model';
import { SucursalsDataSource } from '../../../../_core/models/data-sources/sucursals.datasource';
import { QueryParamsModel } from '../../../../_core/models/query-models/query-params.model';
import { ListStateModel, StateActions } from '../../../../_core/utils/list-state.model';
// Components
import { SucursalEditDialogComponent } from '../sucursal-edit/sucursal-edit-dialog.component';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'm-sucursals-list',
	templateUrl: './sucursals-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SucursalsListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() sucursalsListState: ListStateModel;
	// Table fields
	dataSource: SucursalsDataSource;
	displayedColumns = ['select', 'id', 'nombre', 'ciudad', 'nit', 'actions'];
	sucursalsTypes: SucursalModel[] = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<SucursalModel>(true, []);
	sucursalsResult: SucursalModel[] = [];
	// Add and Edit
	/*isSwitchedToEditMode: boolean = false;
	loadingAfterSubmit: boolean = false;
	formGroup: FormGroup;
	sucursalForEdit: SucursalModel;
	sucursalForAdd: SucursalModel;*/

	constructor(private sucursalsService: SucursalsService,
		// private fb: FormBuilder,
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
					this.loadSucursalsList();
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
					this.loadSucursalsList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new SucursalsDataSource(this.sucursalsService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadSucursalsList(true);
		this.dataSource.entitySubject.subscribe(res => this.sucursalsResult = res);
		// this.createFormGroup();
	}

	// Loading
	loadSucursalsList(_isFirstLoading: boolean = false) {
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
		// console.log(this.sucursalsListState);
		this.dataSource.loadSucursals(queryParams, this.sucursalsListState);
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
		const numRows = this.sucursalsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.sucursalsResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteSucursal(_item: SucursalModel) {
		const _title: string = 'Sucursal Delete';
		const _description: string = 'Are you sure to permanently delete this sucursal?';
		const _waitDesciption: string = 'Sucursal is deleting...';
		const _deleteMessage = `Sucursal has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.sucursalsListState.setItem(_item, StateActions.DELETE);
			this.sucursalsService.deleteSucursal(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadSucursalsList();
			});
		});
	}

	deleteSucursals() {
		const _title: string = 'sucursals Delete';
		const _description: string = 'Are you sure to permanently delete selected sucursals?';
		const _waitDesciption: string = 'sucursals are deleting...';
		const _deleteMessage = 'Selected sucursals have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.sucursalsListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadSucursalsList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchSucursals() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	addSucursal() {
		// tslint:disable-next-line:prefer-const
		let newSucursal = new SucursalModel();
		newSucursal.clear(this.sucursalsListState.entityId);
		const dialogRef = this.dialog.open(SucursalEditDialogComponent, {
			data: {
				id: '',
				nombre: newSucursal.nombre,
				direccion: newSucursal.direccion,
				nit: newSucursal.nit,
				ciudad: newSucursal.ciudad,
				fono: newSucursal.fono,
				nro_pat: newSucursal.nro_pat,

				isNew: true,
				sucursalsTypes: this.sucursalsTypes
			},
			width: 'auto'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.isUpdated) {
				newSucursal.id = res.id;
				newSucursal.nombre = res.nombre;
				newSucursal.direccion = res.direccion;
				newSucursal.nit = res.nit;
				newSucursal.ciudad = res.ciudad;
				newSucursal.fono = res.fono;
				newSucursal.nro_pat = res.nro_pat;

				// this.sucursalsListState.setItem(newSucursal, StateActions.CREATE);
				this.sucursalsService.createSucursal(newSucursal).subscribe(result => {
					this.loadSucursalsList();
					const saveMessage = `Sucursal has been created`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Create, 10000, true, false);
				});
			}
		});
	}

	editSucursal(_item: SucursalModel) {
		const dialogRef = this.dialog.open(SucursalEditDialogComponent, {
			data: {
				id: _item.id,
				nombre: _item.nombre,
				direccion: _item.direccion,
				nit: _item.nit,
				ciudad: _item.ciudad,
				fono: _item.fono,
				nro_pat: _item.nro_pat,

				isNew: false,
				sucursalsTypes: this.sucursalsTypes
			},
			width: 'auto'
		});
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (res && res.isUpdated) {
				_item.id = res.id;
				_item.nombre = res.nombre;
				_item.direccion = res.direccion;
				_item.nit = res.nit;
				_item.ciudad = res.ciudad;
				_item.fono = res.fono;
				_item.nro_pat = res.nro_pat;

				// this.sucursalsListState.setItem(_item, StateActions.UPDATE);
				this.sucursalsService.updateSucursal(_item).subscribe(result => {
					// console.log(this.sucursalsListState);
					this.loadSucursalsList();
					const saveMessage = `Specification has been updated`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
				});
			}
		});
	}
}
