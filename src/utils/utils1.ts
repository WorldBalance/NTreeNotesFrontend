
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
