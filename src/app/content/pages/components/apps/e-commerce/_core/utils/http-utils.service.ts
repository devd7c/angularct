import { Injectable } from '@angular/core';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import { QueryResultsModel } from '../models/query-models/query-results.model';
import { QueryParamsModel } from '../models/query-models/query-params.model';
import { stringify } from 'querystring';
import { UrlTree } from '@angular/router';
import { forEach } from 'lodash';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Injectable()
export class HttpUtilsService {

	getFindHTTPParams(queryParams): HttpParams {
		let params = new HttpParams()
			// .set('query', queryParams.filter)
			.set('sort_order', queryParams.sortOrder)
			.set('sort_by', queryParams.sortField)
			.set('page', queryParams.pageNumber.toString())
			.set('pageSize', queryParams.pageSize.toString());

		forEach(queryParams.filter, function (value, key) {
			params = params.set(key, value);
		});
		return params;
	}

	getHTTPHeaders(): HttpHeaders {
		const result = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Access-Control-Allow-Origin', '*')
			.set('Access-Control-Allow-Credentials', 'true');
		return result;
	}

	baseFilter(_entities: any[], _queryParams: QueryParamsModel, _filtrationFields: string[] = []): QueryResultsModel {
		// Filtration
		let entitiesResult = this.searchInArray(_entities, _queryParams.filter, _filtrationFields);

		// Sorting
		// start
		if (_queryParams.sortField) {
			entitiesResult = this.sortArray(entitiesResult, _queryParams.sortField, _queryParams.sortOrder);
		}
		// end

		// Paginator
		// start
		const totalCount = entitiesResult.length;
		const initialPos = _queryParams.pageNumber * _queryParams.pageSize;
		entitiesResult = entitiesResult.slice(initialPos, initialPos + _queryParams.pageSize);
		// end

		const queryResults = new QueryResultsModel();
		queryResults.items = entitiesResult;
		queryResults.totalCount = totalCount;
		return queryResults;
	}

	sortArray(_incomingArray: any[], _sortField: string = '', _sortOrder: string = 'asc'): any[] {
		if (!_sortField) {
			return _incomingArray;
		}

		let result: any[] = [];
		result = _incomingArray.sort((a, b) => {
			if (a[_sortField] < b[_sortField]) {
				return _sortOrder === 'asc' ? -1 : 1;
			}

			if (a[_sortField] > b[_sortField]) {
				return _sortOrder === 'asc' ? 1 : -1;
			}

			return 0;
		});
		return result;
	}

	searchInArray(_incomingArray: any[], _queryObj: any, _filtrationFields: string[] = []): any[] {
		const result: any[] = [];
		let resultBuffer: any[] = [];
		const indexes: number[] = [];
		let firstIndexes: number[] = [];
		let doSearch: boolean = false;

		_filtrationFields.forEach(item => {
			if (item in _queryObj) {
				_incomingArray.forEach((element, index) => {
					if (element[item] === _queryObj[item]) {
						firstIndexes.push(index);
					}
				});
				firstIndexes.forEach(element => {
					resultBuffer.push(_incomingArray[element]);
				});
				_incomingArray = resultBuffer.slice(0);
				resultBuffer = [].slice(0);
				firstIndexes = [].slice(0);
			}
		});

		Object.keys(_queryObj).forEach(key => {
			const searchText = _queryObj[key].toString().trim().toLowerCase();
			if (key && !_.includes(_filtrationFields, key) && searchText) {
				doSearch = true;
				try {
					_incomingArray.forEach((element, index) => {
						const _val = element[key].toString().trim().toLowerCase();
						if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
							indexes.push(index);
						}
					});
				} catch (ex) {
					console.log(ex, key, searchText);
				}
			}
		});

		if (!doSearch) {
			return _incomingArray;
		}

		indexes.forEach(re => {
			result.push(_incomingArray[re]);
		});

		return result;
	}
	/*sortData(_queryParams: any) {
		const query: {} = _queryParams.filter;
        forEach(query, function (value, key) {
            console.log(key);
		});
	}*/
}
