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
import { PatronalsService } from '../../../../_core/services/index';
// Models
import { PatronalModel } from '../../../../_core/models/patronal.model';
import { PatronalsDataSource } from '../../../../_core/models/data-sources/patronals.datasource';
import { QueryParamsModel } from '../../../../_core/models/query-models/query-params.model';
import { ListStateModel, StateActions } from '../../../../_core/utils/list-state.model';
// Components
import { PatronalEditDialogComponent } from '../patronal-edit/patronal-edit-dialog.component';
import { PatronalShowDialogComponent } from '../patronal-show/patronal-show-dialog.component';

@Component({
	selector: 'm-patronals-list',
	templateUrl: './patronals-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatronalsListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() patronalsListState: ListStateModel;
	// Table fields
	dataSource: PatronalsDataSource;
	displayedColumns = ['select', 'id', 'sarp', 'provivienda', 'infocal', 'activo', 'actions'];
	patronalsTypes: PatronalModel[] = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<PatronalModel>(true, []);
	patronalsResult: PatronalModel[] = [];

	constructor(private patronalsService: PatronalsService,
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
					this.loadPatronalsList();
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
					this.loadPatronalsList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new PatronalsDataSource(this.patronalsService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadPatronalsList(true);
		this.dataSource.entitySubject.subscribe(res => this.patronalsResult = res);
		// this.createFormGroup();
	}

	// Loading
	loadPatronalsList(_isFirstLoading: boolean = false) {
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
		// console.log(this.patronalsListState);
		this.dataSource.loadPatronals(queryParams, this.patronalsListState);
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
		const numRows = this.patronalsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.patronalsResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deletePatronal(_item: PatronalModel) {
		const _title: string = 'Patronal Delete';
		const _description: string = 'Are you sure to permanently delete this Patronal?';
		const _waitDesciption: string = 'Patronal is deleting...';
		const _deleteMessage = `Patronal has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.patronalsListState.setItem(_item, StateActions.DELETE);
			this.patronalsService.deletePatronal(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadPatronalsList();
			});
		});
	}

	deletePatronals() {
		const _title: string = 'Patronals Delete';
		const _description: string = 'Are you sure to permanently delete selected Patronals?';
		const _waitDesciption: string = 'Patronals are deleting...';
		const _deleteMessage = 'Selected Patronals have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.patronalsListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadPatronalsList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchPatronals() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	addPatronal() {
		// tslint:disable-next-line:prefer-const
		let newPatronal = new PatronalModel();
		newPatronal.clear(this.patronalsListState.entityId);
		const dialogRef = this.dialog.open(PatronalEditDialogComponent, {
			data: {
				id: '',
				sarp: newPatronal.sarp,
				provivienda: newPatronal.provivienda,
				infocal: newPatronal.infocal,
				cnss: newPatronal.cnss,
				sip: newPatronal.sip,
				activo: newPatronal.activo,
				empresa_id: newPatronal.empresa_id,

				isNew: true,
				patronalsTypes: this.patronalsTypes
			},
			// width: '650px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.isUpdated) {
				newPatronal.id = res.id;
				newPatronal.sarp = res.sarp;
				newPatronal.provivienda = res.provivienda;
				newPatronal.infocal = res.infocal;
				newPatronal.cnss = res.cnss;
				newPatronal.sip = res.sip;
				newPatronal.activo = res.activo;
				newPatronal.empresa_id = res.empresa_id;
				// console.log(newPatronal);
				// this.patronalsListState.setItem(newPatronal, StateActions.CREATE);
				this.patronalsService.createPatronal(newPatronal).subscribe(result => {
					this.loadPatronalsList();
					const saveMessage = `patronal has been created`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Create, 10000, true, false);
				});
			}
		});
	}

	showPatronal(_item: PatronalModel) {
		// console.log(_item);
		const dialogRef = this.dialog.open(PatronalShowDialogComponent, {
			data: {
				id: 0,
				idPatronal: _item.id
				// isNew: false,
				// patronalsTypes: this.patronalsTypes
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
