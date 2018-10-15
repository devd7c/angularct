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
import { TdomingosService } from '../../../../_core/services/index';
// Models
import { TdomingoModel } from '../../../../_core/models/tdomingo.model';
import { TdomingosDataSource } from '../../../../_core/models/data-sources/tdomingos.datasource';
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
	selector: 'm-tdomingos-list',
	templateUrl: './tdomingos-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TdomingosListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() tdomingosListState: ListStateModel;
	// Table fields
	dataSource: TdomingosDataSource;
	displayedColumns = ['select', 'id', 'fecha', 'cantidad', 'monto', 'descripcion', 'actions'];
	// displayedColumns = ['select', 'id', 'text', 'type', 'dueDate', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<TdomingoModel>(true, []);
	tdomingosResult: TdomingoModel[] = [];
	// Add and Edit
	isSwitchedToEditMode: boolean = false;
	loadingAfterSubmit: boolean = false;
	formGroup: FormGroup;
	tdomingoForEdit: TdomingoModel;
	tdomingoForAdd: TdomingoModel;

	constructor(private tdomingosService: TdomingosService,
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
					this.loadTdomingosList();
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
					this.loadTdomingosList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new TdomingosDataSource(this.tdomingosService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadTdomingosList(true);
		this.dataSource.entitySubject.subscribe(res => this.tdomingosResult = res);
		this.createFormGroup();
	}

	// Loading
	loadTdomingosList(_isFirstLoading: boolean = false) {
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
		// console.log(this.tdomingosListState);
		this.dataSource.loadTdomingos(queryParams, this.tdomingosListState);
	}

	// Add+Edit forms | FormGroup
	createFormGroup(_item = null) {
		// 'edit' prefix - for item editing
		// 'add' prefix - for item creation
		this.formGroup = this.fb.group({
			editDescripcion: ['', Validators.required],
			editCantidad: ['0'],
			editMonto: ['0'],
			editFecha: [this.typesUtilsService.getDateFromString(), Validators.required],
			newDescripcion: ['', Validators.required],
			newCantidad: ['0'],
			newMonto: ['0'],
			newFecha: [this.typesUtilsService.getDateFromString(), Validators.required]
		});
		this.clearAddForm();
		this.clearEditForm();
	}

	// ADD TDOMINGO FUNCTIONS: clearAddForm | checkAddForm | addTdomingoButtonOnClick | cancelAddButtonOnClick | saveNewTdomingo
	clearAddForm() {
		const controls = this.formGroup.controls;
		controls['newFecha'].setValue(this.typesUtilsService.getDateFromString());
		controls['newFecha'].markAsPristine();
		controls['newFecha'].markAsUntouched();
		controls['newCantidad'].setValue('0');
		controls['newCantidad'].markAsPristine();
		controls['newCantidad'].markAsUntouched();
		controls['newMonto'].setValue('0');
		controls['newMonto'].markAsPristine();
		controls['newMonto'].markAsUntouched();
		controls['newDescripcion'].setValue('');
		controls['newDescripcion'].markAsPristine();
		controls['newDescripcion'].markAsUntouched();

		this.tdomingoForAdd = new TdomingoModel();
		this.tdomingoForAdd.clear(this.tdomingosListState.entityId);
		this.tdomingoForAdd.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tdomingoForAdd._isEditMode = false;
	}

	checkAddForm() {
		const controls = this.formGroup.controls;
		if (controls['newDescripcion'].invalid || controls['newCantidad'].invalid ||
			controls['newMonto'].invalid || controls['newFecha'].invalid) {
			controls['newFecha'].markAsTouched();
			controls['newCantidad'].markAsTouched();
			controls['newMonto'].markAsTouched();
			controls['newDescripcion'].markAsTouched();
			return false;
		}

		return true;
	}

	addTdomingoButtonOnClick() {
		this.clearAddForm();
		this.tdomingoForAdd._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelAddButtonOnClick() {
		this.tdomingoForAdd._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveNewTdomingo() {
		if (!this.checkAddForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		/* Server loading imitation. Remove 'setTemout' on real code */
		/*setTimeout(() => {}, 1500);*/
		this.loadingAfterSubmit = false;
		this.tdomingoForAdd._isEditMode = false;
		// const _date = new Date(controls['newFecha'].value);
		this.tdomingoForAdd.fecha = this.typesUtilsService.dateFormat(controls['newFecha'].value);
		this.tdomingoForAdd.cantidad = +controls['newCantidad'].value;
		this.tdomingoForAdd.monto = +controls['newMonto'].value;
		this.tdomingoForAdd.descripcion = controls['newDescripcion'].value;
		/*this.tdomingoForAdd._updatedDate = this.typesUtilsService.getDateStringFromDate();
		this.tdomingoForAdd._createdDate = this.tdomingoForEdit._updatedDate;
		this.tdomingoForAdd._userId = 1; // Admin TODO: Get from user servics*/
		// this.tdomingosListState.setItem(this.tdomingoForAdd, StateActions.CREATE);
		this.tdomingosService.createTdomingo(this.tdomingoForAdd).subscribe(res => {
			this.loadTdomingosList();
			const _saveMessage = `Tdomingo has been created`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
			this.clearAddForm();
		});
	}

	// EDIT TDOMINGO FUNCTIONS: clearEditForm | checkEditForm | editTdomingoButtonOnClick | cancelEditButtonOnClick |
	clearEditForm() {
		const controls = this.formGroup.controls;
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString());
		// controls['editFecha'].markAsPristine();
		// controls['editFecha'].markAsUntouched();
		controls['editCantidad'].setValue('0');
		// controls['editCantidad'].markAsPristine();
		// controls['editCantidad'].markAsUntouched();
		controls['editMonto'].setValue('0');
		// controls['editMonto'].markAsPristine();
		// controls['editMonto'].markAsUntouched();
		controls['editDescripcion'].setValue('');
		// controls['editDescripcion'].markAsPristine();
		// controls['editDescripcion'].markAsUntouched();

		this.tdomingoForEdit = new TdomingoModel();
		this.tdomingoForEdit.clear(this.tdomingosListState.entityId);
		this.tdomingoForEdit.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tdomingoForEdit._isEditMode = false;
	}

	checkEditForm() {
		const controls = this.formGroup.controls;
		if (controls['editDescripcion'].invalid || controls['editCantidad'].invalid ||
			controls['editMonto'].invalid || controls['editFecha'].invalid) {
			// controls['editFecha'].markAsTouched();
			// controls['editCantidad'].markAsTouched();
			// controls['editMonto'].markAsTouched();
			// controls['editDescripcion'].markAsTouched();
			return false;
		}
		return true;
	}

	editTdomingoButtonOnClick(_item: TdomingoModel) {
		const controls = this.formGroup.controls;
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString(_item.fecha));
		controls['editCantidad'].setValue(_item.cantidad.toString());
		controls['editMonto'].setValue(_item.monto.toString());
		controls['editDescripcion'].setValue(_item.descripcion);

		_item._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelEditButtonOnClick(_item: TdomingoModel) {
		_item._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveUpdateTdomingo(_item: TdomingoModel) {
		if (!this.checkEditForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		this.loadingAfterSubmit = false;
		const _date = new Date(controls['editFecha'].value);
		_item.fecha = this.typesUtilsService.dateFormat(_date);
		_item.cantidad = +controls['editCantidad'].value;
		_item.monto = +controls['editMonto'].value;
		_item.descripcion = controls['editDescripcion'].value;
		// _item._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_item._isEditMode = false;
		// console.log(_item);
		// this.tdomingosListState.setItem(_item, StateActions.UPDATE);
		this.tdomingosService.updateTdomingo(_item).subscribe(res => {
			const saveMessage = `Tdomingo has been updated`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
			this.loadTdomingosList();
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
		const numRows = this.tdomingosResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.tdomingosResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteTdomingo(_item: TdomingoModel) {
		const _title: string = 'Tdomingo Delete';
		const _description: string = 'Are you sure to permanently delete this tdomingo?';
		const _waitDesciption: string = 'Tdomingo is deleting...';
		const _deleteMessage = `Tdomingo has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.tdomingosListState.setItem(_item, StateActions.DELETE);
			this.tdomingosService.deleteTdomingo(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadTdomingosList();
			});
		});
	}

	deleteTdomingos() {
		const _title: string = 'Tdomingos Delete';
		const _description: string = 'Are you sure to permanently delete selected Tdomingos?';
		const _waitDesciption: string = 'Tdomingos are deleting...';
		const _deleteMessage = 'Selected Tdomingos have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.tdomingosListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadTdomingosList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchTdomingos() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	/* UI **/
	/*getTypeStr(_tdomingo: ProductTdomingoModel): string {
		switch (_tdomingo.type) {
			case 0: return 'Info';
			case 1: return 'Note';
			case 2: return 'Reminder';
			default: return '';
		}
	}*/
}