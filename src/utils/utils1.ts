
export type OneOrArray<T> = T | T[];


export function getFirstDefined(...args: any[]): any {
    for (const arg of args) {
        if (typeof(arg) !== "undefined")
            return arg;
    }
}


export function createGlobalThis(): void {
    const globalThis1 = getFirstDefined(globalThis, self, window, global);

    if (!globalThis1.globalThis) {
        globalThis1.globalThis = globalThis1;
    }
}


export function toArray<T = any>(values: OneOrArray<T>): T[] {
    return Array.isArray(values) ? values : [values];
}


export function truncateForHtml(str: string, n: number){
    return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
};
