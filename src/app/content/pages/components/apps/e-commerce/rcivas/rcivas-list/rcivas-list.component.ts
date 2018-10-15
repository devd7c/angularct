import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
// Services
import { RcivasService } from '../../_core/services/index';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { EmpresasService } from '../../_core/services/empresas.service';
import { GestionsService } from '../../_core/services/gestions.service';
import { PeriodosService } from '../../_core/services/periodos.service';
// Models
import { RcivaModel } from '../../_core/models/rciva.model';
import { RcivasDataSource } from '../../_core/models/data-sources/rcivas.datasource';
import { QueryParamsModel } from '../../_core/models/query-models/query-params.model';
import { EmpresaModel } from '../../_core/models/empresa.model';
import { GestionModel } from '../../_core/models/gestion.model';
import { PeriodoModel } from '../../_core/models/periodo.model';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'm-rcivas-list',
	templateUrl: './rcivas-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RcivasListComponent implements OnInit {
	// Table fields
	dataSource: RcivasDataSource;
	displayedColumns = ['select', 'id', 'nombre_completo', 'sueldo', 'saldo', 'factura', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	filterGestion: string = '';
	filterPeriodo: string = '';
	// Selection
	selection = new SelectionModel<RcivaModel>(true, []);
	rcivasResult: RcivaModel[] = [];
	// Types
	empresasTypes: EmpresaModel;
	gestionsTypes: GestionModel;
	periodosTypes: PeriodoModel;
	// Empresa ID
	_idEmpresa: number;
	// value
	value: any;

	constructor(
		private rcivasService: RcivasService,
		private empresasService: EmpresasService,
		private gestionsService: GestionsService,
		private periodosService: PeriodosService,

		public dialog: MatDialog,
		private route: ActivatedRoute,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	/** LOAD DATA */
	ngOnInit() {
		// Gestiones by Empresa
		this._idEmpresa = 1;
		this.gestionsService.getGestionsByIdEmpresa(this._idEmpresa).subscribe(res => {
			console.log(res.data.empresa_id);
			this.gestionsTypes = res.data;
		});
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadRcivasList();
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
					this.loadRcivasList();
				})
			)
			.subscribe();

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Form 110');
		// Init DataSource
		this.dataSource = new RcivasDataSource(this.rcivasService);
		let queryParams = new QueryParamsModel({});
		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			if (params.id) {
				queryParams = this.rcivasService.lastFilter$.getValue();
				this.restoreState(queryParams, +params.id);
			}
			// First load
			queryParams.filter.empresa = this._idEmpresa;
			this.dataSource.loadRcivas(queryParams);
		});
		this.dataSource.entitySubject.subscribe(res => this.rcivasResult = res);
	}

	loadRcivasList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		queryParams.filter.empresa = this._idEmpresa;
		this.dataSource.loadRcivas(queryParams);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		if (this.filterGestion && this.filterGestion.length > 0) {
			filter.gestion = +this.filterGestion;
		}

		if (this.filterPeriodo && this.filterPeriodo.length > 0) {
			filter.periodo = +this.filterPeriodo;
		}

		filter.search = searchText;
		return filter;
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
			this.rcivasService.getRcivaById(id).subscribe((res: RcivaModel) => {
				const message = res._createdDate === res._updatedDate ?
					`El Dependiente fue exitosamente agregado.` :
					`El Dependiente fue guardado satisfactoriamente.`;
				this.layoutUtilsService.showActionNotification(message, res._isNew ? MessageType.Create : MessageType.Update, 10000, true, false);
			});
		}

		if (!queryParams.filter) {
			return;
		}

		if ('gestion' in queryParams.filter) {
			this.filterGestion = queryParams.filter.gestion.toString();
		}

		if ('periodo' in queryParams.filter) {
			this.filterPeriodo = queryParams.filter.periodo.toString();
		}

		if (queryParams.filter.search) {
			this.searchInput.nativeElement.value = queryParams.filter.search;
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteRciva(_item: RcivaModel) {
		const _title: string = 'Eliminar Dependiente';
		const _description: string = '¿Estás seguro de eliminar permanentemente al dependiente?';
		const _waitDesciption: string = 'El dependiente esta siendo eliminado...';
		const _deleteMessage = `El dependiente fue eliminado`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.rcivasService.deleteRciva(_item.id).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadRcivasList();
			});
		});
	}

	deleteRcivas() {
		const _title: string = 'Eliminar Dependientes';
		const _description: string = '¿Estás seguro de eliminar permanentemente a los dependientes seleccionados?';
		const _waitDesciption: string = 'Los dependientes estan siendo eliminados...';
		const _deleteMessage = 'Los dependientes seleccionados fueron eliminados';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: number[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].id);
			}
			this.rcivasService.deleteRcivas(idsForDeletion).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadRcivasList();
				this.selection.clear();
			});
		});
	}

	/** Fetch */
	/*fetchRcivas() {
		// tslint:disable-next-line:prefer-const
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.nombre} ${elem.haber_basico	} ${elem.nua_cua}`,
				id: elem.nua_cua,
				status: elem.sexo
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}*/

	/** Update Rciva */
	/*updateSexoForRcivas() {
		const _title = 'Actualizar el genero de los dependientes seleccionados';
		const _updateMessage = 'El genero ha sido actualizado para los dependientes seleccionados';
		const _statuses = [{ value: 0, text: 'Masculino' }, { value: 1, text: 'Femenino' }];
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.ap_paterno} ${elem.ap_materno} ${elem.nombre}`,
				id: elem.nua_cua,
				status: elem.sexo,
				statusTitle: this.getItemAfiliacionString(elem.sexo.toString()),
				statusCssClass: this.getItemCssClassByAfiliacion(elem.sexo.toString())
			});
		});

		const dialogRef = this.layoutUtilsService.updateGeneroForRcivas(_title, _statuses, _messages);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.selection.clear();
				return;
			}

			this.rcivasService.updateGeneroForRciva(this.selection.selected, +res).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
				this.loadRcivasList();
				this.selection.clear();
			});
		});
	}*/

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.rcivasResult.length;
		return numSelected === numRows;
	}

	 /** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.rcivasResult.forEach(row => this.selection.select(row));
		}
	}

	/* UI */
	getItemAfiliacionString(status: string = ''): string {
		switch (status) {
			case '1':
				return 'Prevision';
			case '2':
				return 'Futuro';
			case '3':
				return 'otro';
		}
		return '';
	}

	getItemCssClassByAfiliacion(status: string = ''): string {
		switch (status) {
			case '1':
				return 'success';
			case '2':
				return 'accent';
			case '3':
				return 'primary';
		}
		return '';
	}

	getItemSexoString(condition: string = ''): string {
		switch (condition) {
			case '1':
				return 'Femenino';
			case '2':
				return 'Masculino';
		}
		return '';
	}

	getItemCssClassBySexo(condition: string = ''): string {
		switch (condition) {
			case '1':
				return 'primary';
			case '2':
				return 'accent';
		}
		return '';
	}

	// CHANGE COMBOBOX
	onChangeGestion(id) {
		// console.log(id);
		if (!id) {
			this.periodosTypes = null;
		} else {
			this.periodosService.getPeriodosByIdGestion(id).subscribe(res => {
				// console.log(res.data);
				this.periodosTypes = res.data;
			});
		}
	}

	// Generar Form 110
	generateRciva() {
		if (this.filterGestion && this.filterGestion.length > 0 && this.filterPeriodo && this.filterPeriodo.length > 0
			&& this.dataSource.hasItems === false) {
				const data: any = {};
				data.gestion = this.filterGestion;
				data.periodo = this.filterPeriodo;
				data.empresa = this._idEmpresa;
				this.rcivasService.createRciva(data).subscribe(res => {
					const message = `Se genero exitosamente el fomulario para el periodo actual`;
					this.loadRcivasList();
					this.layoutUtilsService.showActionNotification(message, MessageType.Read, 10000, true, false);
				});
		} else {
			const message = `Debe seleccionar la gestion y el periodo actual`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Read, 10000, true, false);
		}
	}
}
