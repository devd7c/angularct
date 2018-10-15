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
import { TmultasService } from '../../../../_core/services/index';
// Models
import { TmultaModel } from '../../../../_core/models/tmulta.model';
import { TmultasDataSource } from '../../../../_core/models/data-sources/tmultas.datasource';
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
	selector: 'm-tmultas-list',
	templateUrl: './tmultas-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TmultasListComponent implements OnInit {
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() tmultasListState: ListStateModel;
	// Table fields
	dataSource: TmultasDataSource;
	displayedColumns = ['select', 'id', 'fecha', 'monto', 'descripcion', 'actions'];
	// displayedColumns = ['select', 'id', 'text', 'type', 'dueDate', 'actions'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<TmultaModel>(true, []);
	tmultasResult: TmultaModel[] = [];
	// Add and Edit
	isSwitchedToEditMode: boolean = false;
	loadingAfterSubmit: boolean = false;
	formGroup: FormGroup;
	tmultaForEdit: TmultaModel;
	tmultaForAdd: TmultaModel;

	constructor(private tmultasService: TmultasService,
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
					this.loadTmultasList();
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
					this.loadTmultasList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new TmultasDataSource(this.tmultasService);
		// console.log(this.productRemraksService);
		// this loading binded to parent component loading
		this.dataSource.loading$.subscribe(res => {
			this.loadingSubject.next(res);
		});
		this.loadTmultasList(true);
		this.dataSource.entitySubject.subscribe(res => this.tmultasResult = res);
		this.createFormGroup();
	}

	// Loading
	loadTmultasList(_isFirstLoading: boolean = false) {
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
		// console.log(this.tmultasListState);
		this.dataSource.loadTmultas(queryParams, this.tmultasListState);
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

	// ADD TMULTA FUNCTIONS: clearAddForm | checkAddForm | addTmultaButtonOnClick | cancelAddButtonOnClick | saveNewTmulta
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

		this.tmultaForAdd = new TmultaModel();
		this.tmultaForAdd.clear(this.tmultasListState.entityId);
		this.tmultaForAdd.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tmultaForAdd._isEditMode = false;
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

	addTmultaButtonOnClick() {
		this.clearAddForm();
		this.tmultaForAdd._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelAddButtonOnClick() {
		this.tmultaForAdd._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveNewTmulta() {
		if (!this.checkAddForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		/* Server loading imitation. Remove 'setTemout' on real code */
		/*setTimeout(() => {}, 1500);*/
		this.loadingAfterSubmit = false;
		this.tmultaForAdd._isEditMode = false;
		this.tmultaForAdd.descripcion = controls['newDescripcion'].value;
		this.tmultaForAdd.monto = +controls['newMonto'].value;
		// const _date = new Date(controls['newFecha'].value);
		this.tmultaForAdd.fecha = this.typesUtilsService.dateFormat(controls['newFecha'].value);
		/*this.tmultaForAdd._updatedDate = this.typesUtilsService.getDateStringFromDate();
		this.tmultaForAdd._createdDate = this.tmultaForEdit._updatedDate;
		this.tmultaForAdd._userId = 1; // Admin TODO: Get from user servics*/
		// this.tmultasListState.setItem(this.tmultaForAdd, StateActions.CREATE);
		this.tmultasService.createTmulta(this.tmultaForAdd).subscribe(res => {
			this.loadTmultasList();
			const _saveMessage = `Tmulta has been created`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, false);
			this.clearAddForm();
		});
	}

	// EDIT TMULTA FUNCTIONS: clearEditForm | checkEditForm | editTmultaButtonOnClick | cancelEditButtonOnClick |
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

		this.tmultaForEdit = new TmultaModel();
		this.tmultaForEdit.clear(this.tmultasListState.entityId);
		this.tmultaForEdit.fecha = this.typesUtilsService.getDateStringFromDate();
		this.tmultaForEdit._isEditMode = false;
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

	editTmultaButtonOnClick(_item: TmultaModel) {
		const controls = this.formGroup.controls;
		controls['editDescripcion'].setValue(_item.descripcion);
		controls['editMonto'].setValue(_item.monto.toString());
		controls['editFecha'].setValue(this.typesUtilsService.getDateFromString(_item.fecha));
		_item._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	cancelEditButtonOnClick(_item: TmultaModel) {
		_item._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	saveUpdateTmulta(_item: TmultaModel) {
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
		// this.tmultasListState.setItem(_item, StateActions.UPDATE);
		this.tmultasService.updateTmulta(_item).subscribe(res => {
			const saveMessage = `Tmulta has been updated`;
			this.isSwitchedToEditMode = false;
			this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, false);
			this.loadTmultasList();
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
		const numRows = this.tmultasResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.tmultasResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/** Delete */
	deleteTmulta(_item: TmultaModel) {
		const _title: string = 'Tmulta Delete';
		const _description: string = 'Are you sure to permanently delete this tmulta?';
		const _waitDesciption: string = 'Tmulta is deleting...';
		const _deleteMessage = `Tmulta has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			// console.log(res);
			if (!res) {
				return;
			}

			_item._isDeleted = true;
			// this.tmultasListState.setItem(_item, StateActions.DELETE);
			this.tmultasService.deleteTmulta(_item).subscribe(() => {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.loadTmultasList();
			});
		});
	}

	deleteTmultas() {
		const _title: string = 'Tmultas Delete';
		const _description: string = 'Are you sure to permanently delete selected tmultas?';
		const _waitDesciption: string = 'Tmultas are deleting...';
		const _deleteMessage = 'Selected tmultas have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			for (let i = 0; i < length; i++) {
				this.selection.selected[i]._isDeleted = true;
				this.tmultasListState.setItem(this.selection.selected[i], StateActions.DELETE);
			}
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadTmultasList();
			this.selection.clear();
		});
	}

	/** Fetch */
	fetchTmultas() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ descripcion: `${elem.id}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	/* UI **/
	/*getTypeStr(_tmulta: ProductTmultaModel): string {
		switch (_tmulta.type) {
			case 0: return 'Info';
			case 1: return 'Note';
			case 2: return 'Reminder';
			default: return '';
		}
	}*/
}
