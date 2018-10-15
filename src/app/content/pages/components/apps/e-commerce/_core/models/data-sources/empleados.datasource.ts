import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { EmpleadosService } from '../../services/index';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { QueryResultsModel } from '../query-models/query-results.model';

export class EmpleadosDataSource extends BaseDataSource {
	constructor(private empleadosService: EmpleadosService) {
		super();
	}

	loadEmpleados(queryParams: QueryParamsModel) {
		this.empleadosService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

		this.empleadosService.findEmpleados(queryParams)
			.pipe(
				tap(res => {
					// console.log(res);
					this.entitySubject.next(res.data);
					this.paginatorTotalSubject.next(res.total);
				// queryParams.pageSize = res.meta.pagination.per_page;
				// queryParams.pageNumber = res.meta.pagination.current_page;
				// console.log(queryParams.pageNumber);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe();
	}
}
