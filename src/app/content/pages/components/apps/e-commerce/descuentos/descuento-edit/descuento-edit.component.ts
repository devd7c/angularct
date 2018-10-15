import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { DescuentosService } from '../../_core/services/index';
// import { SpecificationsService } from '../../_core/services/specification.service';
import { TdescuentosService } from '../../_core/services/index';
// import { ProductSpecificationsService } from '../../_core/services/index';
import { DescuentoModel } from '../../_core/models/descuento.model';
// import { SpecificationModel } from '../../_core/models/specification.model';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { ListStateModel } from '../../_core/utils/list-state.model';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { GestionsService } from '../../_core/services/gestions.service';
import { GestionModel } from '../../_core/models/gestion.model';
import { PeriodosService } from '../../_core/services/periodos.service';
import { PeriodoModel } from '../../_core/models/periodo.model';
import { EmpleadosService } from '../../_core/services/empleados.service';
import { EmpleadoModel } from '../../_core/models/empleado.model';

@Component({
	selector: 'm-descuento-edit',
	templateUrl: './descuento-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DescuentoEditComponent implements OnInit {
	descuento: DescuentoModel;
	oldDescuento: DescuentoModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	descuentoForm: FormGroup;
	hasFormErrors: boolean = false;
	tdescuentosListState: ListStateModel;
	specsListState: ListStateModel;

	gestionsTypes: GestionModel;
	periodosTypes: PeriodoModel;
	empleadosTypes: EmpleadoModel;


	/*availableYears: number[] = [];
	availableColors: string[] =
		['Red', 'CadetBlue', 'Gold', 'LightSlateGrey', 'RoyalBlue', 'Crimson', 'Blue', 'Sienna', 'Indigo', 'Green', 'Violet',
			'GoldenRod', 'OrangeRed', 'Khaki', 'Teal', 'Purple', 'Orange', 'Pink', 'Black', 'DarkTurquoise'];
	filteredColors: Observable<string[]>;
	availableManufactures: string[] =
		['Pontiac', 'Subaru', 'Mitsubishi', 'Oldsmobile', 'Chevrolet', 'Chrysler', 'Suzuki', 'GMC', 'Cadillac', 'Mercury', 'Dodge',
			'Ram', 'Lexus', 'Lamborghini', 'Honda', 'Nissan', 'Ford', 'Hyundai', 'Saab', 'Toyota'];
	availableSpecificationTypes: SpecificationModel[] = [];
	filteredManufactures: Observable<string[]>;*/

	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		private descuentosService: DescuentosService,

		private gestionsService: GestionsService,
		private periodosService: PeriodosService,
		private empleadosService: EmpleadosService,
		private tdescuentosService: TdescuentosService,
		// private specificationsService: SpecificationsService,
		// private empleadoSpecificationsService: EmpleadoSpecificationsService,
		private typesUtilsService: TypesUtilsService,
		private descuentoFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.descuentosService.getDescuentoById(id).subscribe(res => {
					// console.log(res);
					this.descuento = res;
					this.oldDescuento = Object.assign({}, res);
					this.initDescuento();
				});
			} else {
				const newDescuento = new DescuentoModel();
				newDescuento.clear();
				this.descuento = newDescuento;
				this.oldDescuento = Object.assign({}, newDescuento);
				this.initDescuento();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initDescuento() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.descuento.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'Descuentos',  page: '/ecommerce/descuentos' },
				{ title: 'Crear Descuento', page: '/ecommerce/descuentos/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar descuento');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'Descuentos',  page: '/ecommerce/descuentos' },
			{ title: 'Modificar descuento', page: '/ecommerce/descuentos/edit', queryParams: { id: this.descuento.id } }
		]);
		this.periodosService.getPeriodosByIdGestion(this.descuento.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}

	createForm() {
		this.gestionsService.getAllGestions().subscribe(res => {
			// console.log(res.data);
			this.gestionsTypes = res.data;
		});
		/*this.periodosService.getAllPeriodos().subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});*/
		this.empleadosService.getAllEmpleados().subscribe(res => {
			// console.log(res.data);
			this.empleadosTypes = res.data;
		});

		this.descuentoForm = this.descuentoFB.group({
			gestion_id: [this.descuento.gestion_id.toString(), Validators.required],
			periodo_id: [this.descuento.periodo_id.toString(), Validators.required],
			empleado_id: [this.descuento.empleado_id.toString(), Validators.required]
		});

		/*this.filteredManufactures = this.productForm.controls.manufacture.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterManufacture(val.toString()))
			);
		this.filteredColors = this.productForm.controls.color.valueChanges
			.pipe(
				startWith(''),
				map(val => this.filterColor(val.toString()))
		);*/

		/*this.specificationsService.getSpecs().subscribe(res => {
			this.availableSpecificationTypes = res;
		});*/
	}

	loadLists() {
		this.tdescuentosListState = new ListStateModel(this.descuento.id);
		// console.log(this.descuento.id);
		// this.specsListState = new ListStateModel(this.descuento.id);
	}

	/*filterManufacture(val: string): string[] {
		return this.availableManufactures.filter(option =>
			option.toLowerCase().includes(val.toLowerCase()));
	}

	filterColor(val: string): string[] {
		return this.availableColors.filter(option =>
			option.toLowerCase().includes(val.toLowerCase()));
	}*/

	goBack(id = 0) {
		let _backUrl = 'ecommerce/descuentos';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshDescuento(id = 0) {
		const _refreshUrl = 'ecommerce/descuentos/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.descuento = Object.assign({}, this.oldDescuento);
		this.createForm();
		this.hasFormErrors = false;
		this.descuentoForm.markAsPristine();
        this.descuentoForm.markAsUntouched();
		this.descuentoForm.updateValueAndValidity();

		this.periodosService.getPeriodosByIdGestion(this.descuento.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.descuentoForm.controls;
		/** check form */
		if (this.descuentoForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedDescuento = this.prepareDescuento();

		if (editedDescuento.id > 0) {
			this.updateDescuento(editedDescuento, withBack);
			return;
		}
		this.addDescuento(editedDescuento, withBack);
	}

	prepareDescuento(): DescuentoModel {
		const controls = this.descuentoForm.controls;
		const _descuento = new DescuentoModel();

		_descuento.id = this.descuento.id;
		_descuento.gestion_id = +controls['gestion_id'].value;
		_descuento.periodo_id = +controls['periodo_id'].value;
		_descuento.empleado_id = +controls['empleado_id'].value;
		/*_descuento._userId = 1; // TODO: get version from userId
		_descuento._createdDate = this.product._createdDate;
		_descuento._updatedDate = this.product._updatedDate;*/
		this.tdescuentosListState.prepareState();
		// this.specsListState.prepareState();
		/*_descuento._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_descuento._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;*/
		/*_descuento._isNew = this.descuento.id > 0 ? false : true;
		_descuento._isUpdated = this.descuento.id > 0;*/
		return _descuento;
	}

	addDescuento(_descuento: DescuentoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.descuentosService.createDescuento(_descuento).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshDescuento(res.id);
			}
		});
	}

	updateDescuento(_descuento: DescuentoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update Descuento
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.descuentosService.updateDescuento(_descuento)];

		// Update Tdescuentos
		// console.log(tasks$);
		/*this.tdescuentosListState.addedItems.forEach(element => {
			tasks$.push(this.tdescuentosService.createTdescuento(element));
			// console.log(element);
		});
		this.tdescuentosListState.deletedItems.forEach(element => {
				tasks$.push(this.tdescuentosService.deleteTdescuento(element));
		});
		this.tdescuentosListState.updatedItems.forEach(element => {
				tasks$.push(this.tdescuentosService.updateTdescuento(element));
		});*/

		// Update Specs
		/*this.specsListState.addedItems.forEach(element => {
			tasks$.push(this.productSpecificationsService.createSpec(element));
		});
		this.specsListState.deletedItems.forEach(element => {
			tasks$.push(this.productSpecificationsService.deleteSpec(element));
		});
		this.specsListState.updatedItems.forEach(element => {
			tasks$.push(this.productSpecificationsService.updateSpec(element));
		});*/

		forkJoin(tasks$).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(_descuento.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshDescuento(_descuento.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.descuento || !this.descuento.id) {
			return result;
		}

		result = `Modificar descuento - ${this.descuento.id}, ${this.descuento.gestion_id}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	onChange(id) {
		this.periodosService.getPeriodosByIdGestion(id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}
}
