import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { HoraModel } from '../models/hora.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class HorasService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new hora to the server
	createHora(hora): Observable<HoraModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(hora);
		return this.http.post<HoraModel>(API_URL + '/horas', hora, { headers: httpHeaders });
	}

	// READ
	getAllHoras(): Observable<HoraModel[]> {
		return this.http.get<HoraModel[]>(API_URL + '/horas');
	}

	getHoraById(idHora: number): Observable<HoraModel> {
		return this.http.get<HoraModel>(API_URL + `/horas/${idHora}`);
	}

	// Server should return filtered/sorted result
	findHoras(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
			// console.log(httpParams);
			// const url = API_URL + '/find';
			const url = API_URL + '/horas/find/1';
			return this.http.get<QueryResultsModel>(url, {
				headers: httpHeaders,
				params:  httpParams
			});
	}

	// UPDATE => PUT: update the hora on the server
	updateHora(hora: HoraModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		// console.log(hora);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/horas/${hora.id}`, hora, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateGeneroForHora(horas: HoraModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			horasForUpdate: horas,
			newStatus: status
		};
		const url = API_URL + '/horas/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the hora from the server
	deleteHora(idHora: number): Observable<HoraModel> {
		const url = `${API_URL}/horas/${idHora}`;
		return this.http.delete<HoraModel>(url);
	}

	deleteHoras(ids: number[] = []): Observable<any> {
		const url = API_URL + '/horas/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { idHorasForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}


