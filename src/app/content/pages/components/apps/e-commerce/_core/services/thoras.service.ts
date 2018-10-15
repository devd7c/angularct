import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { ThoraModel } from '../models/thora.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class ThorasService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new product thora to the server
	createThora(thora): Observable<ThoraModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(thora);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ThoraModel>(API_URL + '/thoras', thora, { headers: httpHeaders });
	}

	// READ
	// Server should return filtered thoras by productId
	getAllThorasByProductId(productId: number): Observable<ThoraModel[]> {
		const url = API_URL + '/thoras?idEmpresa=' + productId;
		return this.http.get<ThoraModel[]>(url);
	}

	getThoraById(thoraId: number): Observable<ThoraModel> {
		return this.http.get<ThoraModel>(API_URL + `/thoras/${thoraId}`);
	}

	// Server should return sorted/filtered thoras and merge with items from state
	findThoras(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<ThoraModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/thoras/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<ThoraModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product thora
	updateThora(thora: ThoraModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(thora);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/thoras/${thora.id}`, thora, { headers: httpHeaders });
	}

	// DELETE => delete the product thora
	deleteThora(thora: ThoraModel): Observable<ThoraModel> {
		// console.log(thora.id);
		const url = `${API_URL}/thoras/${thora.id}`;
		return this.http.delete<ThoraModel>(url);
	}
}
