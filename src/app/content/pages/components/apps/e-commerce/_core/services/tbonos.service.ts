import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { TbonoModel } from '../models/tbono.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class TbonosService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new product tbono to the server
	createTbono(tbono): Observable<TbonoModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tbono);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<TbonoModel>(API_URL + '/tbonos', tbono, { headers: httpHeaders });
	}

	// READ
	// Server should return filtered tbonos by productId
	getAllTbonosByProductId(productId: number): Observable<TbonoModel[]> {
		const url = API_URL + '/tbonos?idEmpresa=' + productId;
		return this.http.get<TbonoModel[]>(url);
	}

	getTbonoById(tbonoId: number): Observable<TbonoModel> {
		return this.http.get<TbonoModel>(API_URL + `/tbonos/${tbonoId}`);
	}

	// Server should return sorted/filtered tbonos and merge with items from state
	findTbonos(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<TbonoModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/tbonos/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<TbonoModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product tbono
	updateTbono(tbono: TbonoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tbono);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/tbonos/${tbono.id}`, tbono, { headers: httpHeaders });
	}

	// DELETE => delete the product tbono
	deleteTbono(tbono: TbonoModel): Observable<TbonoModel> {
		// console.log(tbono.id);
		const url = `${API_URL}/tbonos/${tbono.id}`;
		return this.http.delete<TbonoModel>(url);
	}
}
