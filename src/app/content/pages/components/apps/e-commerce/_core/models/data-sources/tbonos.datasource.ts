import { from } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as _ from 'lodash';
import { TbonosService } from '../../services';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { ListStateModel } from '../../utils/list-state.model';
import { environment } from '../../../../../../../../../environments/environment';
export class TbonosDataSource extends BaseDataSource {
	constructor(private tbonosService: TbonosService) {
		super();
	}

	loadTbonos(queryParams: QueryParamsModel, lastState: ListStateModel) {
		this.loadingSubject.next(true);

		this.tbonosService.findTbonos(queryParams, lastState)
			.pipe(
				catchError(() => from([])),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				// console.log(res.data);
				this.entitySubject.next(res.data);
				this.paginatorTotalSubject.next(res.total);
			});
	}
}
