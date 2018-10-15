import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of  } from 'rxjs';
import { mergeMap, map, filter, delay, tap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { GestionModel } from '../models/gestion.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { ListStateModel } from '../utils/list-state.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class GestionsService {
    httpOptions = this.httpUtils.getHTTPHeaders();
    lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
        private httpUtils: HttpUtilsService) { }

	getGestionsByIdEmpresa(idEmpresa: number): Observable<GestionModel> {
		return this.http.get<GestionModel>(API_URL + `/empresas/${idEmpresa}/gestions`);
	}

    getAllGestions(): Observable<GestionModel> {
		return this.http.get<GestionModel>(API_URL + `/gestions`);
	}

	getGestionById(gestionId: number): Observable<GestionModel> {
		return this.http.get<GestionModel>(API_URL + `/gestions/${gestionId}`);
	}

	// CREATE =>  POST: add a new product gestion to the server
	createGestion(gestion): Observable<GestionModel> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(gestion);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<GestionModel>(API_URL + '/gestions', gestion, { headers: httpHeaders });
	}

	// Server should return sorted/filtered gestions and merge with items from state
	findGestions(queryParams: QueryParamsModel, lastState: ListStateModel): Observable<GestionModel[]> {
		// console.log(queryParams);
		// console.log(lastState);
		const url = API_URL + '/gestions/find/1';
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const body = {
			state: lastState
		};
		return this.http.post<GestionModel[]>(url, body, { headers: httpHeaders, params: httpParams });
	}

	// UPDATE => PUT: update the product gestion
	updateGestion(gestion: GestionModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		console.log(gestion);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/gestions/${gestion.id}`, gestion, { headers: httpHeaders });
	}

	// DELETE => delete the product gestion
	deleteGestion(gestion: GestionModel): Observable<GestionModel> {
		// console.log(gestion.id);
		const url = `${API_URL}/gestions/${gestion.id}`;
		return this.http.delete<GestionModel>(url);
	}
}


