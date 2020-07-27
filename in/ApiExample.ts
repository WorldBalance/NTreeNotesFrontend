

import { Request, ResponseOk, Note, sNTreeNotes } from "./Api";

const token = "token1_njf489gfh";

// create a new note
{
    const note: Note = {
        title: "title1",
        text: "text1"
    };

    const req: Request = {
        namespace: sNTreeNotes,
        sourceId: token,
        actionId: "create",
        object: note,
    };

    const res = await post(req);
    // res.objectId - id of created object
}


// find the recent modified notes
{
    const req: Request = {
        namespace: sNTreeNotes,
        sourceId: token,
        actionId: "find",
    };

    const res = await post(req);
    // res.object: Item[] - found items
}



async function post(req: Request): Promise<ResponseOk> {
    const res = { ok: false }; // do the real post-request
    if (!res.ok) {
        // process error
    }
    return { ok: false } as Response;
}
