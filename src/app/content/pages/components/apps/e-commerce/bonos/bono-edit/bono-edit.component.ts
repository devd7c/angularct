import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { BonosService } from '../../_core/services/index';
// import { SpecificationsService } from '../../_core/services/specification.service';
import { TbonosService } from '../../_core/services/index';
// import { ProductSpecificationsService } from '../../_core/services/index';
import { BonoModel } from '../../_core/models/bono.model';
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
	selector: 'm-bono-edit',
	templateUrl: './bono-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BonoEditComponent implements OnInit {
	bono: BonoModel;
	oldBono: BonoModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	bonoForm: FormGroup;
	hasFormErrors: boolean = false;
	tbonosListState: ListStateModel;
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
		private bonosService: BonosService,

		private gestionsService: GestionsService,
		private periodosService: PeriodosService,
		private empleadosService: EmpleadosService,
		private tbonosService: TbonosService,
		// private specificationsService: SpecificationsService,
		// private empleadoSpecificationsService: EmpleadoSpecificationsService,
		private typesUtilsService: TypesUtilsService,
		private bonoFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.bonosService.getBonoById(id).subscribe(res => {
					// console.log(res);
					this.bono = res;
					this.oldBono = Object.assign({}, res);
					this.initBono();
				});
			} else {
				const newBono = new BonoModel();
				newBono.clear();
				this.bono = newBono;
				this.oldBono = Object.assign({}, newBono);
				this.initBono();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initBono() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.bono.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'bonos',  page: '/ecommerce/bonos' },
				{ title: 'Crear bono', page: '/ecommerce/bonos/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar bono');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'bonos',  page: '/ecommerce/bonos' },
			{ title: 'Modificar bono', page: '/ecommerce/bonos/edit', queryParams: { id: this.bono.id } }
		]);
		this.periodosService.getPeriodosByIdGestion(this.bono.gestion_id).subscribe(res => {
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

		this.bonoForm = this.bonoFB.group({
			gestion_id: [this.bono.gestion_id.toString(), Validators.required],
			periodo_id: [this.bono.periodo_id.toString(), Validators.required],
			empleado_id: [this.bono.empleado_id.toString(), Validators.required]
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
		this.tbonosListState = new ListStateModel(this.bono.id);
		// console.log(this.bono.id);
		// this.specsListState = new ListStateModel(this.bono.id);
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
		let _backUrl = 'ecommerce/bonos';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshBono(id = 0) {
		const _refreshUrl = 'ecommerce/bonos/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.bono = Object.assign({}, this.oldBono);
		this.createForm();
		this.hasFormErrors = false;
		this.bonoForm.markAsPristine();
        this.bonoForm.markAsUntouched();
		this.bonoForm.updateValueAndValidity();

		this.periodosService.getPeriodosByIdGestion(this.bono.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.bonoForm.controls;
		/** check form */
		if (this.bonoForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedBono = this.prepareBono();

		if (editedBono.id > 0) {
			this.updateBono(editedBono, withBack);
			return;
		}
		this.addBono(editedBono, withBack);
	}

	prepareBono(): BonoModel {
		const controls = this.bonoForm.controls;
		const _bono = new BonoModel();

		_bono.id = this.bono.id;
		_bono.gestion_id = +controls['gestion_id'].value;
		_bono.periodo_id = +controls['periodo_id'].value;
		_bono.empleado_id = +controls['empleado_id'].value;
		/*_bono._userId = 1; // TODO: get version from userId
		_bono._createdDate = this.product._createdDate;
		_bono._updatedDate = this.product._updatedDate;*/
		this.tbonosListState.prepareState();
		// this.specsListState.prepareState();
		/*_bono._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_bono._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;*/
		/*_bono._isNew = this.bono.id > 0 ? false : true;
		_bono._isUpdated = this.bono.id > 0;*/
		return _bono;
	}

	addBono(_bono: BonoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.bonosService.createBono(_bono).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshBono(res.id);
			}
		});
	}

	updateBono(_bono: BonoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update bono
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.bonosService.updateBono(_bono)];

		// Update Tbonos
		// console.log(tasks$);
		/*this.tbonosListState.addedItems.forEach(element => {
			tasks$.push(this.tbonosService.createTbono(element));
			// console.log(element);
		});
		this.tbonosListState.deletedItems.forEach(element => {
				tasks$.push(this.tbonosService.deleteTbono(element));
		});
		this.tbonosListState.updatedItems.forEach(element => {
				tasks$.push(this.tbonosService.updateTbono(element));
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
				this.goBack(_bono.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshBono(_bono.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.bono || !this.bono.id) {
			return result;
		}

		result = `Modificar Bono - ${this.bono.id}, ${this.bono.gestion_id}`;
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