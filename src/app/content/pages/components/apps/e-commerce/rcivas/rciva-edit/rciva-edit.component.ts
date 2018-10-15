import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, from, of, BehaviorSubject } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
// import { SpecificationsService } from '../../_core/services/specification.service';
// import { ProductRemarksService } from '../../_core/services/index';
// import { ProductSpecificationsService } from '../../_core/services/index';
// import { SpecificationModel } from '../../_core/models/specification.model';
import { RcivasService } from '../../_core/services/index';
import { RcivaModel } from '../../_core/models/rciva.model';
import { TypesUtilsService } from '../../_core/utils/types-utils.service';
import { ListStateModel } from '../../_core/utils/list-state.model';
import { SubheaderService } from '../../../../../../../core/services/layout/subheader.service';
import { LayoutUtilsService, MessageType } from '../../_core/utils/layout-utils.service';
import { EmpresasService } from '../../_core/services/empresas.service';
import { EmpresaModel } from '../../_core/models/empresa.model';
import { ContratosService } from '../../_core/services/contratos.service';
import { ContratoModel } from '../../_core/models/contrato.model';
import { PuestosService } from '../../_core/services/puestos.service';
import { PuestoModel } from '../../_core/models/puesto.model';
import { CargosService } from '../../_core/services/cargos.service';
import { CargoModel } from '../../_core/models/cargo.model';

