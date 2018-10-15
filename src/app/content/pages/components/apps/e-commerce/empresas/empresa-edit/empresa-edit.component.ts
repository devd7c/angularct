import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { EmpresasService } from '../../_core/services/index';
import { EmpresaModel } from '../../_core/models/empresa.model';
import { SucursalsService } from '../../_core/services/index';
import { SucursalModel } from '../../_core/models/sucursal.model';
import { GestionsService } from '../../_core/services/gestions.service';
import { GestionModel } from '../../_core/models/gestion.model';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { ListStateModel } from '../../_core/utils/list-state.model';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
/*
import { PeriodosService } from '../../_core/services/periodos.service';
import { PeriodoModel } from '../../_core/models/periodo.model';
import { EmpleadosService } from '../../_core/services/empleados.service';
import { EmpleadoModel } from '../../_core/models/empleado.model';*/

@Component({
	selector: 'm-empresa-edit',
	templateUrl: './empresa-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpresaEditComponent implements OnInit {
	empresa: EmpresaModel;
	oldEmpresa: EmpresaModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	empresaForm: FormGroup;
	hasFormErrors: boolean = false;
	sucursalsListState: ListStateModel;
	gestionsListState: ListStateModel;
	laboralsListState: ListStateModel;
	patronalsListState: ListStateModel;
	gestionsTypes: GestionModel;
	/*periodosTypes: PeriodoModel;
	empleadosTypes: EmpleadoModel;*/


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
		// private periodosService: PeriodosService,
		private empresasService: EmpresasService,
		private gestionsService: GestionsService,
		private sucursalsService: SucursalsService,
		private typesUtilsService: TypesUtilsService,
		private empresaFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.empresasService.getEmpresaById(id).subscribe(res => {
					// console.log(res);
					this.empresa = res;
					this.oldEmpresa = Object.assign({}, res);
					this.initEmpresa();
				});
			} else {
				const newEmpresa = new EmpresaModel();
				newEmpresa.clear();
				this.empresa = newEmpresa;
				this.oldEmpresa = Object.assign({}, newEmpresa);
				this.initEmpresa();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initEmpresa() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.empresa.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'empresas',  page: '/ecommerce/empresas' },
				{ title: 'Crear empresa', page: '/ecommerce/empresas/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar empresa');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'empresas',  page: '/ecommerce/empresas' },
			{ title: 'Modificar empresa', page: '/ecommerce/empresas/edit', queryParams: { id: this.empresa.id } }
		]);
		/*this.empresasService.getPeriodoByIdGestion(this.empresa.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});*/
	}

	createForm() {
		/*this.gestionsService.getAllGestiones().subscribe(res => {
			// console.log(res.data);
			this.gestionsTypes = res.data;
		});*/
		/*this.periodosService.getAllPeriodos().subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});*/
		/*this.empleadosService.getAllEmpleados().subscribe(res => {
			// console.log(res.data);
			this.empleadosTypes = res.data;
		});*/

		this.empresaForm = this.empresaFB.group({
			nombre: [this.empresa.nombre, Validators.required],
			tipo_doc: [this.empresa.tipo_doc.toString(), Validators.required],
			nro_doc: [this.empresa.nro_doc, Validators.required],
			exp_doc: [this.empresa.exp_doc.toString(), Validators.required],
			nit: [this.empresa.nit, Validators.required],
			nombre_rep_legal: [this.empresa.nombre_rep_legal, Validators.required],
			titulo_rep_legal: [this.empresa.titulo_rep_legal, Validators.required],
			/*gestion_id: [this.empresa.gestion_id.toString(), Validators.required],
			periodo_id: [this.empresa.periodo_id.toString(), Validators.required],
			empleado_id: [this.empresa.empleado_id.toString(), Validators.required]*/
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
		this.sucursalsListState = new ListStateModel(this.empresa.id);
		this.gestionsListState = new ListStateModel(this.empresa.id);
		this.laboralsListState = new ListStateModel(this.empresa.id);
		this.patronalsListState = new ListStateModel(this.empresa.id);
		// console.log(this.empresa.id);
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
		let _backUrl = 'ecommerce/empresas';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshEmpresa(id = 0) {
		const _refreshUrl = 'ecommerce/empresas/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.empresa = Object.assign({}, this.oldEmpresa);
		this.createForm();
		this.hasFormErrors = false;
		this.empresaForm.markAsPristine();
        this.empresaForm.markAsUntouched();
		this.empresaForm.updateValueAndValidity();

		/*this.periodosService.getPeriodoByIdGestion(this.empresa.gestion_id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});*/
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.empresaForm.controls;
		/** check form */
		if (this.empresaForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedEmpresa = this.prepareEmpresa();

		if (editedEmpresa.id > 0) {
			this.updateEmpresa(editedEmpresa, withBack);
			return;
		}
		this.addEmpresa(editedEmpresa, withBack);
	}

	prepareEmpresa(): EmpresaModel {
		const controls = this.empresaForm.controls;
		const _empresa = new EmpresaModel();

		_empresa.id = this.empresa.id;
		_empresa.nombre = controls['nombre'].value;
		_empresa.tipo_doc = +controls['tipo_doc'].value;
		_empresa.nro_doc = controls['nro_doc'].value;
		_empresa.exp_doc = controls['exp_doc'].value;
		_empresa.nit = controls['nit'].value;
		_empresa.nombre_rep_legal = controls['nombre_rep_legal'].value;
		_empresa.titulo_rep_legal = controls['titulo_rep_legal'].value;
		/*_empresa.gestion_id = +controls['gestion_id'].value;
		_empresa.periodo_id = +controls['periodo_id'].value;
		_empresa.empleado_id = +controls['empleado_id'].value;*/
		/*_empresa._userId = 1; // TODO: get version from userId
		_empresa._createdDate = this.product._createdDate;
		_empresa._updatedDate = this.product._updatedDate;*/
		this.sucursalsListState.prepareState();
		this.gestionsListState.prepareState();
		this.laboralsListState.prepareState();
		this.patronalsListState.prepareState();
		/*_empresa._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_empresa._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;*/
		/*_empresa._isNew = this.empresa.id > 0 ? false : true;
		_empresa._isUpdated = this.empresa.id > 0;*/
		return _empresa;
	}

	addEmpresa(_empresa: EmpresaModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.empresasService.createEmpresa(_empresa).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshEmpresa(res.id);
			}
		});
	}

	updateEmpresa(_empresa: EmpresaModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update Empresa
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.empresasService.updateEmpresa(_empresa)];

		// Update sucursals
		// console.log(tasks$);
		/*this.sucursalsListState.addedItems.forEach(element => {
			tasks$.push(this.sucursalsService.createSucursal(element));
			// console.log(element);
		});
		this.sucursalsListState.deletedItems.forEach(element => {
				tasks$.push(this.sucursalsService.deleteSucursal(element));
		});
		this.sucursalsListState.updatedItems.forEach(element => {
				tasks$.push(this.sucursalsService.updateSucursal(element));
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
				this.goBack(_empresa.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshEmpresa(_empresa.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.empresa || !this.empresa.id) {
			return result;
		}

		result = `Modificar Empresa - ${this.empresa.nombre}, ${this.empresa.nit}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/*onChange(id) {
		this.periodosService.getPeriodoByIdGestion(id).subscribe(res => {
			// console.log(res.data);
			this.periodosTypes = res.data;
		});
	}*/
}
