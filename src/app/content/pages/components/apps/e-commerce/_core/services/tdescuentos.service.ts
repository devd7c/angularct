import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { TdescuentoModel } from '../models/tdescuento.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class TdescuentosService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new product tdescuento to the server
	createTdescuento(tdescuento): Observable<TdescuentoModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tdescuento);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<TdescuentoModel>(API_URL + '/tdescuentos', tdescuento, { headers: httpHeaders });
	}

	// READ
	// Server should return filtered tdescuentos by productId
	getAllTdescuentosByProductId(productId: number): Observable<TdescuentoModel[]> {
		const url = API_URL + '/tdescuentos?idEmpresa=' + productId;
		return this.http.get<TdescuentoModel[]>(url);
	}

	getTdescuentoById(tdescuentoId: number): Observable<TdescuentoModel> {
		return this.http.get<TdescuentoModel>(API_URL + `/tdescuentos/${tdescuentoId}`);
	}

	// Server should return sorted/filtered tdescuentos and merge with items from state
	findTdescuentos(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<TdescuentoModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/tdescuentos/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<TdescuentoModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product tdescuento
	updateTdescuento(tdescuento: TdescuentoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(tdescuento);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/tdescuentos/${tdescuento.id}`, tdescuento, { headers: httpHeaders });
	}

	// DELETE => delete the product tdescuento
	deleteTdescuento(tdescuento: TdescuentoModel): Observable<TdescuentoModel> {
		// console.log(tdescuento.id);
		const url = `${API_URL}/tdescuentos/${tdescuento.id}`;
		return this.http.delete<TdescuentoModel>(url);
	}
}
