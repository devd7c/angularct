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
import { TbonosService } from '../../../../_core/services/index';
// Models
import { TbonoModel } from '../../../../_core/models/tbono.model';
import { TbonosDataSource } from '../../../../_core/models/data-sources/tbonos.datasource';
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
	selector: 'm-tbonos-list',
	templateUrl: './tbonos-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TbonosListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() tbonosListState: ListStateModel;
	// Table fields
	dataSource: TbonosDataSource;
	displayedColumns = ['select', 'id', 'fecha', 'monto', 'descripcion', 'actions'];
	// displayedColumns = ['select', 'id', 'text', 'type', 'dueDate', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<TbonoModel>(true, []);
	tbonosResult: TbonoModel[] = [];
	// Add and Edit
	isSwitchedToEditMode: boolean = false;
	loadingAfterSubmit: boolean = false;
	formGroup: FormGroup;
	tbonoForEdit: TbonoModel;
	tbonoForAdd: TbonoModel;

	constructor(private tbonosService: TbonosService,
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
					this.loadTbonosList();
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
					this.loadTbonosList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new TbonosDataSource(this.tbonosService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadTbonosList(true);
		this.dataSource.entitySubject.subscribe(res => this.tbonosResult = res);
		this.createFormGroup();
	}

	// Loading
	loadTbonosList(_isFirstLoading: boolean = false) {
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
		// console.log(this.tbonosListState);
		this.dataSource.loadTbonos(queryParams, this.tbonosListState);
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

	// ADD TBONO FUNCTIONS: clearAddForm | checkAddForm | addTbonoButtonOnClick | cancelAddButtonOnClick | saveNewTbono
	clearAddForm() {
		const controls = this.formGroup.controls;
		controls['newFecha'].setValue(this.typesUtilsService.getDateFromString());
		controls['newFecha'].markAsPristine();
		controls['newFecha'].markAsUntouched();
		controls['newMonto'].setValue('0');
		controls['newMonto'].markAsPristine();
		controls['newMonto'].markAsUntouched();
		controls['newDescripcion'].setValue('');
		controls['newDescripcion'].markAsPristine();
		controls['newDescripcion'].markAsUntouched();

		this.tbonoForAdd = new TbonoModel();
		this.tbonoForAdd.clear(this.tbonosListState.entityId);
		this.tbonoForAdd.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tbonoForAdd._isEditMode = false;
	}

	checkAddForm() {
		const controls = this.formGroup.controls;
		if (controls['newDescripcion'].invalid || controls['newMonto'].invalid || controls['newFecha'].invalid) {
			controls['newFecha'].markAsTouched();
			controls['newMonto'].markAsTouched();
			controls['newDescripcion'].markAsTouched();
			return false;
		}

		return true;
	}

	addTbonoButtonOnClick() {
		this.clearAddForm();
		this.tbonoForAdd._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelAddButtonOnClick() {
		this.tbonoForAdd._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveNewTbono() {
		if (!this.checkAddForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		/* Server loading imitation. Remove 'setTemout' on real code */
		/*setTimeout(() => {}, 1500);*/
		this.loadingAfterSubmit = false;
		this.tbonoForAdd._isEditMode = false;
		// const _date = new Date(controls['newFecha'].value);
		this.tbonoForAdd.fecha = this.typesUtilsService.dateFormat(controls['newFecha'].value);
		this.tbonoForAdd.monto = +controls['newMonto'].value;
		this.tbonoForAdd.descripcion = controls['newDescripcion'].value;
		/*this.tbonoForAdd._updatedDate = this.typesUtilsService.getDateStringFromDate();
		this.tbonoForAdd._createdDate = this.tbonoForEdit._updatedDate;
		this.tbonoForAdd._userId = 1; // Admin TODO: Get from user servics*/
		// this.tbonosListState.setItem(this.tbonoForAdd, StateActions.CREATE);
		this.tbonosService.createTbono(this.tbonoForAdd).subscribe(res => {
			this.loadTbonosList();
			const _saveMessage = `Tbono has been created`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
			this.clearAddForm();
		});
	}

	// EDIT TBONO FUNCTIONS: clearEditForm | checkEditForm | editTbonoButtonOnClick | cancelEditButtonOnClick |
	clearEditForm() {
		const controls = this.formGroup.controls;
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString());
		// controls['editFecha'].markAsPristine();
		// controls['editFecha'].markAsUntouched();
		controls['editMonto'].setValue('0');
		// controls['editMonto'].markAsPristine();
		// controls['editMonto'].markAsUntouched();
		controls['editDescripcion'].setValue('');
		// controls['editDescripcion'].markAsPristine();
		// controls['editDescripcion'].markAsUntouched();

		this.tbonoForEdit = new TbonoModel();
		this.tbonoForEdit.clear(this.tbonosListState.entityId);
		this.tbonoForEdit.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tbonoForEdit._isEditMode = false;
	}

	checkEditForm() {
		const controls = this.formGroup.controls;
		if (controls['editDescripcion'].invalid ||	controls['editMonto'].invalid || controls['editFecha'].invalid) {
			// controls['editFecha'].markAsTouched();
			// controls['editMonto'].markAsTouched();
			// controls['editDescripcion'].markAsTouched();
			return false;
		}
		return true;
	}

	editTbonoButtonOnClick(_item: TbonoModel) {
		const controls = this.formGroup.controls;
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString(_item.fecha));
		controls['editMonto'].setValue(_item.monto.toString());
		controls['editDescripcion'].setValue(_item.descripcion);

		_item._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelEditButtonOnClick(_item: TbonoModel) {
		_item._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveUpdateTbono(_item: TbonoModel) {
		if (!this.checkEditForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		this.loadingAfterSubmit = false;
		const _date = new Date(controls['editFecha'].value);
		_item.fecha = this.typesUtilsService.dateFormat(_date);
		_item.monto = +controls['editMonto'].value;
		_item.descripcion = controls['editDescripcion'].value;
		// _item._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_item._isEditMode = false;
		// console.log(_item);
		// this.tbonosListState.setItem(_item, StateActions.UPDATE);
		this.tbonosService.updateTbono(_item).subscribe(res => {
			const saveMessage = `Tbono has been updated`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
			this.loadTbonosList();
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
		const numRows = this.tbonosResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.tbonosResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteTbono(_item: TbonoModel) {
		const _title: string = 'Tbono Delete';
		const _description: string = 'Are you sure to permanently delete this tbono?';
		const _waitDesciption: string = 'Tbono is deleting...';
		const _deleteMessage = `Tbono has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.tbonosListState.setItem(_item, StateActions.DELETE);
			this.tbonosService.deleteTbono(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadTbonosList();
			});
		});
	}

	deleteTbonos() {
		const _title: string = 'Tbonos Delete';
		const _description: string = 'Are you sure to permanently delete selected tbonos?';
		const _waitDesciption: string = 'Tbonos are deleting...';
		const _deleteMessage = 'Selected Tbonos have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.tbonosListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadTbonosList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchTbonos() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	/* UI **/
	/*getTypeStr(_tbono: ProductTbonoModel): string {
		switch (_tbono.type) {
			case 0: return 'Info';
			case 1: return 'Note';
			case 2: return 'Reminder';
			default: return '';
		}
	}*/
}
