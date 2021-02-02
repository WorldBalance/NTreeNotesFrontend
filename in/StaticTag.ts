interface MapStringToString { [key: string]: string; }

export const StaticTag = {
    isImage: "st_isIm",
    hasImage0: "st_hsIm",
}

export const mapStaticTagReversed: MapStringToString = createReversedObject(StaticTag);

function createReversedObject(obj: MapStringToString): MapStringToString {
    const res = {};
    const keys = Reflect.ownKeys(obj);
    for (const k of keys) {
        const v = (obj as any)[k];
        if ((res as any)[v])
            throw Error("repeated value");
        (res as any)[v] = k;
    }
    return res;
}
