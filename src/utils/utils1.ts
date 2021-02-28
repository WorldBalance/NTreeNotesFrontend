
export type OneOrArray<T> = T | T[];


export function getFirstDefined(...args: any[]): any {
    for (const arg of args) {
        if (typeof(arg) !== "undefined")
            return arg;
    }
}


export function stringToBoolean<T>(s: string, valueDefault: boolean | T = false): boolean | T {
    switch(s.toLowerCase()) {
        case "true":
        case "1":
        case "on":
        case "yes":
        case "y":
            return true;

        case "false":
        case "0":
        case "off":
        case "no":
        case "n":
            return false;
    }

    return valueDefault;
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


// Array, append
export function pushUniqueValue<T = any>(array: T[], value: T) {
    if (array.indexOf(value) < 0)
        array.push(value);
}



export type PlainText = string;
export type Html = string;
export type HtmlEncoded = string;


export function escapeHtml(str: Html) : HtmlEncoded {
    return encodeHtml(str);
}


export function encodeHtml(str: Html) : HtmlEncoded {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
}


export function decodeHtml(str: HtmlEncoded) : Html {
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (m) => map[m]);
}


export function plainTextToHtmlWithBr(str: PlainText) : Html {
    return str.split("\n").map(encodeHtml).join("<br>");
}


// sleep, wait, delay
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => void setTimeout(resolve, ms));
}


export interface domLoadUrlOpt {
    parentId?: string; // default: <head>
    removeChildren?: boolean; // default: false, only if <parentId> is valid
    sleepMs?: number; // default: 10
}

export function domLoadUrls(urls: string[], opt?: domLoadUrlOpt): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const parentId = opt && opt.parentId;
        const parentNodeUser = parentId && document.getElementById(parentId);
        if (parentId && !parentNodeUser) {
            throw new Error(`domLoadUrls, not found node with id: '${parentId}'`);
        }
        if (opt && opt.removeChildren) {
            removeChildren(parentNodeUser);
        }
        const sleepMs = isDefined(opt && opt.sleepMs) && opt.sleepMs || 10;

        const parentNode = parentNodeUser || document.getElementsByTagName('head')[0];
        for (const url of urls) {
            let node;
            if (url.endsWith(".js")) {
                const node1 = document.createElement('script');
                node1.src = url;
                node1.type = 'text/javascript';
                node1.async = false;
                node = node1;
            } else if (url.endsWith(".css")) {
                const node1 = document.createElement('link');
                node1.rel = 'stylesheet';
                node1.href = url;
                node = node1;
            } else {
                throw new Error(`domLoadUrls, unsupported extension of loaded file, expected: {OneOf: .js, .css}, actual: '${url}'`);
            }
            parentNode.appendChild(node);

            sleepMs && await sleep(sleepMs);
        }
        resolve();
    });
}


export function removeChildren(parent: HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


export function isDefined(value: any): boolean {
    return (typeof(value) !== 'undefined');
}
