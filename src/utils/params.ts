
export interface QueryParamsPacked {
    search?: string;
    tags?: string;
}

export interface QueryParamsUnpacked {
    search?: string;
    tags?: string[];
}

export const keySearch = "search";
export const keyTags = "tags";


export function queryParamsPack(params: QueryParamsUnpacked): QueryParamsPacked {
    const res: QueryParamsPacked = {};
    if (params.search) {
        res.search = params.search;
    }
    if (params.tags?.length > 0) {
        res.tags = params.tags.join("-");
    }
    return res;
}


export function queryParamsUnpack(params: QueryParamsPacked): QueryParamsUnpacked {
    const res: QueryParamsUnpacked = {};
    if (params.search) {
        res.search = params.search;
    }
    if (params.tags?.length > 0) {
        res.tags = params.tags.split("-");
    }
    return res;
}

