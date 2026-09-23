const SI_URL = "https://api.si.edu/openaccess/api/v1.0/search";

// how many rows to fetch per fetch request
const OBJS_PER_QUERY = 1000;

const QUERY_TERM = "astrolabe";
// const QUERY_TERM = "orchid";
// const QUERY_TERM = "political poster";

// list to store objects
const objects = [];

// Wait for html to be available
document.addEventListener("DOMContentLoaded", async () => {
  // our button that starts the query
  const startButton = document.querySelector("#start-button");

  // on click
  startButton.addEventListener("click", async () => {
    startButton.style.display = "none";

    // query parameters as an object.
    // easier to read and manipulate.
    // initially going to fetch 0 rows, just to get a total row count
    const params = {
      q: `${QUERY_TERM} AND online_media`,
      api_key: SI_KEY,
      start: 0,
      sort: "id",
      rows: 0
    };

    // this turns the object into text that can be appended to the url
    const paramString = new URLSearchParams(params).toString();

    // fetch and decode response
    const res = await fetch(`${SI_URL}?${paramString}`);
    const data = await res.json();

    // row count
    const totalRows = data["response"]["rowCount"];

    // fetch in groups of 1000 rows (can be changed above)
    for (let qcnt = 0; qcnt < totalRows / OBJS_PER_QUERY; qcnt += 1) {
      // update parameters to get results starting at rows 0, 1000, 2000, etc
      params.start = qcnt * OBJS_PER_QUERY;
      params.rows = OBJS_PER_QUERY;
      const paramString = new URLSearchParams(params).toString();

      // fetch and decode
      const res = await fetch(`${SI_URL}?${paramString}`);
      const data = await res.json();

      // iterate through rows
      for (const row of data.response.rows) {

        // object count
        const ocnt = objects.length;

        // print progress every 25 objects
        if (ocnt % 25 == 0) console.log(ocnt, "/", totalRows);

        // show save button after 25 objects have been added to list
        if (ocnt == 25) {
          const b = document.createElement("button");
          b.innerHTML = "save json";
          b.addEventListener("click", () => saveJSON(objects));
          document.body.appendChild(b);
        }

        // the first media item of this row
        const rowMedia = row.content?.descriptiveNonRepeating?.online_media?.media?.[0];

        // if it has a thumbnail, check if it's a valid url
        if (rowMedia && "thumbnail" in rowMedia) {
          const validImg = await checkImageExists(rowMedia.thumbnail);
          if (validImg) {
            // if image is valid push some of the row's data to our objects list
            // these are the fields we're interested in. might need to be adapted.
            const toSave = {
              id: row.id,
              url: row.url,
              source: row.content?.descriptiveNonRepeating?.data_source ?? "",
              description: row.content?.freetext?.notes?.[0]?.content ?? "",
              first_image: row.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.thumbnail ?? ""
            }
            objects.push(toSave);
          }
        }

        // wait a bit to not get kicked out of SI's API
        await sleep(50);
      }
    }
    console.log(objects.length);
  });
});
