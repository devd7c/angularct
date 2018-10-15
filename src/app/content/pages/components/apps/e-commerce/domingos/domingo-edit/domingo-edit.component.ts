import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { DomingosService } from '../../_core/services/index';
// import { SpecificationsService } from '../../_core/services/specification.service';
import { TdomingosService } from '../../_core/services/index';
// import { ProductSpecificationsService } from '../../_core/services/index';
import { DomingoModel } from '../../_core/models/domingo.model';
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
	selector: 'm-domingo-edit',
	templateUrl: './domingo-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomingoEditComponent implements OnInit {
	domingo: DomingoModel;
	oldDomingo: DomingoModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	domingoForm: FormGroup;
	hasFormErrors: boolean = false;
	tdomingosListState: ListStateModel;
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
		private domingosService: DomingosService,

		private gestionsService: GestionsService,
		private periodosService: PeriodosService,
		private empleadosService: EmpleadosService,
		private tdomingosService: TdomingosService,
		// private specificationsService: SpecificationsService,
		// private empleadoSpecificationsService: EmpleadoSpecificationsService,
		private typesUtilsService: TypesUtilsService,
		private domingoFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.domingosService.getDomingoById(id).subscribe(res => {
					// console.log(res);
					this.domingo = res;
					this.oldDomingo = Object.assign({}, res);
					this.initDomingo();
				});
			} else {
				const newDomingo = new DomingoModel();
				newDomingo.clear();
				this.domingo = newDomingo;
				this.oldDomingo = Object.assign({}, newDomingo);
				this.initDomingo();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initDomingo() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.domingo.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'domingos',  page: '/ecommerce/domingos' },
				{ title: 'Crear domingo', page: '/ecommerce/domingos/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar domingo');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'domingos',  page: '/ecommerce/domingos' },
			{ title: 'Modificar domingo', page: '/ecommerce/domingos/edit', queryParams: { id: this.domingo.id } }
		]);
		this.periodosService.getPeriodosByIdGestion(this.domingo.gestion_id).subscribe(res => {
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

		this.domingoForm = this.domingoFB.group({
			gestion_id: [this.domingo.gestion_id.toString(), Validators.required],
			periodo_id: [this.domingo.periodo_id.toString(), Validators.required],
			empleado_id: [this.domingo.empleado_id.toString(), Validators.required]
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
		this.tdomingosListState = new ListStateModel(this.domingo.id);
		// console.log(this.domingo.id);
		// this.specsListState = new ListStateModel(this.domingo.id);
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
		let _backUrl = 'ecommerce/domingos';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshDomingo(id = 0) {
		const _refreshUrl = 'ecommerce/domingos/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.domingo = Object.assign({}, this.oldDomingo);
		this.createForm();
		this.hasFormErrors = false;
		this.domingoForm.markAsPristine();
        this.domingoForm.markAsUntouched();
		this.domingoForm.updateValueAndValidity();

		this.periodosService.getPeriodosByIdGestion(this.domingo.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.domingoForm.controls;
		/** check form */
		if (this.domingoForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedDomingo = this.prepareDomingo();

		if (editedDomingo.id > 0) {
			this.updateDomingo(editedDomingo, withBack);
			return;
		}
		this.addDomingo(editedDomingo, withBack);
	}

	prepareDomingo(): DomingoModel {
		const controls = this.domingoForm.controls;
		const _domingo = new DomingoModel();

		_domingo.id = this.domingo.id;
		_domingo.gestion_id = +controls['gestion_id'].value;
		_domingo.periodo_id = +controls['periodo_id'].value;
		_domingo.empleado_id = +controls['empleado_id'].value;
		/*_domingo._userId = 1; // TODO: get version from userId
		_domingo._createdDate = this.product._createdDate;
		_domingo._updatedDate = this.product._updatedDate;*/
		this.tdomingosListState.prepareState();
		// this.specsListState.prepareState();
		/*_domingo._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_domingo._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;*/
		/*_domingo._isNew = this.domingo.id > 0 ? false : true;
		_domingo._isUpdated = this.domingo.id > 0;*/
		return _domingo;
	}

	addDomingo(_domingo: DomingoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.domingosService.createDomingo(_domingo).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshDomingo(res.id);
			}
		});
	}

	updateDomingo(_domingo: DomingoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update Domingo
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.domingosService.updateDomingo(_domingo)];

		// Update Tdomingos
		// console.log(tasks$);
		/*this.tdomingosListState.addedItems.forEach(element => {
			tasks$.push(this.tdomingosService.createTdomingo(element));
			// console.log(element);
		});
		this.tdomingosListState.deletedItems.forEach(element => {
				tasks$.push(this.tdomingosService.deleteTdomingo(element));
		});
		this.tdomingosListState.updatedItems.forEach(element => {
				tasks$.push(this.tdomingosService.updateTdomingo(element));
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
				this.goBack(_domingo.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshDomingo(_domingo.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.domingo || !this.domingo.id) {
			return result;
		}

		result = `Modificar domingo - ${this.domingo.id}, ${this.domingo.gestion_id}`;
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