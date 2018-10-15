import { from } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as _ from 'lodash';
import { GestionsService } from '../../services';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { ListStateModel } from '../../utils/list-state.model';
import { environment } from '../../../../../../../../../environments/environment';
export class GestionsDataSource extends BaseDataSource {
	constructor(private gestionsService: GestionsService) {
		super();
	}

	loadGestions(queryParams: QueryParamsModel, lastState: ListStateModel) {
		this.loadingSubject.next(true);

		this.gestionsService.findGestions(queryParams, lastState)
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
