import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { TdomingoModel } from '../models/tdomingo.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class TdomingosService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new product tdomingo to the server
	createTdomingo(tdomingo): Observable<TdomingoModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tdomingo);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<TdomingoModel>(API_URL + '/tdomingos', tdomingo, { headers: httpHeaders });
	}

	// READ
	// Server should return filtered tdomingos by productId
	getAllTdomingosByProductId(productId: number): Observable<TdomingoModel[]> {
		const url = API_URL + '/tdomingos?idEmpresa=' + productId;
		return this.http.get<TdomingoModel[]>(url);
	}

	getTdomingoById(tdomingoId: number): Observable<TdomingoModel> {
		return this.http.get<TdomingoModel>(API_URL + `/tdomingos/${tdomingoId}`);
	}

	// Server should return sorted/filtered tdomingos and merge with items from state
	findTdomingos(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<TdomingoModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/tdomingos/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<TdomingoModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product tdomingo
	updateTdomingo(tdomingo: TdomingoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tdomingo);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/tdomingos/${tdomingo.id}`, tdomingo, { headers: httpHeaders });
	}

	// DELETE => delete the product tdomingo
	deleteTdomingo(tdomingo: TdomingoModel): Observable<TdomingoModel> {
		// console.log(tdomingo.id);
		const url = `${API_URL}/tdomingos/${tdomingo.id}`;
		return this.http.delete<TdomingoModel>(url);
	}
}
