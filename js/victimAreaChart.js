/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */


class victimAreaChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();

    }


    /*
     * Initialize visualization (static content; e.g. SVG area, axes, brush component)
     */

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 40, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Overlay with path clipping
        // Paste this code snippet after creating the SVG element:
        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);


        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.svg.append("g")
            .attr("class", "y-axis axis genText");

        vis.svg.append("g")
            .attr("class", "x-axis axis genText")
            .attr("transform", "translate(0," + vis.height + ")");

        // Labelling axis https://stackoverflow.com/questions/11189284/d3-axis-labeling
        vis.svg.append("text")
            .attr("class", "x label genText")
            .attr("text-anchor", "end")
            .attr("x", vis.width)
            .attr("y", vis.height + 30)
            .attr("font-size", "x-small")
            .text("Date");

        vis.svg.append("text")
            .attr("class", "y label genText")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", "-5em")
            .attr("transform", "rotate(-90)")
            .attr("font-size", "x-small")
            .text("Number of Hate Crime Victims per Week");


        // Append a path for the area function, so that it is later behind the brush overlay
        vis.timePath = vis.svg.append("path")
            .attr("class", "area");

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title genText')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle')
            .text("Number of Hate Crime Victims Reported per Week (1991-2020)");



        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // (1) Group data by date and count survey results for each day
        // (2) Sort data by day


        // * TO-DO *

        //Group data by date and count survey results for each day
        // let rolledSurveyData = d3.rollup(vis.data,leaves=>leaves.length,d=>d.INCIDENT_DATE)
        // https://observablehq.com/@d3/d3-group
        let rolledSurveyData = d3.rollup(vis.data, v => d3.sum(v, d => d.VICTIM_COUNT), d => d3.timeWeek(d.INCIDENT_DATE))

        vis.displayData = Array.from(rolledSurveyData, ([key, value]) => ({key, value}))

        //
        vis.displayData.sort(function(a,b) {
            // Need to sort to get proper graph
            // return a.date - b.date;
            return a.key - b.key;
        });

        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // Update domain
        vis.x.domain(d3.extent(vis.displayData, function (d) {
            // console.log(d.key);
            //return d.date
            return d.key;
        }));
        vis.y.domain([0, d3.max(vis.displayData, function (d) {
            return d.value;
        })]);


        // D3 area path generator
        vis.area = d3.area()
            .curve(d3.curveCardinal)
            .x(function (d) {
                // return vis.x(d.date); // displayDate no longer has
                return vis.x(d.key);
            })
            .y0(vis.height)
            .y1(function (d) {
                return vis.y(d.value);
            });


        // Call the area function and update the path
        // D3 uses each data point and passes it to the area function. The area function translates the data into positions on the path in the SVG.
        vis.timePath
            .datum(vis.displayData)
            .attr("d", vis.area)
            .style("fill", "#979dac");



        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);


        // Simple area chart with tooltip
        //https://observablehq.com/@elishaterada/simple-area-chart-with-tooltip
        function mouseMove(event) {

            var xCoord = (d3.pointer(event)[0]);
            var yCoord = (d3.pointer(event)[1]);

            var mouseDate = vis.x.invert(xCoord);
            // Change timeYear to TimeMonth
            var mouseDateSnap = d3.timeWeek.floor(mouseDate);

            // Keep tooltip within region
            if (vis.x(mouseDateSnap) < 0 ||
                vis.x(mouseDateSnap) > vis.width + 10 ) {
                return;
            }


            var bisectDate = d3.bisector(d=>d.key).left;
            var xIndex = bisectDate(vis.displayData, mouseDateSnap, 1);
            var d0 = vis.displayData[xIndex - 1]
            var d1 = vis.displayData[xIndex]
            var mousePopulation = vis.displayData[xIndex].value;

            vis.svg.selectAll('.hoverLine')
                .attr('x1', vis.x(mouseDateSnap))
                .attr('y1', 0)
                .attr('x2', vis.x(mouseDateSnap))
                .attr('y2', vis.height)
                .attr('stroke', "#a0c4ff")
                .attr('fill', "#a0c4ff")
            ;

            vis.svg.selectAll('.hoverPoint')
                .attr('cx', vis.x(mouseDateSnap))
                .attr('cy', vis.y(mousePopulation))
                .attr('r', 3)
                .attr('fill', "blue")
            ;

            const isLessThanHalf = xIndex > vis.displayData.length / 2;
            const hoverTextX = isLessThanHalf ? '-0.75em' : '0.75em';
            const hoverTextAnchor = isLessThanHalf ? 'end' : 'start';

            // Function that converts population from number to string and adds commas
            // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
            function numberWithCommas(x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }

            vis.svg.selectAll('.hoverText')
                .attr('x', vis.x(mouseDateSnap))
                // .attr('y', vis.y(mousePopulation))
                .attr('y', 120)
                .attr('dx', hoverTextX)
                .attr('dy', '0.25em')
                .style('text-anchor', hoverTextAnchor)
                .style("fill", "black")
                .text("Number of Hate Crime Victims: " + numberWithCommas((mousePopulation)));

            // Convert date object to string of time
            // https://github.com/d3/d3-time-format/blob/main/README.md
            const formatTime = d3.timeFormat("%B %d, %Y");

            vis.svg.selectAll('.hoverDateText')
                .attr('x', vis.x(mouseDateSnap))
                .attr('y', 120)
                // .attr('y', vis.y(mousePopulation))
                .attr('dx', hoverTextX)
                .attr('dy', '-1.25em')
                .style('text-anchor', hoverTextAnchor)
                .text("Week of " + (formatTime(mouseDateSnap)));
        }


        // Interactivity
        vis.svg.append('line').classed('hoverLine', true);
        vis.svg.append('circle').classed('hoverPoint', true);
        vis.svg.append("text").classed('hoverText', true);
        vis.svg.append("text").classed('hoverDateText', true);

        vis.svg.append('rect')
            .attr('fill', 'transparent')
            .attr('x', 100)
            .attr('y', 100)
            .attr('width', vis.width)
            .attr('height', vis.height)
        ;

        vis.svg.on('mousemove', mouseMove);

        d3.select("#bar-area-caption").html("<h5 class='bigText genText' id='introText'>For those in the U.S., 2020 saw" +
            " the <mark>highest level of hate crimes since 2008.</mark><p class='medText genText'>" +
            "Following the inital COVID-19 lockdowns, we see a spike in hate crimes not seen since 9/11, this time directed primarily against Black " +
            "and Asian Americans. <mark>Hover over the chart for more info.</mark></p></h5>");

    }
}

function change() {
    let doc = document.getElementsByClassName("mapChartBlock")[0];
    let color = ["rgba(242, 148, 35, 0.2)", "rgba(210, 215, 19, 0.2)", "rgba(103, 204, 82, 0.2)", "rgba(104, 188, 197, 0.2)", "rgba(95, 133, 194, 0.2)", "rgba(119, 102, 222, 0.2)", "rgba(234, 82, 234, 0.2)", "rgba(151, 157, 172, 0.2)", "rgba(244, 63, 63, 0.2)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);