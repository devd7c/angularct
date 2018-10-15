import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of  } from 'rxjs';
import { mergeMap, map, filter, delay, tap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { PatronalModel } from '../models/patronal.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class PatronalsService {
    httpOptions = this.httpUtils.getHTTPHeaders();
    lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
        private httpUtils: HttpUtilsService) { }

	getPatronalsByIdEmpresa(empresaId: number): Observable<PatronalModel> {
		return this.http.get<PatronalModel>(API_URL + `/empresas/${empresaId}/patronals`);
	}

	getActivePatronalByIdEmpresa(empresaId: number): Observable<PatronalModel> {
		return this.http.get<PatronalModel>(API_URL + `/patronals/${empresaId}/getactive`);
	}

    getAllPatronals(): Observable<PatronalModel> {
		return this.http.get<PatronalModel>(API_URL + `/patronals`);
	}

	getPatronalById(patronalId: number): Observable<PatronalModel> {
		return this.http.get<PatronalModel>(API_URL + `/patronals/${patronalId}`);
	}

	// CREATE =>  POST: add a new product patronal to the server
	createPatronal(patronal): Observable<PatronalModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(patronal);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<PatronalModel>(API_URL + '/patronals', patronal, { headers: httpHeaders });
	}

	// Server should return sorted/filtered patronals and merge with items from state
	findPatronals(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<PatronalModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/patronals/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<PatronalModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product patronal
	updatePatronal(patronal: PatronalModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(patronal);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/patronals/${patronal.id}`, patronal, { headers: httpHeaders });
	}

	// DELETE => delete the product patronal
	deletePatronal(patronal: PatronalModel): Observable<PatronalModel> {
		// console.log(patronal.id);
		const url = `${API_URL}/patronals/${patronal.id}`;
		return this.http.delete<PatronalModel>(url);
	}
}


