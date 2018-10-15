import { Component, OnInit, ElementRef, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, isEmpty } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
// Services
import { TypesUtilsService } from '../../../../_core/utils/types-utils.service';
import { LayoutUtilsService, MessageType } from '../../../../_core/utils/layout-utils.service';
import { GestionsService } from '../../../../_core/services/index';
import { PeriodosService } from '../../../../_core/services/index';
// Models
import { GestionsDataSource } from '../../../../_core/models/data-sources/gestions.datasource';
import { GestionModel } from '../../../../_core/models/gestion.model';
import { PeriodosDataSource } from '../../../../_core/models/data-sources/periodos.datasource';
import { PeriodoModel } from '../../../../_core/models/periodo.model';
import { QueryParamsModel } from '../../../../_core/models/query-models/query-params.model';
import { ListStateModel, StateActions } from '../../../../_core/utils/list-state.model';
// Components
import { GestionEditDialogComponent } from '../gestion-edit/gestion-edit-dialog.component';
import { PeriodoEditDialogComponent } from '../../periodos/periodo-edit/periodo-edit-dialog.component';


// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'm-gestions-list',
	templateUrl: './gestions-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionsListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() loadingSubject2 = new BehaviorSubject<boolean>(false);
	@Input() gestionsListState: ListStateModel;
	@Input() periodosListState: ListStateModel;
	// Table fields
	dataSource: GestionsDataSource;
	dataSource2: PeriodosDataSource;

	displayedColumns = ['select', 'id', 'periodo_inicio', 'periodo_rango', 'activo', 'actions'];
	displayedColumns2 = ['id', 'inicio_mes', 'procesado', 'cierre', 'cierre_ufv', 'actions'];

	gestionsTypes: GestionModel[] = [];
	periodosTypes: PeriodoModel[] = [];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild('matPaginator2') paginator2: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('sort2') sort2: MatSort;

	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	@ViewChild('searchInput2') searchInput2: ElementRef;
	// Selection
	selection = new SelectionModel<GestionModel>(true, []);
	gestionsResult: GestionModel[] = [];
	selection2 = new SelectionModel<PeriodoModel>(true, []);
	periodosResult: PeriodoModel[] = [];
	// Gestion ID
	_idGestion: number;

	constructor(
		private gestionsService: GestionsService,
		private periodosService: PeriodosService,
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
		merge(this.sort.sortChange, this.paginator.page).pipe(tap(() => {this.loadGestionsList(); })).subscribe();
		// Filtration, bind to searchInput
		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe( debounceTime(150), distinctUntilChanged(), tap(() => { this.paginator.pageIndex = 0; this.loadGestionsList(); }))
			.subscribe();
		// Init DataSource
		this.dataSource = new GestionsDataSource(this.gestionsService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => { this.loadingSubject.next(res); });
		this.loadGestionsList(true);
		this.dataSource.entitySubject.subscribe(res => this.gestionsResult = res);

		// PERIODOS
		this.sort2.sortChange.subscribe(() => (this.paginator2.pageIndex = 0));
		merge(this.sort2.sortChange, this.paginator2.page).pipe(tap(() => { this.loadPeriodosList(this._idGestion); })).subscribe();
		fromEvent(this.searchInput2.nativeElement, 'keyup')
			.pipe(debounceTime(150), distinctUntilChanged(), tap(() => { this.paginator2.pageIndex = 0; this.loadPeriodosList(this._idGestion); }))
			.subscribe();
		this.dataSource2 = new PeriodosDataSource(this.periodosService);
		this.dataSource2.loading$.subscribe(res => { this.loadingSubject2.next(res); });
		// this.loadPeriodosList(true);
		this.dataSource.entitySubject.subscribe(res => this.periodosResult = res);

	}

	// Loading
	loadGestionsList(_isFirstLoading: boolean = false) {
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
		// console.log(queryParams);
		this.dataSource.loadGestions(queryParams, this.gestionsListState);
	}

	loadPeriodosList(_idGestion: number) {
		this.selection2.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration2(),
			this.sort2.direction,
			this.sort2.active,
			this.paginator2.pageIndex + 1,
			this.paginator2.pageSize
		);
		/*if (_isFirstLoading) {
			queryParams = new QueryParamsModel(this.filterConfiguration2(), 'asc', 'id', 0, 10);
		}*/
		// console.log(this.gestionsListState);
		console.log(queryParams);
		this.dataSource2.loadPeriodos(queryParams, this.periodosListState, _idGestion);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.search = searchText;
		return filter;
	}

	filterConfiguration2(): any {
		const filter: any = {};
		const searchText: string = this.searchInput2.nativeElement.value;

		filter.search = searchText;
		return filter;
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.gestionsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.gestionsResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteGestion(_item: GestionModel) {
		const _title: string = 'Gestion Delete';
		const _description: string = 'Are you sure to permanently delete this Gestion?';
		const _waitDesciption: string = 'Gestion is deleting...';
		const _deleteMessage = `Gestion has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.gestionsListState.setItem(_item, StateActions.DELETE);
			this.gestionsService.deleteGestion(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadGestionsList();
				this.loadPeriodosList(0);
			});
		});
	}

	deletePeriodo(_item: PeriodoModel) {
		const _title: string = 'Periodo Delete';
		const _description: string = 'Are you sure to permanently delete this Periodo?';
		const _waitDesciption: string = 'Periodo is deleting...';
		const _deleteMessage = `Periodo has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.gestionsListState.setItem(_item, StateActions.DELETE);
			this.periodosService.deletePeriodo(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadPeriodosList(this._idGestion);
			});
		});
	}

	deleteGestions() {
		const _title: string = 'Gestion Delete';
		const _description: string = 'Are you sure to permanently delete selected Gestion?';
		const _waitDesciption: string = 'Gestion are deleting...';
		const _deleteMessage = 'Selected Gestion have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.gestionsListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadGestionsList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchGestions() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	addGestion() {
		// tslint:disable-next-line:prefer-const
		let newGestion = new GestionModel();
		newGestion.clear(this.gestionsListState.entityId);
		const dialogRef = this.dialog.open(GestionEditDialogComponent, {
			data: {
				id: '',
				nombre: newGestion.periodo_inicio,
				direccion: newGestion.periodo_rango,
				nit: newGestion.activo,

				isNew: true,
				gestionsTypes: this.gestionsTypes
			},
			width: 'auto'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.isUpdated) {
				newGestion.id = res.id;
				newGestion.periodo_inicio = res.periodo_inicio;
				newGestion.periodo_rango = res.periodo_rango;
				newGestion.activo = res.activo;

				// this.gestionsListState.setItem(newGestion, StateActions.CREATE);
				this.gestionsService.createGestion(newGestion).subscribe(result => {
					this.loadGestionsList();
					this.loadPeriodosList(0);
					const saveMessage = `Gestion has been created`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Create, 10000, true, false);
				});
			}
		});
	}

	editGestion(_item: GestionModel) {

		const dialogRef = this.dialog.open(GestionEditDialogComponent, {
			data: {
				id: _item.id,
				periodo_inicio: _item.periodo_inicio,
				periodo_rango: _item.periodo_rango,
				activo: _item.activo,

				isNew: false,
				gestionsTypes: this.gestionsTypes
			},
			width: 'auto'
		});
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (res && res.isUpdated) {
				_item.id = res.id;
				_item.periodo_inicio = res.periodo_inicio;
				_item.periodo_rango = res.periodo_rango;
				_item.activo = res.activo;

				// this.gestionsListState.setItem(_item, StateActions.UPDATE);
				this.gestionsService.updateGestion(_item).subscribe(result => {
					// console.log(this.gestionsListState);
					this.loadGestionsList();
					const saveMessage = `Specification has been updated`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
				});
			}
		});
	}

	editPeriodo(_item: PeriodoModel) {

		const dialogRef = this.dialog.open(PeriodoEditDialogComponent, {
			data: {
				id: _item.id,
				inicio_mes: _item.inicio_mes,
				fin_mes: _item.fin_mes,
				procesado: _item.procesado,
				cierre: _item.cierre,

				isNew: false,
				periodosTypes: this.periodosTypes
			},
			width: 'auto'
		});
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (res && res.isUpdated) {
				_item.id = res.id;
				_item.inicio_mes = res.inicio_mes;
				_item.fin_mes = res.fin_mes;
				_item.procesado = res.procesado;
				_item.cierre = res.cierre;

				// this.gestionsListState.setItem(_item, StateActions.UPDATE);
				this.periodosService.updatePeriodo(_item).subscribe(result => {
					// console.log(this.gestionsListState);
					this.loadPeriodosList(this._idGestion);
					const saveMessage = `Specification has been updated`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
				});
			}
		});
	}

	getPeriodos(_item: GestionModel) {
		this._idGestion = _item.id;
		this.loadPeriodosList(this._idGestion);
	}

	/*getGestionTitle(_item: string) {
		let result: string;
		console.log(_item);
		if (_item != null) {
			result = `Ver Periodos - Gestion: ${_item}`;
		} else {
			result = 'Periodos';
		}
		return result;
	}*/

	getPeriodoRango(condition: string = ''): string {
		switch (condition) {
			case '1':
				return 'Enero - Diciembre';
			case '2':
				return 'Abril - Marzo';
			case '3':
				return 'Octubre - Septiembre';
		}
		return '';
	}

	getStatus(condition: string = ''): string {
		switch (condition) {
			case '1':
				return 'SI';
			case '2':
				return 'NO';
		}
		return '';
	}

	getStatusCssClass(condition: string = ''): string {
		switch (condition) {
			case '1':
				return 'primary';
			case '2':
				return 'accent';
		}
		return '';
	}
}
