class MapVis {
    constructor(parentElement, geoData, hateData, usaData) {

        this.parentElement = parentElement;
        this.geoData = geoData;
        this.hateData = hateData;
        this.usaData = usaData;
        this.displayData = [];

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        // Color array for map
        this.colors = ["#ff7878","#ff4242","#ff0d0d","#d60000","#a10000","#6b0000","#350000"];

        this.initVis()
    }

    initVis() {
        let vis = this;

        //console.log(vis.hateData);

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .text('Hate Crime Incidents By Population (1991-2020)')
            .attr("class", "genText")
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.projection = d3.geoAlbersUsa()
            .translate([vis.width / 2, vis.height / 2]);

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.country = topojson.feature(vis.geoData, vis.geoData.objects.states).features;


        // Filter out states that are not the low 48 + Alaska and Hawaii
        vis.country = vis.country.filter(function(d, index) { return ((index != 27) && (index != 44) && (index != 45) && (index != 46) && (index != 49) && (index != 50)); });

        // Append states
        vis.states = vis.svg.selectAll(".state")
            .data(vis.country)
            .enter().append("path")
            .attr('class', function(d) {
                return d.properties.name + "_state";
            })
            .attr("d", vis.path);

        // Define linear scale that outputs color based on each state's selected metric
        vis.colorScale = d3.scaleLinear()
            .range([0, 6]);

        // Define linear scale that outputs circle radius based on each state's selected metric
        vis.circleScale = d3.scaleLinear()
            .range([2,15]);

        // Append tool tip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip');

        // Append legend
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 2.8 / 4}, ${vis.height - 100})`);

        // Define linear scale that outputs scale that's 100px
        vis.x = d3.scaleLinear()
            .range([0,100]);

        // Define bar axis group
        vis.barAxisGroup = vis.svg.append("g")
            .attr("class", "barAxis axis genText");

        // Define bar axis
        vis.barAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(0);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapToolTip')

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        // if there is a region selected
        if (selectedTimeRange.length !== 0) {
            //console.log('region selected', vis.selectedTimeRange, vis.selectedTimeRange[0].getTime() )

            // iterate over all rows the csv (dataFill)
            vis.hateData.forEach(row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0].getTime() <= vis.parseDate(row.DATA_YEAR).getTime() && vis.parseDate(row.DATA_YEAR).getTime() <= selectedTimeRange[1].getTime()) {
                    filteredData.push(row);
                }
            });
        } else {
            filteredData = vis.hateData;
        }

        let hateDataByState = Array.from(d3.group(filteredData, d => d = d.STATE_NAME), ([key, value]) => ({key, value}));

        hateDataByState = hateDataByState.filter(function(d, index) { return (d.key != "Guam") && (d.key !="Federal") });
        // Hate Data By State
        vis.stateInfo = [];

        // merge
        hateDataByState.forEach(state => {


            // Get full state name
            let stateName = state.key;

            // init counter
            let population = 0;
            let hateCrimeCount = state.value.length;

            // look up population for the state in the census data set
            vis.usaData.forEach(row => {
                if (row.state === stateName) {
                    population += +row["2020"].replaceAll(',', '');
                }
            })

            let hateCrimePerCapita = hateCrimeCount/population;


                vis.stateInfo.push(
                {
                    state: stateName,
                    population: population,
                    hateCrimeCount: hateCrimeCount,
                    hateCrimePerCapita: hateCrimePerCapita,
                    stateImage: stateName + ".png"
                }
            )

        })

        vis.updateMap()
    }

    updateMap() {
        let vis = this;

        // Exit labels, rectangles, and circles
        vis.svg.selectAll(".label-text").remove();
        vis.svg.selectAll("rect").remove();
        vis.svg.selectAll("circle").remove();

        // Define domain of color scale based on user selected metric
        vis.colorScale
            .domain([d3.min(vis.stateInfo.map(a => a.hateCrimePerCapita)), d3.max(vis.stateInfo.map(a => a.hateCrimePerCapita))]);

        // Define domain of x based on user selected metric
        vis.x
            .domain([d3.min(vis.stateInfo.map(a => a.hateCrimePerCapita)), d3.max(vis.stateInfo.map(a => a.hateCrimePerCapita))]);

        // Define domain of color scale based on population
        vis.circleScale
            .domain([d3.min(vis.stateInfo.map(a => a["population"])), d3.max(vis.stateInfo.map(a => a["population"]))])

        // Make it so the axis only has the first and last values
        vis.barAxis.tickValues(vis.x.ticks(0).concat(vis.x.domain()));

        vis.metricMap = {};
        vis.stateInfo.forEach(function(d){vis.metricMap[d["state"]]=d;})


        vis.states
            .attr("fill", function(d, index) {
                if(vis.metricMap[d.properties.name] != null)
                    return "#A8A8BF";
                else
                    return "#A8A8BF";})
            .on("click", function(event, d) {
                if(vis.metricMap[d.properties.name] != null){
                    showImage(vis.metricMap[d.properties.name]["stateImage"], d.properties.name);
                    }
                })
            .on('mouseover', function(d) {
                d3.select(this)
                    .attr('stroke-width', '3px')
                    .attr('stroke', 'black')
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .style("stroke", "black")
            });

        vis.svg.append("path")
            .datum(vis.country)
            .attr("class", "land")
            .attr("d", vis.path);

        vis.svg.append("path")
            .datum(vis.country)
            .attr("d", vis.path);

        vis.states
            .attr("fill", function(d, index) {
                if(vis.metricMap[d.properties.name] != null)
                    return vis.colors[Math.floor(vis.colorScale(vis.metricMap[d.properties.name].hateCrimePerCapita))];
                else
                    return "gray";})
            .attr('stroke-width', '1px')
            .style("stroke", "black");


        // Display bar axis in percentages
        vis.barAxis.tickFormat(d => d.toFixed(5) + "%");

        // Append legend
        vis.legend.selectAll().data(vis.colors)
            .enter().append("rect")
            .attr("class", "bar barAxis")
            .attr("x", function(d, index) { return ((index * 14.28) - (vis.width * 2.8 / 20)) })
            .attr("y", 35)
            .attr("height", 20)
            .attr("width", 14.28)
            .attr("fill", d => d);

        // Call bar axis
        vis.barAxisGroup
            .attr('transform', `translate(${vis.width * 2.8 / 5}, ${vis.height - 45})`)
            .call(vis.barAxis);

        d3.select("#map-area-caption").html("<h5 class=\"genText medText\">Areas which " +
            "saw high reports of hate crime in the time studied include the <mark>West Coast and the North East.</mark> <p class='genText medText'>" +
            "<ol class='medText'><li>Click on any state to read a tweet about an alleged hate crime that occured there since 2020.</li>" +
            "<br><li>Click the 'X' in the upper right-hand corner to return to the main presentation.</li></p></h5>");

    }

}

function showImage(image, stateName) {
    $('.presentation-content').slick('unslick');

    let modal = document.getElementById("modalImageBlock");
    let modalImg = document.getElementById('modalImage');
    let captionText = document.getElementById('modalCaption');
    let span = document.getElementById('modalClose');


    modal.style.display = "block";
    modalImg.src = 'images/tweets/' + image;
    captionText.innerHTML = 'Recent example of hate crime in ' + stateName;

    span.onclick = function() {
        modal.style.display = 'none';
        $('.presentation-content').slick(getSliderSettings());
    }
}

function change() {
    let doc = document.getElementsByClassName("barChartDiv")[0];
    let color = ["rgba(210, 215, 19, 0.2)", "rgba(103, 204, 82, 0.2)", "rgba(104, 188, 197, 0.2)", "rgba(95, 133, 194, 0.2)", "rgba(119, 102, 222, 0.2)", "rgba(234, 82, 234, 0.2)", "rgba(151, 157, 172, 0.2)", "rgba(244, 63, 63, 0.2)", "rgba(242, 148, 35, 0.2)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);