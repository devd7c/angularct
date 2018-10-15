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
import { TdescuentosService } from '../../../../_core/services/index';
// Models
import { TdescuentoModel } from '../../../../_core/models/tdescuento.model';
import { TdescuentosDataSource } from '../../../../_core/models/data-sources/tdescuentos.datasource';
import { QueryParamsModel } from '../../../../_core/models/query-models/query-params.model';
import { ListStateModel, StateActions } from '../../../../_core/utils/list-state.model';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	selector: 'm-tdescuentos-list',
	templateUrl: './tdescuentos-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TdescuentosListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() tdescuentosListState: ListStateModel;
	// Table fields
	dataSource: TdescuentosDataSource;
	displayedColumns = ['select', 'id', 'fecha', 'monto', 'descripcion', 'actions'];
	// displayedColumns = ['select', 'id', 'text', 'type', 'dueDate', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<TdescuentoModel>(true, []);
	tdescuentosResult: TdescuentoModel[] = [];
	// Add and Edit
	isSwitchedToEditMode: boolean = false;
	loadingAfterSubmit: boolean = false;
	formGroup: FormGroup;
	tdescuentoForEdit: TdescuentoModel;
	tdescuentoForAdd: TdescuentoModel;

	constructor(private tdescuentosService: TdescuentosService,
		private fb: FormBuilder,
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
					this.loadTdescuentosList();
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
					this.loadTdescuentosList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new TdescuentosDataSource(this.tdescuentosService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadTdescuentosList(true);
		this.dataSource.entitySubject.subscribe(res => this.tdescuentosResult = res);
		this.createFormGroup();
	}

	// Loading
	loadTdescuentosList(_isFirstLoading: boolean = false) {
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
		// console.log(this.tdescuentosListState);
		this.dataSource.loadTdescuentos(queryParams, this.tdescuentosListState);
	}

	// Add+Edit forms | FormGroup
	createFormGroup(_item = null) {
		// 'edit' prefix - for item editing
		// 'add' prefix - for item creation
		this.formGroup = this.fb.group({
			editDescripcion: ['', Validators.required],
			editMonto: ['0'],
			editFecha: [this.typesUtilsService.getDateFromString(), Validators.required],
			newDescripcion: ['', Validators.required],
			newMonto: ['0'],
			newFecha: [this.typesUtilsService.getDateFromString(), Validators.required]
		});
		this.clearAddForm();
		this.clearEditForm();
	}

	// ADD TDESCUENTO FUNCTIONS: clearAddForm | checkAddForm | addTdescuentoButtonOnClick | cancelAddButtonOnClick | saveNewTdescuento
	clearAddForm() {
		const controls = this.formGroup.controls;
		controls['newDescripcion'].setValue('');
		controls['newDescripcion'].markAsPristine();
		controls['newDescripcion'].markAsUntouched();
		controls['newMonto'].setValue('0');
		controls['newMonto'].markAsPristine();
		controls['newMonto'].markAsUntouched();
		controls['newFecha'].setValue(this.typesUtilsService.getDateFromString());
		controls['newFecha'].markAsPristine();
		controls['newFecha'].markAsUntouched();

		this.tdescuentoForAdd = new TdescuentoModel();
		this.tdescuentoForAdd.clear(this.tdescuentosListState.entityId);
		this.tdescuentoForAdd.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tdescuentoForAdd._isEditMode = false;
	}

	checkAddForm() {
		const controls = this.formGroup.controls;
		if (controls['newDescripcion'].invalid || controls['newMonto'].invalid || controls['newFecha'].invalid) {
			controls['newDescripcion'].markAsTouched();
			controls['newMonto'].markAsTouched();
			controls['newFecha'].markAsTouched();
			return false;
		}

		return true;
	}

	addTdescuentoButtonOnClick() {
		this.clearAddForm();
		this.tdescuentoForAdd._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelAddButtonOnClick() {
		this.tdescuentoForAdd._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveNewTdescuento() {
		if (!this.checkAddForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		/* Server loading imitation. Remove 'setTemout' on real code */
		/*setTimeout(() => {}, 1500);*/
		this.loadingAfterSubmit = false;
		this.tdescuentoForAdd._isEditMode = false;
		this.tdescuentoForAdd.descripcion = controls['newDescripcion'].value;
		this.tdescuentoForAdd.monto = +controls['newMonto'].value;
		// const _date = new Date(controls['newFecha'].value);
		this.tdescuentoForAdd.fecha = this.typesUtilsService.dateFormat(controls['newFecha'].value);
		/*this.tdescuentoForAdd._updatedDate = this.typesUtilsService.getDateStringFromDate();
		this.tdescuentoForAdd._createdDate = this.tdescuentoForEdit._updatedDate;
		this.tdescuentoForAdd._userId = 1; // Admin TODO: Get from user servics*/
		// this.tdescuentosListState.setItem(this.tdescuentoForAdd, StateActions.CREATE);
		this.tdescuentosService.createTdescuento(this.tdescuentoForAdd).subscribe(res => {
			this.loadTdescuentosList();
			const _saveMessage = `Tdescuento has been created`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
			this.clearAddForm();
		});
	}

	// EDIT TDESCUENTO FUNCTIONS: clearEditForm | checkEditForm | editTdescuentoButtonOnClick | cancelEditButtonOnClick |
	clearEditForm() {
		const controls = this.formGroup.controls;
		controls['editDescripcion'].setValue('');
		// controls['editDescripcion'].markAsPristine();
		// controls['editDescripcion'].markAsUntouched();
		controls['editMonto'].setValue('0');
		// controls['editMonto'].markAsPristine();
		// controls['editMonto'].markAsUntouched();
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString());
		// controls['editFecha'].markAsPristine();
		// controls['editFecha'].markAsUntouched();

		this.tdescuentoForEdit = new TdescuentoModel();
		this.tdescuentoForEdit.clear(this.tdescuentosListState.entityId);
		this.tdescuentoForEdit.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tdescuentoForEdit._isEditMode = false;
	}

	checkEditForm() {
		const controls = this.formGroup.controls;
		if (controls['editDescripcion'].invalid || controls['editMonto'].invalid || controls['editFecha'].invalid) {
			// controls['editDescripcion'].markAsTouched();
			// controls['editMonto'].markAsTouched();
			// controls['editFecha'].markAsTouched();
			return false;
		}
		return true;
	}

	editTdescuentoButtonOnClick(_item: TdescuentoModel) {
		const controls = this.formGroup.controls;
		controls['editDescripcion'].setValue(_item.descripcion);
		controls['editMonto'].setValue(_item.monto.toString());
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString(_item.fecha));
		_item._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelEditButtonOnClick(_item: TdescuentoModel) {
		_item._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveUpdateTdescuento(_item: TdescuentoModel) {
		if (!this.checkEditForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		this.loadingAfterSubmit = false;
		_item.descripcion = controls['editDescripcion'].value;
		_item.monto = +controls['editMonto'].value;
		const _date = new Date(controls['editFecha'].value);
		_item.fecha = this.typesUtilsService.dateFormat(_date);
		// _item._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_item._isEditMode = false;
		// console.log(_item);
		// this.tdescuentosListState.setItem(_item, StateActions.UPDATE);
		this.tdescuentosService.updateTdescuento(_item).subscribe(res => {
			const saveMessage = `Tdescuento has been updated`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
			this.loadTdescuentosList();
		});
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
		const numRows = this.tdescuentosResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.tdescuentosResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteTdescuento(_item: TdescuentoModel) {
		const _title: string = 'Tdescuento Delete';
		const _description: string = 'Are you sure to permanently delete this Tdescuento?';
		const _waitDesciption: string = 'Tdescuento is deleting...';
		const _deleteMessage = `Tdescuento has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.tdescuentosListState.setItem(_item, StateActions.DELETE);
			this.tdescuentosService.deleteTdescuento(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadTdescuentosList();
			});
		});
	}

	deleteTdescuentos() {
		const _title: string = 'Tdescuentos Delete';
		const _description: string = 'Are you sure to permanently delete selected tdescuentos?';
		const _waitDesciption: string = 'Tdescuentos are deleting...';
		const _deleteMessage = 'Selected Tdescuentos have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.tdescuentosListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadTdescuentosList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchTdescuentos() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	/* UI **/
	/*getTypeStr(_tdescuento: ProductTdescuentoModel): string {
		switch (_tdescuento.type) {
			case 0: return 'Info';
			case 1: return 'Note';
			case 2: return 'Reminder';
			default: return '';
		}
	}*/
}
