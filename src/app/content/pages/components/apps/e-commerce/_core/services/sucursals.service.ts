import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of  } from 'rxjs';
import { mergeMap, map, filter, delay, tap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { SucursalModel } from '../models/sucursal.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class SucursalsService {
    httpOptions = this.httpUtils.getHTTPHeaders();
    lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
        private httpUtils: HttpUtilsService) { }

	getSucursalByIdEmpresa(idEmpresa: number): Observable<SucursalModel> {
		return this.http.get<SucursalModel>(API_URL + `/empresas/${idEmpresa}/sucursals`);
    }

    getAllSucursals(): Observable<SucursalModel> {
		return this.http.get<SucursalModel>(API_URL + `/sucursals/`);
	}

	getSucursalById(sucursalId: number): Observable<SucursalModel> {
		return this.http.get<SucursalModel>(API_URL + `/sucursals/${sucursalId}`);
	}

	// CREATE =>  POST: add a new product sucursal to the server
	createSucursal(sucursal): Observable<SucursalModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(sucursal);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<SucursalModel>(API_URL + '/sucursals', sucursal, { headers: httpHeaders });
	}

	// Server should return sorted/filtered sucursals and merge with items from state
	findSucursals(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<SucursalModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/sucursals/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<SucursalModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product sucursal
	updateSucursal(sucursal: SucursalModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(sucursal);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/sucursals/${sucursal.id}`, sucursal, { headers: httpHeaders });
	}

	// DELETE => delete the product sucursal
	deleteSucursal(sucursal: SucursalModel): Observable<SucursalModel> {
		// console.log(sucursal.id);
		const url = `${API_URL}/sucursals/${sucursal.id}`;
		return this.http.delete<SucursalModel>(url);
	}
}


