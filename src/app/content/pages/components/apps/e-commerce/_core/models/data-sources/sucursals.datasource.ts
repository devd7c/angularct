import { from } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as _ from 'lodash';
import { SucursalsService } from '../../services';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { ListStateModel } from '../../utils/list-state.model';
import { environment } from '../../../../../../../../../environments/environment';
export class SucursalsDataSource extends BaseDataSource {
	constructor(private sucursalsService: SucursalsService) {
		super();
	}

	loadSucursals(queryParams: QueryParamsModel, lastState: ListStateModel) {
		this.loadingSubject.next(true);

		this.sucursalsService.findSucursals(queryParams, lastState)
			.pipe(
				catchError(() => from([])),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				// console.log(res);
				this.entitySubject.next(res.data);
				this.paginatorTotalSubject.next(res.total);
			});
	}
}
