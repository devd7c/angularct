import { NgModule } from '@angular/core';
import { CommonModule,  } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../../partials/partials.module';
import { ECommerceComponent } from './e-commerce.component';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// Core
import { FakeApiService } from './_core/_server/fake-api.service';
// Core => Services
import { CustomersService } from './_core/services/index';
import { ProductRemarksService } from './_core/services/index';
import { ProductSpecificationsService } from './_core/services/index';
import { ProductsService } from './_core/services/index';
import { SpecificationsService } from './_core/services/specification.service';
// EMPRESAS => Services
import { EmpresasService } from './_core/services/index';
import { SucursalsService } from './_core/services/sucursals.service';
import { GestionsService } from './_core/services/index';
import { PeriodosService } from './_core/services/index';
import { LaboralsService } from './_core/services/index';
import { PatronalsService } from './_core/services/index';
// DEPENDIENTES => Services
import { EmpleadosService } from './_core/services/index';
import { ContratosService } from './_core/services/index';
import { PuestosService } from './_core/services/index';
import { CargosService } from './_core/services/index';
// MULTAS, BONOS & DESCUENTOS => Services
import { MultasService } from './_core/services/index';
import { TmultasService } from './_core/services/index';
import { DescuentosService } from './_core/services/index';
import { TdescuentosService } from './_core/services/index';
import { HorasService } from './_core/services/index';
import { ThorasService } from './_core/services/index';
import { DomingosService } from './_core/services/index';
import { TdomingosService } from './_core/services/index';
import { BonosService } from './_core/services/index';
import { TbonosService } from './_core/services/index';
// FORM 110
import { RcivasService } from './_core/services/index';
// Core => Utils
import { HttpUtilsService } from './_core/utils/http-utils.service';
import { TypesUtilsService } from './_core/utils/types-utils.service';
import { LayoutUtilsService } from './_core/utils/layout-utils.service';
import { InterceptService } from './_core/utils/intercept.service';
// Shared
import { ActionNotificationComponent } from './_shared/action-natification/action-notification.component';
import { DeleteEntityDialogComponent } from './_shared/delete-entity-dialog/delete-entity-dialog.component';
import { FetchEntityDialogComponent } from './_shared/fetch-entity-dialog/fetch-entity-dialog.component';
import { UpdateStatusDialogComponent } from './_shared/update-status-dialog/update-status-dialog.component';
import { AlertComponent } from './_shared/alert/alert.component';
// Customers
import { CustomersListComponent } from './customers/customers-list/customers-list.component';
import { CustomerEditDialogComponent } from './customers/customer-edit/customer-edit.dialog.component';
// Products
import { ProductsListComponent } from './products/products-list/products-list.component';
import { ProductEditComponent } from './products/product-edit/product-edit.component';
import { RemarksListComponent } from './products/_subs/remarks/remarks-list/remarks-list.component';
import { SpecificationsListComponent } from './products/_subs/specifications/specifications-list/specifications-list.component';
import { SpecificationEditDialogComponent } from './products/_subs/specifications/specification-edit/specification-edit-dialog.component';
// EMPRESAS
import { EmpresasListComponent } from './empresas/empresas-list/empresas-list.component';
import { EmpresaEditComponent } from './empresas/empresa-edit/empresa-edit.component';
import { SucursalsListComponent } from './empresas/_subs/sucursals/sucursals-list/sucursals-list.component';
import { SucursalEditDialogComponent } from './empresas/_subs/sucursals/sucursal-edit/sucursal-edit-dialog.component';
import { GestionsListComponent } from './empresas/_subs/gestions/gestions-list/gestions-list.component';
import { GestionEditDialogComponent } from './empresas/_subs/gestions/gestion-edit/gestion-edit-dialog.component';
import { PeriodoEditDialogComponent } from './empresas/_subs/periodos/periodo-edit/periodo-edit-dialog.component';
import { LaboralsListComponent } from './empresas/_subs/laborals/laborals-list/laborals-list.component';
import { LaboralEditDialogComponent } from './empresas/_subs/laborals/laboral-edit/laboral-edit-dialog.component';
import { LaboralShowDialogComponent } from './empresas/_subs/laborals/laboral-show/laboral-show-dialog.component';
import { PatronalsListComponent } from './empresas/_subs/patronals/patronals-list/patronals-list.component';
import { PatronalEditDialogComponent } from './empresas/_subs/patronals/patronal-edit/patronal-edit-dialog.component';
import { PatronalShowDialogComponent } from './empresas/_subs/patronals/patronal-show/patronal-show-dialog.component';
// DEPENDIENTES
import { EmpleadosListComponent } from './empleados/empleados-list/empleados-list.component';
import { EmpleadoEditComponent } from './empleados/empleado-edit/empleado-edit.component';
// Multas
import { MultasListComponent } from './multas/multas-list/multas-list.component';
import { MultaEditComponent } from './multas/multa-edit/multa-edit.component';
import { TmultasListComponent } from './multas/_subs/tmultas/tmultas-list/tmultas-list.component';
// Descuentos
import { DescuentosListComponent } from './descuentos/descuentos-list/descuentos-list.component';
import { DescuentoEditComponent } from './descuentos/descuento-edit/descuento-edit.component';
import { TdescuentosListComponent } from './descuentos/_subs/tdescuentos/tdescuentos-list/tdescuentos-list.component';
// Horas
import { HorasListComponent } from './horas/horas-list/horas-list.component';
import { HoraEditComponent } from './horas/hora-edit/hora-edit.component';
import { ThorasListComponent } from './horas/_subs/thoras/thoras-list/thoras-list.component';
// Domingos
import { DomingosListComponent } from './domingos/domingos-list/domingos-list.component';
import { DomingoEditComponent } from './domingos/domingo-edit/domingo-edit.component';
import { TdomingosListComponent } from './domingos/_subs/tdomingos/tdomingos-list/tdomingos-list.component';
// Bonos
import { BonosListComponent } from './bonos/bonos-list/bonos-list.component';
import { BonoEditComponent } from './bonos/bono-edit/bono-edit.component';
import { TbonosListComponent } from './bonos/_subs/tbonos/tbonos-list/tbonos-list.component';
// FORM 110
import { RcivasListComponent } from './rcivas/rcivas-list/rcivas-list.component';
import { RcivaEditComponent } from './rcivas/rciva-edit/rciva-edit.component';

