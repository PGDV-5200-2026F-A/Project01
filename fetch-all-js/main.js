const SI_URL = "https://api.si.edu/openaccess/api/v1.0/search";
const OBJS_PER_QUERY = 1000;

const QUERY_TERM = "astrolabe";
const objects = [];

document.addEventListener("DOMContentLoaded", async () => {
  const startButton = document.querySelector("#start-button");
  startButton.addEventListener("click", async () => {
    startButton.style.display = "none";

    const params = {
      q: `${QUERY_TERM} AND online_media`,
      api_key: SI_KEY,
      start: 0,
      sort: "id",
      rows: 0
    };
    const paramString = new URLSearchParams(params).toString();
    const res = await fetch(`${SI_URL}?${paramString}`);
    const data = await res.json();

    const totalRows = data["response"]["rowCount"];

    for (let qcnt = 0; qcnt < totalRows / OBJS_PER_QUERY; qcnt += 1) {
      params.start = qcnt * OBJS_PER_QUERY;
      params.rows = OBJS_PER_QUERY;
      const paramString = new URLSearchParams(params).toString();
      const res = await fetch(`${SI_URL}?${paramString}`);
      const data = await res.json();
      
      for (let rcnt = 0; rcnt < data.response.rows.length; rcnt += 1) {
        const row = data.response.rows[rcnt];
        const ocnt = qcnt * OBJS_PER_QUERY + rcnt;
        if (ocnt % 100 == 0) console.log(ocnt, "/", totalRows);
        if (ocnt == 100) {
          const b = document.createElement("button");
          b.innerHTML = "save json";
          document.body.appendChild(b);
          b.addEventListener("click", () => saveJSON(objects));
        }

        rowMedia = row.content.descriptiveNonRepeating.online_media.media[0];
        if ("thumbnail" in rowMedia) {
          const validImg = await checkImageExists(rowMedia.thumbnail);
          if (validImg) {
            objects.push(row);
          } else {
            console.log("no img ");
          }
        } else {
          console.log("no thumb");
        }
        await sleep(50);
      }
    }
    console.log(objects.length);
  });
});
