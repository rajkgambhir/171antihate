/* * * * * * * * * * * * * *
*       Guess Chart        *
* * * * * * * * * * * * * */
/* * * * * * * * * * * * * *
*     class guessViz       *
* * * * * * * * * * * * * */

let mousePressed = false;
let lastX, lastY, ctx;

let graphCount = 0;

class guessViz {

    constructor(parentElement, hateCrimes) {

        this.parentElement = parentElement;
        this.hateCrimes = hateCrimes;
        this.displayData = [];

        // define colors
        this.colors = ["#f1dfdf", "#e2bfbf", "#d49f9f", "#c58080", "#b76060", "#a84040", "#9a2020"];

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 80, bottom: 100, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width  - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("id", "guessSVG")
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        // add title
        vis.svg.append('g')
            .attr('class', 'title guess-title')
            .append('text')
            .attr("class", "genText")
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle')
            .text("Number of Hate Crimes Against Muslims 1991-2020");

        // Create new version of hate crime data to analyze
        vis.displayData = vis.hateCrimes

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(d3.format("d"));

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis genText");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis genText");

        // Create area from data
        vis.area = d3.area()
            .x(function(d) {return vis.x(d.key) })
            .y0(vis.y(0))
            .y1(function(d) {return vis.y(d.value)});

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'guessTooltip');

        let canvas = document.getElementById('myCanvas')
        ctx = canvas.getContext("2d");

        canvas.addEventListener("mousedown", function(e){
            mousePressed = true;
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
        });

        canvas.addEventListener("mousemove", function(e){
            if (mousePressed) {
                Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }
        });

        canvas.addEventListener("mouseup", function(e){
            mousePressed = false;
        });

        canvas.addEventListener("mouseleave", function(e){
            mousePressed = false;
        });

        function Draw(x, y, isDown) {
            if (isDown) {
                ctx.beginPath();
                ctx.lineJoin = "round";
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.stroke();
            }
            lastX = x; lastY = y;
        }


        document.getElementById("myCanvas").setAttribute("width", (vis.width));
        document.getElementById("myCanvas").setAttribute("height", (vis.height));
        document.getElementById("myCanvas").style.left = (vis.margin.left).toLocaleString() + "px";
        document.getElementById("myCanvas").style.right = (vis.margin.right).toLocaleString() + "px";
        document.getElementById("myCanvas").style.top = (vis.margin.top).toLocaleString() + "px";
        document.getElementById("myCanvas").style.bottom = (vis.margin.bottom).toLocaleString() + "px";

        d3.select("#guess-area-caption").html("<p class=\"genText medText\" style='font-style: italic'>" +
            "To demonstrate the often reactive nature of hate crimes, guess how the number hate crimes against Muslims has changed based on the " +
            "political and social events noted in the graph. <ol class=\"genText medText\"><li>Draw directly on the graph by clicking and " +
            "dragging.</li> <li>For more context, hover over the yellow dots to learn more about domestic and international " +
            "events that have a direct bearing on the number of hate crimes against Muslims.</li> <li>Once you have made your " +
            "guess, press 'Toggle graph' to see how the data pans out.</li></ol> </p>")



        this.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // (1) Filter overall dataset down to just hate crimes against Muslims
        vis.hateCrimes = vis.hateCrimes.filter(function(d){ return d["BIAS_DESC"] == "Anti-Islamic (Muslim)"});

        // (2) Group hate crimes against Muslims by year. Convert dates to years, then integers, then shift by a year
        vis.muslimData = Array.from(d3.group(vis.hateCrimes, d => (d3.timeYear(d.INCIDENT_DATE))), ([key, array]) => ({key: key, value: array.length}));

        vis.muslimData.forEach(row=> {
            row.key = +(formatYear(row.key)) + 1;
            })

        // (3) Split dataset into pre-1998 data and post 1998 data. The latter data will be hidden until user action
        vis.preData = [];
        vis.postData = [];
        vis.muslimData.forEach(row => {
            if(row.key < 1999)
                vis.preData.push(row);
            else
                vis.postData.push(row);
        })

        vis.muslimData.forEach(row => {
            if(row.key == 1999)
                vis.preData.push(row);
        });

        // (4) Yeah
        vis.selectData = [1992, 2001, 2013, 2014, 2015, 2016, 2017];
        vis.circleCaptions = ["1991: al-Qaeda World Trade Center Bombing in New York City",
        "2001: Attacks on the World Trade Center in New York City", "2013: Boston Marathon Bombing",
        "2014: The Islamic State of Iraq and Syria (ISIS) captures large swaths of territory in West Asia.",
        "2015: San Bernadino attack in Southern California", "2016: Pulse Nightclub Shooting in Orlando",
        "2017: Car Attack in Lower Manhattan by ISIS sympathizer"]

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.x.domain([d3.min(vis.muslimData, d => d.key), d3.max(vis.muslimData, d => d.key)]);
        vis.y.domain([0, d3.max(vis.muslimData, d => d.value)]);

        // Append path to graph
        vis.svg.append("path")
            .datum(vis.preData)
            .attr("class", "path-graph")
            .attr("d", vis.area);

        vis.svg.append("path")
            .datum(vis.postData)
            .attr("class", "hidden-graph")
            .attr("d", vis.area);

        vis.xAxisGroup = vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg.select(".y-axis")
            .call(vis.yAxis);

        vis.svg.select("text.axis-title").remove();

        vis.svg.append("text")
            .attr("class", "axis-title")
            .attr("x", -5)
            .attr("y", -15)
            .attr("dy", ".1em")
            .attr("class", "genText")
            .style("text-anchor", "end")
            .text("Hate Crimes");

        vis.circles = vis.svg.selectAll("circle")
            .data(vis.selectData);

        vis.circles
            .enter()
            .append('circle')
            .attr("class", "guessContextCircle")
            .attr('cx', function(d, i) {
                return vis.x(d);
            } )
            .attr('cy', vis.height + vis.margin.top)
            .attr('r','10px')
            .style('fill', '#FAF8E5')
            .style("stroke", "black")
            .on("mouseover", function(event, d){
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                 <div style="border: thin solid grey; border-radius: 2px; background: lightgrey; padding: 5px">
                    <p>${vis.circleCaptions[vis.selectData.indexOf(d)]}<p>
                 </div>`);
            })
            .on('mouseout', function(event, d){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

    }

    revealGraph() {
        if(graphCount % 2 == 0)
            d3.select(".hidden-graph").style("fill", "#F43F3F");
        else
            d3.select(".hidden-graph").style("fill", "transparent");

        d3.select("#hidden-guess-caption").style("opacity", 1);

        graphCount++;

    }

    clearArea() {
        // Use the identity matrix while clearing the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

}

function change() {
    let doc = document.getElementsByClassName("guessChartBlock")[0];
    let color = ["rgba(95, 133, 194, 0.2)", "rgba(119, 102, 222, 0.2)", "rgba(234, 82, 234, 0.2)", "rgba(151, 157, 172, 0.2)", "rgba(244, 63, 63, 0.2)", "rgba(242, 148, 35, 0.2)", "rgba(210, 215, 19, 0.2)", "rgba(103, 204, 82, 0.2)", "rgba(104, 188, 197, 0.2)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);