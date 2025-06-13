let x2j = new X2JS();
let xml2json = x2j.json2xml_str;
let idtext = document.getElementById("assetid");
let aktext = document.getElementById("apikey");
let prox = document.getElementById("proxy");
let finp = document.getElementById("finp");
let submit = document.getElementById("submit");
let rw = document.getElementById("switch");
let dlbut = document.getElementById("download");
let latest = "0.4";

document.documentElement.style.fontFamily = "Comic Sans MS";

function rwclicked() {
  let disbool = {
    [true]: "none",
    [false]: "block",
  };
  let chosen = rw.checked;
  hide(idtext, disbool[chosen], true);
  hide(aktext, disbool[chosen], true);
  hide(prox, disbool[chosen], true);
  hide(finp, disbool[!chosen], true);
  hide(dlbut, disbool[!chosen], true);
}
rwclicked();
rw.addEventListener("click", rwclicked);

function hide(elt, visible, parent) {
  if (elt) {
    let targ = elt;
    if (parent && elt.parentElement) {
      targ = elt.parentElement;
    }
    targ.style.display = visible;
  }
}
function blobtob64(blob) {
  //didnt make this
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
function download(blob, name) {
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
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
        version: latest,
      };

      let blob = new Blob([xml2json(pack)], { type: "application/json" });

      //i use this way too much 💔
      download(blob, `${info.AssetId || "model"}.rbxpack`);
    } catch (err) {
      console.error(err);
      alert(`err: ${err.message}`);
    }
  } else {
  }
}
