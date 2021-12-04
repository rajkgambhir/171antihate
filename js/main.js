/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables
let myMapVis, myTextViz, myVictimAreaChart, myGuessViz, dataArray, AntiAsianStackedBar, mySelectionLineChart, mySankey;
let selectedTimeRange = [];
let selectedState = '';

// Date parser to convert strings to date objects
let parseDate = d3.timeParse("%d-%b-%g");

// Year formatter
let formatYear = d3.timeFormat("%Y");

//load data using promises
let promises = [
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),  // not projected -> you need to do it
    d3.csv("data/hate_crime.csv"),
    d3.csv("data/census_usa.csv")
];

let selectedCategory = document.getElementById('categorySelector').value;

function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    mySelectionLineChart.wrangleData();
}

Promise.all(promises)
    .then(function(data) {
        let mapData = data;
        data = data[1];
        data.forEach(e => {
            e.INCIDENT_ID = +e.INCIDENT_ID
            e.DATA_YEAR = +e.DATA_YEAR
            e.INCIDENT_DATE = parseDate(e.INCIDENT_DATE)
            e.ADULT_VICTIM_COUNT = +e.ADULT_VICTIM_COUNT
            e.JUVENILE_VICTIM_COUNT = +e.JUVENILE_VICTIM_COUNT
            e.TOTAL_OFFENDER_COUNT = +e.TOTAL_OFFENDER_COUNT
            e.ADULT_OFFENDER_COUNT = +e.ADULT_OFFENDER_COUNT
            e.JUVENILE_OFFENDER_COUNT = +e.JUVENILE_OFFENDER_COUNT
            e.VICTIM_COUNT = +e.VICTIM_COUNT
            e.TOTAL_INDIVIDUAL_VICTIMS = +e.TOTAL_INDIVIDUAL_VICTIMS
            e.KEY = +e.KEY
        });
        initMainPage(mapData, data);
    })
    .catch(function(err) {
        console.log(err)
    });

function initMainPage(mapDataArray, data) {
    //init map
    myMapVis = new MapVis("mapDiv", mapDataArray[0], mapDataArray[1], mapDataArray[2]);

    // init stackedBarViz
    myVictimAreaChart = new victimAreaChart("bar-area", data);

    //init guessViz
    myGuessViz = new guessViz("guessDiv", data);

    // init stackedbar for Asian American violence
    AntiAsianStackedBar = new separateStackedBar("antiAsianDiv", data, "race")

    //init lineChart
    mySelectionLineChart = new selectionLineChart("selection-line-chart", data)

    // init text
    myTextViz = new TextViz();
    myTextViz.initIntroText();

    // init Sankey
    mySankey = new sankey("sankeyDiv", data);


}


window.addEventListener('resize', function () {
    "use strict";
    window.location.reload();
});

function change() {
    let doc = document.getElementById("endDiv");
    let color = ["rgba(234, 82, 234, 0.2)", "rgba(151, 157, 172, 0.2)", "rgba(244, 63, 63, 0.2)", "rgba(242, 148, 35, 0.2)", "rgba(210, 215, 19, 0.2)", "rgba(103, 204, 82, 0.2)", "rgba(104, 188, 197, 0.2)", "rgba(95, 133, 194, 0.2)", "rgba(119, 102, 222, 0.2)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);