// Material
import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatAutocompleteModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatSnackBarModule,
	MatTooltipModule,
	MatSlideToggleModule,
} from '@angular/material';
import { environment } from '../../../../../../environments/environment';

const routes: Routes = [
	{
		path: '',
		component: ECommerceComponent,
		children: [
			{
				path: '',
				redirectTo: 'customers',
				pathMatch: 'full'
			},
			{
				path: 'customers',
				component: CustomersListComponent
			},
			{
				path: 'empresas',
				component: EmpresasListComponent
			},
			{
				path: 'empresas/add',
				component: EmpresaEditComponent
			},
			{
				path: 'empresas/edit',
				component: EmpresaEditComponent
			},
			{
				path: 'empresas/edit/:id',
				component: EmpresaEditComponent
			},
			{
				path: 'empleados',
				component: EmpleadosListComponent
			},
			{
				path: 'empleados/add',
				component: EmpleadoEditComponent
			},
			{
				path: 'empleados/edit',
				component: EmpleadoEditComponent
			},
			{
				path: 'empleados/edit/:id',
				component: EmpleadoEditComponent
			},
			{
				path: 'multas',
				component: MultasListComponent
			},
			{
				path: 'multas/add',
				component: MultaEditComponent
			},
			{
				path: 'multas/edit',
				component: MultaEditComponent
			},
			{
				path: 'multas/edit/:id',
				component: MultaEditComponent
			},
			{
				path: 'descuentos',
				component: DescuentosListComponent
			},
			{
				path: 'descuentos/add',
				component: DescuentoEditComponent
			},
			{
				path: 'descuentos/edit',
				component: DescuentoEditComponent
			},
			{
				path: 'descuentos/edit/:id',
				component: DescuentoEditComponent
			},
			{
				path: 'horas',
				component: HorasListComponent
			},
			{
				path: 'horas/add',
				component: HoraEditComponent
			},
			{
				path: 'horas/edit',
				component: HoraEditComponent
			},
			{
				path: 'horas/edit/:id',
				component: HoraEditComponent
			},
			{
				path: 'domingos',
				component: DomingosListComponent
			},
			{
				path: 'domingos/add',
				component: DomingoEditComponent
			},
			{
				path: 'domingos/edit',
				component: DomingoEditComponent
			},
			{
				path: 'domingos/edit/:id',
				component: DomingoEditComponent
			},
			{
				path: 'bonos',
				component: BonosListComponent
			},
			{
				path: 'bonos/add',
				component: BonoEditComponent
			},
			{
				path: 'bonos/edit',
				component: BonoEditComponent
			},
			{
				path: 'bonos/edit/:id',
				component: BonoEditComponent
			},
			{
				path: 'rcivas',
				component: RcivasListComponent
			},
			{
				path: 'rcivas/add',
				component: RcivaEditComponent
			},
			{
				path: 'rcivas/edit',
				component: RcivaEditComponent
			},
			{
				path: 'rcivas/edit/:id',
				component: RcivaEditComponent
			},
			{
				path: 'products',
				component: ProductsListComponent,
			},
			{
				path: 'products/add',
				component: ProductEditComponent
			},
			{
				path: 'products/edit',
				component: ProductEditComponent
			},
			{
				path: 'products/edit/:id',
				component: ProductEditComponent
			},
		]
	}
];

