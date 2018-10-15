import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { HorasService } from '../../_core/services/index';
// import { SpecificationsService } from '../../_core/services/specification.service';
import { ThorasService } from '../../_core/services/index';
// import { ProductSpecificationsService } from '../../_core/services/index';
import { HoraModel } from '../../_core/models/hora.model';
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
	selector: 'm-hora-edit',
	templateUrl: './hora-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoraEditComponent implements OnInit {
	hora: HoraModel;
	oldHora: HoraModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	horaForm: FormGroup;
	hasFormErrors: boolean = false;
	thorasListState: ListStateModel;
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
		private horasService: HorasService,

		private gestionsService: GestionsService,
		private periodosService: PeriodosService,
		private empleadosService: EmpleadosService,
		private thorasService: ThorasService,
		// private specificationsService: SpecificationsService,
		// private empleadoSpecificationsService: EmpleadoSpecificationsService,
		private typesUtilsService: TypesUtilsService,
		private horaFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.horasService.getHoraById(id).subscribe(res => {
					// console.log(res);
					this.hora = res;
					this.oldHora = Object.assign({}, res);
					this.initHora();
				});
			} else {
				const newHora = new HoraModel();
				newHora.clear();
				this.hora = newHora;
				this.oldHora = Object.assign({}, newHora);
				this.initHora();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initHora() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.hora.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'Horas',  page: '/ecommerce/horas' },
				{ title: 'Crear Hora', page: '/ecommerce/horas/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar Hora');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'Horas',  page: '/ecommerce/horas' },
			{ title: 'Modificar hora', page: '/ecommerce/horas/edit', queryParams: { id: this.hora.id } }
		]);
		this.periodosService.getPeriodosByIdGestion(this.hora.gestion_id).subscribe(res => {
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

		this.horaForm = this.horaFB.group({
			gestion_id: [this.hora.gestion_id.toString(), Validators.required],
			periodo_id: [this.hora.periodo_id.toString(), Validators.required],
			empleado_id: [this.hora.empleado_id.toString(), Validators.required]
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
		this.thorasListState = new ListStateModel(this.hora.id);
		// console.log(this.hora.id);
		// this.specsListState = new ListStateModel(this.hora.id);
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
		let _backUrl = 'ecommerce/horas';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshHora(id = 0) {
		const _refreshUrl = 'ecommerce/horas/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.hora = Object.assign({}, this.oldHora);
		this.createForm();
		this.hasFormErrors = false;
		this.horaForm.markAsPristine();
        this.horaForm.markAsUntouched();
		this.horaForm.updateValueAndValidity();

		this.periodosService.getPeriodosByIdGestion(this.hora.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.horaForm.controls;
		/** check form */
		if (this.horaForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedHora = this.prepareHora();

		if (editedHora.id > 0) {
			this.updateHora(editedHora, withBack);
			return;
		}
		this.addHora(editedHora, withBack);
	}

	prepareHora(): HoraModel {
		const controls = this.horaForm.controls;
		const _hora = new HoraModel();

		_hora.id = this.hora.id;
		_hora.gestion_id = +controls['gestion_id'].value;
		_hora.periodo_id = +controls['periodo_id'].value;
		_hora.empleado_id = +controls['empleado_id'].value;
		/*_hora._userId = 1; // TODO: get version from userId
		_hora._createdDate = this.product._createdDate;
		_hora._updatedDate = this.product._updatedDate;*/
		this.thorasListState.prepareState();
		// this.specsListState.prepareState();
		/*_hora._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_hora._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;*/
		/*_hora._isNew = this.hora.id > 0 ? false : true;
		_hora._isUpdated = this.hora.id > 0;*/
		return _hora;
	}

	addHora(_hora: HoraModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.horasService.createHora(_hora).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshHora(res.id);
			}
		});
	}

	updateHora(_hora: HoraModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update Hora
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.horasService.updateHora(_hora)];

		// Update Thoras
		// console.log(tasks$);
		/*this.thorasListState.addedItems.forEach(element => {
			tasks$.push(this.thorasService.createThora(element));
			// console.log(element);
		});
		this.thorasListState.deletedItems.forEach(element => {
				tasks$.push(this.thorasService.deleteThora(element));
		});
		this.thorasListState.updatedItems.forEach(element => {
				tasks$.push(this.thorasService.updateThora(element));
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
				this.goBack(_hora.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshHora(_hora.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.hora || !this.hora.id) {
			return result;
		}

		result = `Modificar Hora - ${this.hora.id}, ${this.hora.gestion_id}`;
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
