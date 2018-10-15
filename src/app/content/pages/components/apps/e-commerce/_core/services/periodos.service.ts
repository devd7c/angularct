import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap, map, filter, delay, tap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { PeriodoModel } from '../models/periodo.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class PeriodosService {
    httpOptions = this.httpUtils.getHTTPHeaders();
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new periodo to the server
	createPeriodo(periodo): Observable<PeriodoModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<PeriodoModel>(API_URL, periodo, { headers: httpHeaders });
	}

    // READ
    getPeriodosByIdGestion(idGestion: number): Observable<PeriodoModel> {
		return this.http.get<PeriodoModel>(API_URL + `/gestions/${idGestion}/periodos`);
    }

	getAllPeriodos(): Observable<PeriodoModel> {
		return this.http.get<PeriodoModel>(API_URL + `/periodos`);
	}

	getPeriodoById(periodoId: number): Observable<PeriodoModel> {
		return this.http.get<PeriodoModel>(API_URL + `/${periodoId}`);
	}

	// Server should return filtered/sorted result
	findPeriodos(queryParams: QueryParamsModel, lastState: ListStateModel, _idGestion: number): Observable<PeriodoModel[]> {
		// const url = API_PERIODOS_URL + '/find';
		// console.log(queryParams);
		// console.log(lastState);
		// console.log(_idGestion);
		const url = API_URL + '/periodos/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState,
			id: _idGestion
		};
		return this.http.post<PeriodoModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the periodo on the server
	updatePeriodo(periodo: PeriodoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/periodos/${periodo.id}`, periodo, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateStatusForPeriodo(periodos: PeriodoModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			periodosForUpdate: periodos,
			newStatus: status
		};
		const url = API_URL + '/periodos/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the periodo from the server
	deletePeriodo(periodo: PeriodoModel): Observable<PeriodoModel> {
		const url = `${API_URL}/periodos/${periodo.id}`;
		return this.http.delete<PeriodoModel>(url);
	}

	deletePeriodos(ids: number[] = []): Observable<any> {
		const url = API_URL + '/periodos/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
