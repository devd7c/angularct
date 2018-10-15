import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { DescuentoModel } from '../models/descuento.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class DescuentosService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new descuento to the server
	createDescuento(descuento): Observable<DescuentoModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// console.log(descuento);
		return this.http.post<DescuentoModel>(API_URL + '/descuentos', descuento, { headers: httpHeaders });
	}

	// READ
	getAllDescuentos(): Observable<DescuentoModel[]> {
		return this.http.get<DescuentoModel[]>(API_URL + '/descuentos');
	}

	getDescuentoById(idDescuento: number): Observable<DescuentoModel> {
		return this.http.get<DescuentoModel>(API_URL + `/descuentos/${idDescuento}`);
	}

	// Server should return filtered/sorted result
	findDescuentos(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
			// console.log(httpParams);
			// const url = API_URL + '/find';
			const url = API_URL + '/descuentos/find/1';
			return this.http.get<QueryResultsModel>(url, {
				headers: httpHeaders,
				params:  httpParams
			});
	}

	// UPDATE => PUT: update the descuento on the server
	updateDescuento(descuento: DescuentoModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		// console.log(descuento);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/descuentos/${descuento.id}`, descuento, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateGeneroForDescuento(descuentos: DescuentoModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			descuentosForUpdate: descuentos,
			newStatus: status
		};
		const url = API_URL + '/descuentos/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the descuento from the server
	deleteDescuento(idDescuento: number): Observable<DescuentoModel> {
		const url = `${API_URL}/descuentos/${idDescuento}`;
		return this.http.delete<DescuentoModel>(url);
	}

	deleteDescuentos(ids: number[] = []): Observable<any> {
		const url = API_URL + '/descuentos/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { idDescuentosForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}


