import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { MultasService } from '../../_core/services/index';
// import { SpecificationsService } from '../../_core/services/specification.service';
import { TmultasService } from '../../_core/services/index';
// import { ProductSpecificationsService } from '../../_core/services/index';
import { MultaModel } from '../../_core/models/multa.model';
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
	selector: 'm-multa-edit',
	templateUrl: './multa-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultaEditComponent implements OnInit {
	multa: MultaModel;
	oldMulta: MultaModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	multaForm: FormGroup;
	hasFormErrors: boolean = false;
	tmultasListState: ListStateModel;
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
		private multasService: MultasService,

		private gestionsService: GestionsService,
		private periodosService: PeriodosService,
		private empleadosService: EmpleadosService,
		private tmultasService: TmultasService,
		// private specificationsService: SpecificationsService,
		// private empleadoSpecificationsService: EmpleadoSpecificationsService,
		private typesUtilsService: TypesUtilsService,
		private multaFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.multasService.getMultaById(id).subscribe(res => {
					// console.log(res);
					this.multa = res;
					this.oldMulta = Object.assign({}, res);
					this.initMulta();
				});
			} else {
				const newMulta = new MultaModel();
				newMulta.clear();
				this.multa = newMulta;
				this.oldMulta = Object.assign({}, newMulta);
				this.initMulta();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initMulta() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.multa.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'Multas',  page: '/ecommerce/multas' },
				{ title: 'Crear Multa', page: '/ecommerce/multas/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar multa');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'Multas',  page: '/ecommerce/multas' },
			{ title: 'Modificar multa', page: '/ecommerce/multas/edit', queryParams: { id: this.multa.id } }
		]);
		this.periodosService.getPeriodosByIdGestion(this.multa.gestion_id).subscribe(res => {
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

		this.multaForm = this.multaFB.group({
			gestion_id: [this.multa.gestion_id.toString(), Validators.required],
			periodo_id: [this.multa.periodo_id.toString(), Validators.required],
			empleado_id: [this.multa.empleado_id.toString(), Validators.required]
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
		this.tmultasListState = new ListStateModel(this.multa.id);
		// console.log(this.multa.id);
		// this.specsListState = new ListStateModel(this.multa.id);
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
		let _backUrl = 'ecommerce/multas';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshMulta(id = 0) {
		const _refreshUrl = 'ecommerce/multas/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.multa = Object.assign({}, this.oldMulta);
		this.createForm();
		this.hasFormErrors = false;
		this.multaForm.markAsPristine();
        this.multaForm.markAsUntouched();
		this.multaForm.updateValueAndValidity();

		this.periodosService.getPeriodosByIdGestion(this.multa.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.multaForm.controls;
		/** check form */
		if (this.multaForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedMulta = this.prepareMulta();

		if (editedMulta.id > 0) {
			this.updateMulta(editedMulta, withBack);
			return;
		}
		this.addMulta(editedMulta, withBack);
	}

	prepareMulta(): MultaModel {
		const controls = this.multaForm.controls;
		const _multa = new MultaModel();

		_multa.id = this.multa.id;
		_multa.gestion_id = +controls['gestion_id'].value;
		_multa.periodo_id = +controls['periodo_id'].value;
		_multa.empleado_id = +controls['empleado_id'].value;
		/*_multa._userId = 1; // TODO: get version from userId
		_multa._createdDate = this.product._createdDate;
		_multa._updatedDate = this.product._updatedDate;*/
		this.tmultasListState.prepareState();
		// this.specsListState.prepareState();
		/*_multa._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_multa._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;*/
		/*_multa._isNew = this.multa.id > 0 ? false : true;
		_multa._isUpdated = this.multa.id > 0;*/
		return _multa;
	}

	addMulta(_multa: MultaModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.multasService.createMulta(_multa).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshMulta(res.id);
			}
		});
	}

	updateMulta(_multa: MultaModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update Multa
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.multasService.updateMulta(_multa)];

		// Update Tmultas
		// console.log(tasks$);
		/*this.tmultasListState.addedItems.forEach(element => {
			tasks$.push(this.tmultasService.createTmulta(element));
			// console.log(element);
		});
		this.tmultasListState.deletedItems.forEach(element => {
				tasks$.push(this.tmultasService.deleteTmulta(element));
		});
		this.tmultasListState.updatedItems.forEach(element => {
				tasks$.push(this.tmultasService.updateTmulta(element));
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
				this.goBack(_multa.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshMulta(_multa.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.multa || !this.multa.id) {
			return result;
		}

		result = `Modificar multa - ${this.multa.id}, ${this.multa.gestion_id}`;
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
