import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { EmpleadosService } from '../../_core/services/index';
// import { SpecificationsService } from '../../_core/services/specification.service';
// import { ProductRemarksService } from '../../_core/services/index';
// import { ProductSpecificationsService } from '../../_core/services/index';
import { EmpleadoModel } from '../../_core/models/empleado.model';
// import { SpecificationModel } from '../../_core/models/specification.model';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { ListStateModel } from '../../_core/utils/list-state.model';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { SucursalsService } from '../../_core/services/sucursals.service';
import { SucursalModel } from '../../_core/models/sucursal.model';
import { EmpresasService } from '../../_core/services/empresas.service';
import { EmpresaModel } from '../../_core/models/empresa.model';
import { ContratosService } from '../../_core/services/contratos.service';
import { ContratoModel } from '../../_core/models/contrato.model';
import { PuestosService } from '../../_core/services/puestos.service';
import { PuestoModel } from '../../_core/models/puesto.model';
import { CargosService } from '../../_core/services/cargos.service';
import { CargoModel } from '../../_core/models/cargo.model';

@Component({
	selector: 'm-empleado-edit',
	templateUrl: './empleado-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpleadoEditComponent implements OnInit {
	empleado: EmpleadoModel;
	oldEmpleado: EmpleadoModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	empleadoForm: FormGroup;
	hasFormErrors: boolean = false;
	remarksListState: ListStateModel;
	specsListState: ListStateModel;
	sucursalsTypes: SucursalModel;
	empresasTypes: EmpresaModel;
	contratosTypes: ContratoModel;
	puestosTypes: PuestoModel;
	cargosTypes: CargoModel;


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

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private empleadosService: EmpleadosService,
		private sucursalsService: SucursalsService,
		private empresasService: EmpresasService,
		private contratosService: ContratosService,
		private puestosService: PuestosService,
		private cargosService: CargosService,
		// private remarksService: EmpleadoRemarksService,
		// private specificationsService: SpecificationsService,
		// private empleadoSpecificationsService: EmpleadoSpecificationsService,
		private typesUtilsService: TypesUtilsService,
		private empleadoFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.empleadosService.getEmpleadoById(id).subscribe(res => {
					console.log(res);
					this.empleado = res;
					this.oldEmpleado = Object.assign({}, res);
					this.initEmpleado();
				});
			} else {
				const newEmpleado = new EmpleadoModel();
				newEmpleado.clear();
				this.empleado = newEmpleado;
				this.oldEmpleado = Object.assign({}, newEmpleado);
				this.initEmpleado();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initEmpleado() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.empleado.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'Dependientes',  page: '/ecommerce/empleados' },
				{ title: 'Crear Dependiente', page: '/ecommerce/empleados/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar dependiente');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'Empleados',  page: '/ecommerce/empleados' },
			{ title: 'Modificar dependiente', page: '/ecommerce/empleados/edit', queryParams: { id: this.empleado.id } }
		]);
		this.sucursalsService.getSucursalByIdEmpresa(this.empleado.empresa_id).subscribe(res => {
			// console.log(res.data);
			this.sucursalsTypes = res.data;
		});
	}

	createForm() {
		this.empresasService.getAllEmpresas().subscribe(res => {
			// console.log(res.data);
			this.empresasTypes = res.data;
		});
		this.contratosService.getAllContratos().subscribe(res => {
			// console.log(res);
			this.contratosTypes = res.data;
		});
		this.puestosService.getAllPuestos().subscribe(res => {
			// console.log(res.data);
			this.puestosTypes = res.data;
		});
		this.cargosService.getAllCargos().subscribe(res => {
			// console.log(res.data);
			this.cargosTypes = res.data;
		});

		this.empleado.fNacimiento = this.typesUtilsService.getDateFromString(this.empleado.fecha_nacimiento);
		this.empleado.fIngreso = this.typesUtilsService.getDateFromString(this.empleado.fecha_ingreso);

		this.empleadoForm = this.empleadoFB.group({
			tipo_doc: [this.empleado.tipo_doc.toString(), Validators.required],
			nro_doc: [this.empleado.nro_doc, Validators.required],
			exp_doc: [this.empleado.exp_doc.toString(), Validators.required],
			afiliacion: [this.empleado.afiliacion.toString(), Validators.required],
			nua_cua: [this.empleado.nua_cua, Validators.required],
			nombre: [this.empleado.nombre, Validators.required],
			ap_paterno: [this.empleado.ap_paterno, Validators.required],
			ap_materno: [this.empleado.ap_materno, Validators.required],
			// ap_casada: [this.empleado.ap_casada, Validators.required],
			nacionalidad: [this.empleado.nacionalidad.toString(), Validators.required],
			fNacimiento: [this.empleado.fNacimiento, Validators.nullValidator],
			sexo: [this.empleado.sexo.toString(), Validators.required],
			jubilado: [this.empleado.jubilado.toString(), Validators.required],
			fIngreso: [this.empleado.fIngreso, Validators.nullValidator],
			// fRetiro: [this.empleado.fRetiro, Validators.nullValidator],
			haber_basico: [this.empleado.haber_basico, Validators.required],
			nro_matricula: [this.empleado.nro_matricula, Validators.required],
			categoria: [this.empleado.categoria.toString(), Validators.required],
			domicilio: [this.empleado.domicilio, Validators.required],
			obrero: [this.empleado.obrero.toString(), Validators.required],
			empresa_id: [this.empleado.empresa_id.toString(), Validators.required],
			sucursal_id: [this.empleado.sucursal_id.toString(), Validators.required],
			contrato_id: [this.empleado.contrato_id.toString(), Validators.required],
			puesto_id: [this.empleado.puesto_id.toString(), Validators.required],
			cargo_id: [this.empleado.cargo_id.toString(), Validators.required],
			/*manufacture: [this.empleado.manufacture, Validators.required],
			modelYear: [this.empleado.modelYear.toString(), Validators.required],
			mileage: [this.empleado.mileage, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			description: [this.empleado.description],
			color: [this.empleado.color, Validators.required],
			price: [this.empleado.price, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
			condition: [this.empleado.condition.toString(), [Validators.required, Validators.min(0), Validators.max(1)]],
			status: [this.empleado.status.toString(), [Validators.required, Validators.min(0), Validators.max(1)]],
			VINCode: [this.empleado.VINCode, Validators.required]*/
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

		// this.remarksListState = new ListStateModel(this.empleado.id);
		// this.specsListState = new ListStateModel(this.empleado.id);
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
		let _backUrl = 'ecommerce/empleados';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshEmpleado(id = 0) {
		const _refreshUrl = 'ecommerce/empleados/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.empleado = Object.assign({}, this.oldEmpleado);
		this.createForm();
		this.hasFormErrors = false;
		this.empleadoForm.markAsPristine();
        this.empleadoForm.markAsUntouched();
		this.empleadoForm.updateValueAndValidity();

		this.sucursalsService.getSucursalByIdEmpresa(this.empleado.empresa_id).subscribe(res => {
			console.log(res.data);
			this.sucursalsTypes = res.data;
		});
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.empleadoForm.controls;
		/** check form */
		if (this.empleadoForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedEmpleado = this.prepareEmpleado();

		if (editedEmpleado.id > 0) {
			this.updateEmpleado(editedEmpleado, withBack);
			return;
		}
		this.addEmpleado(editedEmpleado, withBack);
	}

	prepareEmpleado(): EmpleadoModel {
		const controls = this.empleadoForm.controls;
		const _empleado = new EmpleadoModel();

		const _dateNacimiento = controls['fNacimiento'].value;
		if (_dateNacimiento) {
			_empleado.fecha_nacimiento = this.typesUtilsService.dateFormat(_dateNacimiento);
		} else {
			_empleado.fecha_nacimiento = '';
		}
		const _dateIngreso = controls['fIngreso'].value;
		if (_dateIngreso) {
			_empleado.fecha_ingreso = this.typesUtilsService.dateFormat(_dateIngreso);
		} else {
			_empleado.fecha_ingreso = '';
		}

		_empleado.id = this.empleado.id;
		_empleado.tipo_doc = +controls['tipo_doc'].value;
		_empleado.nro_doc = controls['nro_doc'].value;
		_empleado.exp_doc = controls['exp_doc'].value;
		_empleado.afiliacion = +controls['afiliacion'].value;
		_empleado.nua_cua = controls['nua_cua'].value;
		_empleado.nombre = controls['nombre'].value;
		_empleado.ap_paterno = controls['ap_paterno'].value;
		_empleado.ap_materno = controls['ap_materno'].value;
		// _empleado.ap_casada = controls['apCasada'].value;
		_empleado.nacionalidad = controls['nacionalidad'].value;
		_empleado.sexo = +controls['sexo'].value;
		_empleado.jubilado = +controls['jubilado'].value;
		_empleado.haber_basico = controls['haber_basico'].value;
		_empleado.nro_matricula = controls['nro_matricula'].value;
		_empleado.categoria = controls['categoria'].value;
		_empleado.domicilio = controls['domicilio'].value;
		_empleado.obrero = +controls['obrero'].value;
		_empleado.empresa_id = +controls['empresa_id'].value;
		_empleado.sucursal_id = +controls['sucursal_id'].value;
		_empleado.contrato_id = +controls['contrato_id'].value;
		_empleado.puesto_id = +controls['puesto_id'].value;
		_empleado.cargo_id = +controls['cargo_id'].value;
		/*_product.manufacture = controls['manufacture'].value;
		_product.modelYear = +controls['modelYear'].value;
		_product.mileage = +controls['mileage'].value;
		_product.description = controls['description'].value;
		_product.color = controls['color'].value;
		_product.price = +controls['price'].value;
		_product.condition = +controls['condition'].value;
		_product.status = +controls['status'].value;
		_product.VINCode = controls['VINCode'].value;
		_product._userId = 1; // TODO: get version from userId
		_product._createdDate = this.product._createdDate;
		_product._updatedDate = this.product._updatedDate;*/
		// this.remarksListState.prepareState();
		// this.specsListState.prepareState();
		/*_product._updatedDate = this.typesUtilsService.getDateStringFromDate();
		_product._createdDate = this.product.id > 0 ? _product._createdDate : _product._updatedDate;*/
		_empleado._isNew = this.empleado.id > 0 ? false : true;
		_empleado._isUpdated = this.empleado.id > 0;
		return _empleado;
	}

	addEmpleado(_empleado: EmpleadoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.empleadosService.createEmpleado(_empleado).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshEmpleado(res.id);
			}
		});
	}

	updateEmpleado(_empleado: EmpleadoModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update Empleado
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.empleadosService.updateEmpleado(_empleado)];

		// Update Remarks
		// console.log(tasks$);
		/*this.remarksListState.addedItems.forEach(element => {
			tasks$.push(this.remarksService.createRemark(element));
			// console.log(element);
		});
		this.remarksListState.deletedItems.forEach(element => {
				tasks$.push(this.remarksService.deleteRemark(element));
		});
		this.remarksListState.updatedItems.forEach(element => {
				tasks$.push(this.remarksService.updateRemark(element));
		});

		// Update Specs
		this.specsListState.addedItems.forEach(element => {
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
				this.goBack(_empleado.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshEmpleado(_empleado.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.empleado || !this.empleado.id) {
			return result;
		}

		result = `Modificar dependiente - ${this.empleado.nombre}, ${this.empleado.nua_cua}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	onChange(id) {
		this.sucursalsService.getSucursalByIdEmpresa(id).subscribe(res => {
			console.log(res.data);
			this.sucursalsTypes = res.data;
		});
	}
}