@Component({
	selector: 'm-rciva-edit',
	templateUrl: './rciva-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RcivaEditComponent implements OnInit {
	rciva: RcivaModel;
	oldRciva: RcivaModel;
	selectedTab: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	rcivaForm: FormGroup;
	hasFormErrors: boolean = false;
	remarksListState: ListStateModel;
	specsListState: ListStateModel;
	rcivasTypes: RcivaModel;
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
		private rcivasService: RcivasService,
		private empresasService: EmpresasService,
		private contratosService: ContratosService,
		private puestosService: PuestosService,
		private cargosService: CargosService,
		// private remarksService: RcivaRemarksService,
		// private specificationsService: SpecificationsService,
		// private rcivaSpecificationsService: RcivaSpecificationsService,
		private typesUtilsService: TypesUtilsService,
		private rcivaFB: FormBuilder,
		public dialog: MatDialog,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.loadingSubject.next(true);
		this.activatedRoute.queryParams.subscribe(params => {
			const id = +params.id;
			if (id && id > 0) {
				this.rcivasService.getRcivaById(id).subscribe(res => {
					console.log(res);
					this.rciva = res;
					this.oldRciva = Object.assign({}, res);
					this.initRciva();
				});
			} else {
				const newRciva = new RcivaModel();
				newRciva.clear();
				this.rciva = newRciva;
				this.oldRciva = Object.assign({}, newRciva);
				this.initRciva();
			}
		});
		/*for (let i = 2018; i > 1945; i--) {
			this.availableYears.push(i);
		}*/
	}

	initRciva() {
		this.createForm();
		this.loadLists();
		this.loadingSubject.next(false);
		if (!this.rciva.id) {
			this.subheaderService.setBreadcrumbs([
				{ title: 'eCommerce', page: '/ecommerce' },
				{ title: 'Dependientes',  page: '/ecommerce/rcivas' },
				{ title: 'Crear Dependiente', page: '/ecommerce/rcivas/add' }
			]);
			return;
		}
		this.subheaderService.setTitle('Modificar dependiente');
		this.subheaderService.setBreadcrumbs([
			{ title: 'eCommerce', page: '/ecommerce' },
			{ title: 'Rcivas',  page: '/ecommerce/rcivas' },
			{ title: 'Modificar dependiente', page: '/ecommerce/rcivas/edit', queryParams: { id: this.rciva.id } }
		]);
		/*this.rcivasService.getRcivasByIdEmpresa(this.rciva.empresa_id).subscribe(res => {
			// console.log(res.data);
			this.sucursalsTypes = res.data;
		});*/
	}

	createForm() {
		/*this.rciva.fNacimiento = this.typesUtilsService.getDateFromString(this.rciva.fecha_nacimiento);
		this.rciva.fIngreso = this.typesUtilsService.getDateFromString(this.rciva.fecha_ingreso);*/

		this.rcivaForm = this.rcivaFB.group({
			haber_basico: [this.rciva.haber_basico, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			saldo: [this.rciva.saldo, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			sueldo: [this.rciva.sueldo, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			factura: [this.rciva.factura, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			ans: [this.rciva.ans, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			sueldo_neto: [this.rciva.sueldo_neto, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			smn2: [this.rciva.smn2, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			base_imponible: [this.rciva.base_imponible, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			debito_fiscal: [this.rciva.debito_fiscal, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			credito_fiscal: [this.rciva.credito_fiscal, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			smn2_iva: [this.rciva.smn2_iva, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			saldo_anterior: [this.rciva.saldo_anterior, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			saldo_anterior_actualizado: [this.rciva.saldo_anterior_actualizado, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			saldo_anterior_nuevo: [this.rciva.saldo_anterior_nuevo, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			impuesto_periodo: [this.rciva.impuesto_periodo, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
			credito_fiscal_dependiente: [this.rciva.credito_fiscal_dependiente, [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
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

		// this.remarksListState = new ListStateModel(this.rciva.id);
		// this.specsListState = new ListStateModel(this.rciva.id);
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
		let _backUrl = 'ecommerce/rcivas';
		if (id > 0) {
			_backUrl += '?id=' + id;
		}
		this.router.navigateByUrl(_backUrl);
	}

	refreshRciva(id = 0) {
		const _refreshUrl = 'ecommerce/rcivas/edit?id=' + id;
		this.router.navigateByUrl(_refreshUrl);
	}

	reset() {
		this.rciva = Object.assign({}, this.oldRciva);
		this.createForm();
		this.hasFormErrors = false;
		this.rcivaForm.markAsPristine();
        this.rcivaForm.markAsUntouched();
		this.rcivaForm.updateValueAndValidity();

		/*this.rcivasService.getSucursalByIdEmpresa(this.rciva.empresa_id).subscribe(res => {
			console.log(res.data);
			this.sucursalsTypes = res.data;
		});*/
	}

	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.rcivaForm.controls;
		/** check form */
		if (this.rcivaForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		// tslint:disable-next-line:prefer-const
		let editedRciva = this.prepareRciva();

		if (editedRciva.id > 0) {
			this.updateRciva(editedRciva, withBack);
			return;
		}
		this.addRciva(editedRciva, withBack);
	}

	prepareRciva(): RcivaModel {
		const controls = this.rcivaForm.controls;
		const _rciva = new RcivaModel();

		_rciva.id = this.rciva.id;
		_rciva.haber_basico = +controls['haber_basico'].value;
		_rciva.sueldo = +controls['sueldo'].value;
		_rciva.saldo = +controls['saldo'].value;
		_rciva.factura = +controls['factura'].value;
		_rciva.ans = +controls['ans'].value;
		_rciva.sueldo_neto = +controls['sueldo_neto'].value;
		_rciva.smn2 = +controls['smn2'].value;
		_rciva.base_imponible = +controls['base_imponible'].value;
		_rciva.debito_fiscal = +controls['debito_fiscal'].value;
		_rciva.credito_fiscal = +controls['credito_fiscal'].value;
		_rciva.smn2_iva = +controls['smn2_iva'].value;
		_rciva.saldo_anterior = +controls['saldo_anterior'].value;
		_rciva.saldo_anterior_actualizado = +controls['saldo_anterior_actualizado'].value;
		_rciva.saldo_anterior_nuevo = +controls['saldo_anterior_nuevo'].value;
		_rciva.impuesto_periodo = +controls['impuesto_periodo'].value;
		_rciva.credito_fiscal_dependiente = +controls['credito_fiscal_dependiente'].value;

		_rciva._isNew = this.rciva.id > 0 ? false : true;
		_rciva._isUpdated = this.rciva.id > 0;
		return _rciva;
	}

	addRciva(_rciva: RcivaModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.rcivasService.createRciva(_rciva).subscribe(res => {
			this.loadingSubject.next(false);
			if (withBack) {
				this.goBack(res.id);
			} else {
				const message = `Nuevo dependiente agregado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 10000, true, false);
				this.refreshRciva(res.id);
			}
		});
	}

	updateRciva(_rciva: RcivaModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		// Update Rciva
		// tslint:disable-next-line:prefer-const
		let tasks$ = [this.rcivasService.updateRciva(_rciva)];

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
				this.goBack(_rciva.id);
			} else {
				const message = `Dependiente guardado exitosamente..`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
				this.refreshRciva(_rciva.id);
			}
		});
	}

	getComponentTitle() {
		let result = 'Crear Dependiente';
		if (!this.rciva || !this.rciva.id) {
			return result;
		}

		result = `Modificar dependiente - ${this.rciva.id}, ${this.rciva.id}`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	/*onChange(id) {
		this.sucursalsService.getSucursalByIdEmpresa(id).subscribe(res => {
			console.log(res.data);
			this.sucursalsTypes = res.data;
		});
	}*/
}
