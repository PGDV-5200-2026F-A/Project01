// const SI_URL = "https://api.si.edu/openaccess/api/v1.0/search";
const GQL_URL = "https://corsproxy.io/?key=webdemo1&url=https://api.cooperhewitt.org/";

// how many rows to fetch per fetch request
const OBJS_PER_QUERY = 250;

// const QUERY_TERM = "astrolabe";
const QUERY_TERM = "flag";

// list to store objects
const objects = [];

// Wait for html to be available
document.addEventListener("DOMContentLoaded", async () => {
  // our button that starts the query
  const startButton = document.querySelector("#start-button");

  // on click
  startButton.addEventListener("click", async () => {
    startButton.style.display = "none";

    // GraphQL query as string.
    // initially going to fetch 1 record, just to get a total row count
    const graphqlQuery = `
      {
        object(general: "${QUERY_TERM}", hasImages:true, size: 1, page: 1, sort:[{id: "asc"}]) {
          id
        }
      }
    `;

    // this turns the text above into something that can be appended to an url
    const paramString = encodeURIComponent(graphqlQuery);

    // fetch and decode response
    const res = await fetch(`${GQL_URL}?query=${paramString}`);
    const data = await res.json();

    console.log(data);

    // row count
    const totalRows = data["extensions"]["pagination"]["hits"];

    // fetch in groups of 1000 rows (can be changed above)
    for (let qcnt = 0; qcnt < totalRows / OBJS_PER_QUERY; qcnt += 1) {
      // update parameters to get results starting at rows 0, 1000, 2000, etc
      const graphqlQuery = `
        {
          object(general: "${QUERY_TERM}", hasImages:true, size: ${OBJS_PER_QUERY}, page: ${qcnt}, sort:[{id: "asc"}]) {
            id
            title
            summary
            date
            description
            color
            multimedia
            geography
          }
        }
      `;

      // this turns the text above into something that can be appended to an url
      const paramString = encodeURIComponent(graphqlQuery);

      // fetch and decode response
      const res = await fetch(`${GQL_URL}?query=${paramString}`);
      const data = await res.json();

      // iterate through rows
      for (const row of data.data.object) {

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
        const mediaUrl = row.multimedia?.[0]?.preview?.url;
        const mediaType = row.multimedia?.[0]?.type ?? "";

        // if it has a thumbnail, check if it's a valid url
        if (mediaUrl && mediaType == "image") {
          const validImg = await checkImageExists(mediaUrl);
          if (validImg) {
            // if image is valid add its url to the root of the row object
            row["image_url"] = mediaUrl;
            objects.push(row);
          }
        }

        // wait a bit to not get kicked out of API
        await sleep(10);
      }
      await sleep(100);
    }
    console.log(objects.length);
  });
});