@NgModule({
	imports: [
		MatDialogModule,
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
        MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		MatSlideToggleModule,
		environment.isMockEnabled ? HttpClientInMemoryWebApiModule.forFeature(FakeApiService) : []
	],
	providers: [
		InterceptService,
      	{
        	provide: HTTP_INTERCEPTORS,
       	 	useClass: InterceptService,
        	multi: true
      	},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'm-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		},
		HttpUtilsService,
		CustomersService,
		ProductRemarksService,
		ProductSpecificationsService,
		ProductsService,
		SpecificationsService,
		EmpresasService,
		SucursalsService,
		GestionsService,
		PeriodosService,
		LaboralsService,
		PatronalsService,
		EmpleadosService,
		ContratosService,
		PuestosService,
		CargosService,
		MultasService,
		TmultasService,
		DescuentosService,
		TdescuentosService,
		HorasService,
		ThorasService,
		DomingosService,
		TdomingosService,
		BonosService,
		TbonosService,
		RcivasService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		CustomerEditDialogComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		SpecificationEditDialogComponent,
		SucursalEditDialogComponent,
		GestionEditDialogComponent,
		PeriodoEditDialogComponent,
		LaboralEditDialogComponent,
		LaboralShowDialogComponent,
		PatronalEditDialogComponent,
		PatronalShowDialogComponent
	],
	declarations: [
		ECommerceComponent,
		// Shared
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		AlertComponent,
		// Empresas
		EmpresasListComponent,
		EmpresaEditComponent,
		SucursalsListComponent,
		SucursalEditDialogComponent,
		GestionsListComponent,
		GestionEditDialogComponent,
		PeriodoEditDialogComponent,
		LaboralsListComponent,
		LaboralEditDialogComponent,
		LaboralShowDialogComponent,
		PatronalsListComponent,
		PatronalEditDialogComponent,
		PatronalShowDialogComponent,
		// Customers
		CustomersListComponent,
		CustomerEditDialogComponent,
		// Empleados
		EmpleadosListComponent,
		EmpleadoEditComponent,
		// Multas
		MultasListComponent,
		MultaEditComponent,
		TmultasListComponent,
		// Descuentos
		DescuentosListComponent,
		DescuentoEditComponent,
		TdescuentosListComponent,
		// Horas
		HorasListComponent,
		HoraEditComponent,
		ThorasListComponent,
		// Domingos
		DomingosListComponent,
		DomingoEditComponent,
		TdomingosListComponent,
		// Bonos
		BonosListComponent,
		BonoEditComponent,
		TbonosListComponent,
		// Form 110
		RcivasListComponent,
		RcivaEditComponent,
		// Products
		ProductsListComponent,
		ProductEditComponent,
		RemarksListComponent,
		SpecificationsListComponent,
		SpecificationEditDialogComponent
	]
})
export class ECommerceModule { }
