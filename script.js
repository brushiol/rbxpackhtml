let idtext = document.getElementsByName("assetid");
let aktext = document.getElementsByName("apikey");
let prox = document.getElementsByName("proxy");
let finp = document.getElementsByName("finp");
let submit = document.getElementById("submit");
let rw = document.getElementById("switch");
let latest = "0.3"

document.documentElement.style.fontFamily = 'Comic Sans MS';

function rwclicked(){
    let chosen = rw.checked;
    hide(idtext, chosen, true);
    hide(aktext, chosen, true);
    hide(prox, chosen, true);
    hide(finp, !chosen, true);
}
rwclicked()
rw.addEventListener("click",rwclicked)

function hide(elt, visible, parent) { 
    if (!elt) return
    let disbool = {
        [true]: "block",
        [false]: "none",
    }
    let targ
    if (parent && elt.parentElement) {
        targ = elt.parentElement
    } else {
        targ = elt
    }
    targ.style.display = disbool[visible]
}
function blobtob64(blob) { //didnt make this
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
async function enter() {
    let chosen = rw.checked;
    if (!chosen) {
        let assetid = idtext.value;
        let apikey = aktext.value;
        let proxy = prox.value;

        if (!assetid) {
            alert("an asset id is required.");
            return;
        }
        if (!apikey) {
            alert("an api key is required.");
            return;
        }

        let asseturl = `https://apis.${proxy}/asset-delivery-api/v1/assetId/${assetid}`;
        let infourl = `https://economy.${proxy}/v2/assets/${assetid}/details`;

        try {
            let assetidresponse = await fetch(asseturl, {
                headers: {
                    "x-api-key": apikey,
                },
            });
            if (!assetidresponse.ok) throw new Error(assetidresponse.status);

            let assetjson = await assetidresponse.json();
            if (!assetjson.location)
                throw new Error("location url missing in asset response");

            let assetresponse = await fetch(assetjson.location);
            if (!assetresponse.ok) throw new Error("failed to download asset");

            let ablob = await assetresponse.blob();
            let base64 = await blobtob64(ablob);

            let iresponse = await fetch(infourl);
            if (!iresponse.ok) throw new Error("failed to fetch asset info");

            let info = await iresponse.json();

            let pack = {
                title: info.Name,
                description: info.Description,
                creator: { name: info.Creator.Name, userid: info.Creator.Id },
                created: info.Created,
                updated: info.Updated,
                assetid: info.AssetId,
                asset: base64,
                version: latest
            };

            let blob = new Blob([JSON.stringify(pack, null, 2)], {
                type: "application/json",
            });

            //i use this way too much 💔
            let link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${info.AssetId || "model"}.rbxpack`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(err);
            alert(`err: ${err.message}`);
        }
    } else {

    }
}
