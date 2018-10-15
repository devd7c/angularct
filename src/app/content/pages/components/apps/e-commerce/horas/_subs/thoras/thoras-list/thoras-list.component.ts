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
import { ThorasService } from '../../../../_core/services/index';
// Models
import { ThoraModel } from '../../../../_core/models/thora.model';
import { ThorasDataSource } from '../../../../_core/models/data-sources/thoras.datasource';
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
	selector: 'm-thoras-list',
	templateUrl: './thoras-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThorasListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() thorasListState: ListStateModel;
	// Table fields
	dataSource: ThorasDataSource;
	displayedColumns = ['select', 'id', 'fecha', 'cantidad', 'monto', 'descripcion', 'actions'];
	// displayedColumns = ['select', 'id', 'text', 'type', 'dueDate', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<ThoraModel>(true, []);
	thorasResult: ThoraModel[] = [];
	// Add and Edit
	isSwitchedToEditMode: boolean = false;
	loadingAfterSubmit: boolean = false;
	formGroup: FormGroup;
	thoraForEdit: ThoraModel;
	thoraForAdd: ThoraModel;

	constructor(private thorasService: ThorasService,
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
					this.loadThorasList();
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
					this.loadThorasList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new ThorasDataSource(this.thorasService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadThorasList(true);
		this.dataSource.entitySubject.subscribe(res => this.thorasResult = res);
		this.createFormGroup();
	}

	// Loading
	loadThorasList(_isFirstLoading: boolean = false) {
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
		// console.log(this.thorasListState);
		this.dataSource.loadThoras(queryParams, this.thorasListState);
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

	// ADD THORA FUNCTIONS: clearAddForm | checkAddForm | addThoraButtonOnClick | cancelAddButtonOnClick | saveNewThora
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

		this.thoraForAdd = new ThoraModel();
		this.thoraForAdd.clear(this.thorasListState.entityId);
		this.thoraForAdd.fecha = this.typesUtilsService.getDateStringFromDate();
		this.thoraForAdd._isEditMode = false;
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

	addThoraButtonOnClick() {
		this.clearAddForm();
		this.thoraForAdd._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelAddButtonOnClick() {
		this.thoraForAdd._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveNewThora() {
		if (!this.checkAddForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		/* Server loading imitation. Remove 'setTemout' on real code */
		/*setTimeout(() => {}, 1500);*/
		this.loadingAfterSubmit = false;
		this.thoraForAdd._isEditMode = false;
		// const _date = new Date(controls['newFecha'].value);
		this.thoraForAdd.fecha = this.typesUtilsService.dateFormat(controls['newFecha'].value);
		this.thoraForAdd.cantidad = +controls['newCantidad'].value;
		this.thoraForAdd.monto = +controls['newMonto'].value;
		this.thoraForAdd.descripcion = controls['newDescripcion'].value;
		/*this.thoraForAdd._updatedDate = this.typesUtilsService.getDateStringFromDate();
		this.thoraForAdd._createdDate = this.thoraForEdit._updatedDate;
		this.thoraForAdd._userId = 1; // Admin TODO: Get from user servics*/
		// this.thorasListState.setItem(this.thoraForAdd, StateActions.CREATE);
		this.thorasService.createThora(this.thoraForAdd).subscribe(res => {
			this.loadThorasList();
			const _saveMessage = `Thora has been created`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
			this.clearAddForm();
		});
	}

	// EDIT THORA FUNCTIONS: clearEditForm | checkEditForm | editThoraButtonOnClick | cancelEditButtonOnClick |
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

		this.thoraForEdit = new ThoraModel();
		this.thoraForEdit.clear(this.thorasListState.entityId);
		this.thoraForEdit.fecha = this.typesUtilsService.getDateStringFromDate();
		this.thoraForEdit._isEditMode = false;
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

	editThoraButtonOnClick(_item: ThoraModel) {
		const controls = this.formGroup.controls;
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString(_item.fecha));
		controls['editCantidad'].setValue(_item.cantidad.toString());
		controls['editMonto'].setValue(_item.monto.toString());
		controls['editDescripcion'].setValue(_item.descripcion);

		_item._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelEditButtonOnClick(_item: ThoraModel) {
		_item._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveUpdateThora(_item: ThoraModel) {
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
		// this.thorasListState.setItem(_item, StateActions.UPDATE);
		this.thorasService.updateThora(_item).subscribe(res => {
			const saveMessage = `Thora has been updated`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
			this.loadThorasList();
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
		const numRows = this.thorasResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.thorasResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteThora(_item: ThoraModel) {
		const _title: string = 'Thora Delete';
		const _description: string = 'Are you sure to permanently delete this thora?';
		const _waitDesciption: string = 'Thora is deleting...';
		const _deleteMessage = `Thora has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.thorasListState.setItem(_item, StateActions.DELETE);
			this.thorasService.deleteThora(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadThorasList();
			});
		});
	}

	deleteThoras() {
		const _title: string = 'Thoras Delete';
		const _description: string = 'Are you sure to permanently delete selected thoras?';
		const _waitDesciption: string = 'Thoras are deleting...';
		const _deleteMessage = 'Selected thoras have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.thorasListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadThorasList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchThoras() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	/* UI **/
	/*getTypeStr(_thora: ProductThoraModel): string {
		switch (_thora.type) {
			case 0: return 'Info';
			case 1: return 'Note';
			case 2: return 'Reminder';
			default: return '';
		}
	}*/
}
