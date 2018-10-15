import { from } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as _ from 'lodash';
import { PeriodosService } from '../../services';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { ListStateModel } from '../../utils/list-state.model';
import { environment } from '../../../../../../../../../environments/environment';
export class PeriodosDataSource extends BaseDataSource {
	constructor(private periodosService: PeriodosService) {
		super();
	}

	loadPeriodos(queryParams: QueryParamsModel, lastState: ListStateModel, _idGestion: number) {
		this.loadingSubject.next(true);

		this.periodosService.findPeriodos(queryParams, lastState, _idGestion)
			.pipe(
				catchError(() => from([])),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				console.log(res);
				this.entitySubject.next(res.data);
				this.paginatorTotalSubject.next(res.total);
			});
	}
}
