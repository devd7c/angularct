import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap, map, filter, delay, tap } from 'rxjs/operators';
import { HttpUtilsService } from '../utils/http-utils.service';
import { EmpresaModel } from '../models/empresa.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { Global } from '../services/global';

const API_URL = Global.url;
// Real REST API
@Injectable()
export class EmpresasService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'id', 0, 10));

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new empresa to the server
	createEmpresa(empresa): Observable<EmpresaModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<EmpresaModel>(API_URL + '/empresas', empresa, { headers: httpHeaders });
	}

	// READ
	getAllEmpresas(): Observable<EmpresaModel> {
		return this.http.get<EmpresaModel>(API_URL + '/empresas');
	}

	getEmpresaById(empresaId: number): Observable<EmpresaModel> {
		return this.http.get<EmpresaModel>(API_URL + `/empresas/${empresaId}`);
	}

	// Server should return filtered/sorted result
	findEmpresas(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
			// Note: Add headers if needed (tokens/bearer)
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

			// const url = API_EMPRESAS_URL + '/find';
			// console.log(queryParams);
			const url = API_URL + '/empresas/find/1';
			return this.http.get<QueryResultsModel>(url, {
				headers: httpHeaders,
				params:  httpParams
			});
	}

	// UPDATE => PUT: update the proempresauct on the server
	updateEmpresa(empresa: EmpresaModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/empresas/${empresa.id}`, empresa, { headers: httpHeaders });
	}

	// UPDATE Status
	// Comment this when you start work with real server
	// This code imitates server calls
	updateStatusForEmpresa(empresas: EmpresaModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			empresasForUpdate: empresas,
			newStatus: status
		};
		const url = API_URL + '/empresas/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the empresa from the server
	deleteEmpresa(empresaId: number): Observable<EmpresaModel> {
		const url = `${API_URL}/empresas/${empresaId}`;
		return this.http.delete<EmpresaModel>(url);
	}

	deleteEmpresas(ids: number[] = []): Observable<any> {
		const url = API_URL + '/empresas/delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { prdocutIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
