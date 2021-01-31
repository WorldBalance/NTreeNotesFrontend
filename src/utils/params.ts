
import { stringToBoolean } from './utils1';


export interface QueryParamsPacked {
  search?: string;
  tags?: string;
  exclude?: string;
  useTagsL?: string;
}

export interface QueryParamsUnpacked {
  search?: string;
  tags?: string[];
  exclude?: string[];
  useTagsL?: boolean;
}

export const keySearch = 'search';
export const keyTags = 'tags';


export function queryParamsPack(params: QueryParamsUnpacked): QueryParamsPacked {
  const res: QueryParamsPacked = {};
  if (params.search) {
    res.search = params.search;
  }
  if (params.tags?.length) {
    res.tags = params.tags.join('-');
  }
  if (params.exclude.length) {
    res.exclude = params.exclude.join('-');
  }
  if (params.useTagsL) {
    res.useTagsL = 'true';
  }
  return res;
}


export function queryParamsUnpack(params: QueryParamsPacked): QueryParamsUnpacked {
  const res: QueryParamsUnpacked = {};
  if (params.search) {
    res.search = params.search;
  }
  if (params.tags?.length) {
    res.tags = params.tags.split('-');
  }
  if (params.exclude?.length) {
    res.exclude = params.exclude.split('-');
  }
  if (params.useTagsL && stringToBoolean(params.useTagsL)) {
    res.useTagsL = true;
  }
  return res;
}

