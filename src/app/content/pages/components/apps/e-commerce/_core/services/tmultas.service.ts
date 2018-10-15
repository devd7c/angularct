import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { TmultaModel } from '../models/tmulta.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class TmultasService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new product tmulta to the server
	createTmulta(tmulta): Observable<TmultaModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tmulta);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<TmultaModel>(API_URL + '/tmultas', tmulta, { headers: httpHeaders });
	}

	// READ
	// Server should return filtered tmultas by productId
	getAllTmultasByProductId(productId: number): Observable<TmultaModel[]> {
		const url = API_URL + '/tmultas?idEmpresa=' + productId;
		return this.http.get<TmultaModel[]>(url);
	}

	getTmultaById(tmultaId: number): Observable<TmultaModel> {
		return this.http.get<TmultaModel>(API_URL + `/tmultas/${tmultaId}`);
	}

	// Server should return sorted/filtered tmultas and merge with items from state
	findTmultas(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<TmultaModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/tmultas/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<TmultaModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product tmulta
	updateTmulta(tmulta: TmultaModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tmulta);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/tmultas/${tmulta.id}`, tmulta, { headers: httpHeaders });
	}

	// DELETE => delete the product tmulta
	deleteTmulta(tmulta: TmultaModel): Observable<TmultaModel> {
		// console.log(tmulta.id);
		const url = `${API_URL}/tmultas/${tmulta.id}`;
		return this.http.delete<TmultaModel>(url);
	}
}
