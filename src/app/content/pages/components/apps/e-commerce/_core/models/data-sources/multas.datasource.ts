import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { MultasService } from '../../services/index';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { QueryResultsModel } from '../query-models/query-results.model';

export class MultasDataSource extends BaseDataSource {
	constructor(private multasService: MultasService) {
		super();
	}

	loadMultas(queryParams: QueryParamsModel) {
		this.multasService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);

		this.multasService.findMultas(queryParams)
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
