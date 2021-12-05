/* * * * * * * * * * * * * *
* Separate Stacked Bar    *
* * * * * * * * * * * * * */
/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class separateStackedBar {

    constructor(parentElement, hateCrimes, typeofBias){

        this.parentElement = parentElement;
        this.hateCrimes = hateCrimes;
        this.typeofBias = typeofBias;
        this.displayData = [];

        // bar chart colors
        this.colors = ["#F43F3F", "#F29423", "#D2D713", "#67CC52", "#68BCC5", "#5F85C2", "#7766DE", "#EA52EA", "#979DAC", "black", "#9F8170", "#702963", "#006B3C", "#E9967A", "#9E1B32"];


        // format time
        this.formatTime = d3.timeFormat("%Y");

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 50, right: 80, bottom: 100, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width  - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title genText')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle')
            .text("");


        // Create new version of hate crime data to analyze
        vis.displayData = vis.hateCrimes

        // Scales and axes
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(d3.timeFormat("%Y"));

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis genText");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis genText")
            // https://www.d3-graph-gallery.com/graph/barplot_stacked_hover.html
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px");

        vis.svg.append("text")
            .attr("class", "x label genText")
            .attr("text-anchor", "end")
            .attr("x", vis.width)
            .attr("y", vis.height + 30)
            .attr("font-size", "x-small")
            .text("Date");


        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'stackedTooltip')

        // Add title space
        vis.svg.append('g')
            .attr('class', 'title genText')
            .attr('id', 'ssb-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');








        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        // list of race biases
        vis.raceBiases = [
            "Anti-Asian",
            "Anti-Black or African American",
            "Anti-White",
            "Anti-Jewish",
            "Anti-Arab",
            "Anti-Hispanic or Latino",
            "Anti-Other Race/Ethnicity/Ancestry",
            "Anti-Multiple Races, Group",
            "Anti-Native Hawaiian or Other Pacific Islander",
        ]

        vis.religionBiases = [
            "Anti-Jewish",
            "Anti-Protestant",
            "Anti-Other Religion",
            "Anti-Islamic (Muslim)",
            "Anti-Catholic",
            "Anti-Multiple Religions, Group",
            "Anti-Atheism/Agnosticism",
            "Anti-Jehovah's Witness",
            "Anti-Mormon",
            "Anti-Buddhist",
            "Anti-Sikh",
            "Anti-Other Christian",
            "Anti-Hindu",
            "Anti-Eastern Orthodox (Russian, Greek, Other)",
        ]

        vis.filtered = [];

        // Filter the display data based on the type chosen
        if (vis.typeofBias === "asian"){ // anti asian stacked bar chart
            // console.log("asian bar chart");
            vis.filteredData = vis.displayData.filter( (d, i) => {
                // console.log("filtered d", d)
                return (d.BIAS_DESC === "Anti-Asian");
            });
        } else if (vis.typeofBias === "race"){
            // console.log("race bar chart");
            vis.filteredData = vis.displayData.filter(d=>{
                // Checking if variable in in the array of race related biases
                // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
                if(vis.raceBiases.indexOf(d.BIAS_DESC) !== -1){
                    return d
                }
            })
        } else if (vis.typeofBias === "religion"){
            // console.log("religion bar chart");
            vis.filteredData = vis.displayData.filter(d=>{
                // Checking if variable in in the array of race related biases
                // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
                if(vis.religionBiases.indexOf(d.BIAS_DESC) !== -1){
                    return d
                }
            })
        }


        // Group data by key variable (date) and count instances
        vis.dateGroup = Array.from(d3.group(vis.filteredData, d => d3.timeYear(d.INCIDENT_DATE)), ([key, array]) => ({key: key, value: array.length}));

        vis.dateGroup.forEach(d => {
            d.value = +d.value;
        });

        // console.log("dateGroup", vis.dateGroup)


        // Group data by bias description and count instances
        vis.biasGroup = Array.from(d3.group(vis.filteredData, d=>d.BIAS_DESC), ([key, array]) => ({key: key, value: array.length}));

        // Create array of all biases
        vis.bias = []

        vis.biasGroup.forEach((d,i) => {
            // push every bias to the array
            vis.bias.push(vis.biasGroup[i].key)
        });


        // Function to reorder element of the array. We want to reorder Asian to be at the top for our separate stacked bar
        // https://gomakethings.com/how-to-reorder-an-item-in-an-array-with-vanilla-js/
        vis.asianattop = vis.bias


        let moveInArray = function (arr, from, to) {

            // Make sure a valid array is provided
            if (Object.prototype.toString.call(arr) !== '[object Array]') {
                throw new Error('Please provide a valid array');
            }

            // Delete the item from it's current position
            let item = arr.splice(from, 1);

            // Make sure there's an item to move
            if (!item.length) {
                throw new Error('There is no item in the array at index ' + from);
            }

            // Move the item to its new position
            arr.splice(to, 0, item[0]);

        };

        moveInArray(vis.asianattop, 4, 0);



        //Group data by key variables date and time and count leaves
        // Group sort https://observablehq.com/@d3/d3-groupsort
        vis.biasBreakdownYear = Array.from(d3.rollup(vis.filteredData,leaves=>leaves.length,d => d3.timeYear(d.INCIDENT_DATE), d => d.BIAS_DESC), ([key, value]) => ({key, value}))
        // console.log("biasBreakdownYear", vis.biasBreakdownYear)



        vis.objectData = []

        vis.biasBreakdownYear.forEach(d => {
            // console.log("d in biasbreakdownyear", d)
            let obj = {
                //Creating an object with an element called year and every element found in d.value map
                year: d.key,
                // Every property within the d.value made into an object
                ...Object.fromEntries(d.value)
            }
            vis.bias.forEach(f=>{
                obj[f] = obj[f] || 0;
            })
            // obj['Anti-American Indian or Alaska Native'] = obj['Anti-American Indian or Alaska Native'] || 0;

            vis.objectData.push(obj)
        });









        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        // Update title
        let title = vis.svg.selectAll("ssb-title")
            .data(vis.objectData);

        // Enter
        title.enter()
            .append("text")
            .attr("class", "title genText")
            .attr('id', 'ssb-title')
            .merge(title)
            // .text([selectedCategory])
            // Match the title to the selectedCategory
            .text(function(){
                switch (vis.typeofBias) {
                    // Switch expression https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
                    // https://www.cs171.org/Homework_instructions/week-11/lab/week-11_lab.html
                    case 'asian': return "Anti-Asian Hate Crimes Reported per Year (1991-2020)";
                    case 'race': return "Race/Ethnicity Based Hate Crimes Reported per Year (1991-2020)";
                    case 'religion': return "Religion Based Hate Crimes Reported per Year (1991-2020)";
                }
            })
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');

        // Exit
        title.exit().remove();

        // Update scale domains
        vis.x.domain(vis.dateGroup.map(d => d.key));
        vis.y.domain([0, d3.max(vis.dateGroup, d => d.value)]);


        // https://www.d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
        // Create function of stack to stack the bar charts
        vis.stack = d3.stack()
            // .keys(vis.bias)
            .keys(vis.asianattop)
            (vis.objectData)

        // create subgroups of each bias
        var subgroups = (vis.bias)

        // color palette = one color per subgroup of bias
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(vis.colors)


        // Show the bars
        vis.svg.append("g")
            .selectAll(".column")
            // Enter in the stack data = loop key per key = group per group
            .data(vis.stack)
            .enter().append("g")
            .attr("class", "column")
            .attr("fill", function(d) {
                // console.log("fill", d.key)
                return color(d.key);
            })
            // .attr("opacity", 0.5)
            .attr("opacity",function(d){
                // console.log("d in opacity", d)
                if (d.key != "Anti-Asian"){
                    return 0.2
                }
            })
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return vis.x(d.data.year); })
            .attr("y", function(d) { return vis.y(d[1]); })
            .attr("height", function(d) { return vis.y(d[0]) - vis.y(d[1]); })
            .attr("width",vis.x.bandwidth())
            .on('mouseover', function(event, d){
                let key;
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                 <div style="border: thin solid grey; border-radius: 2px; background: lightgrey; padding: 5px">
                    <p>Year: ${vis.formatTime(d.data.year)}<p>
                    <!-- What does object Object mean https://stackoverflow.com/questions/8892465/what-does-object-object-mean-javascript --->
                    <!-- Had to use var subgroup name to get the selected part of bar chart https://www.d3-graph-gallery.com/graph/barplot_stacked_hover.html --->
                    <p>Type of Bias: ${d3.select(this.parentNode).datum().key}<p>
                    <!-- https://code-boxx.com/add-comma-to-numbers-javascript/ -->
                    <p>Number of Hate Crimes: ${JSON.stringify(d.data[d3.select(this.parentNode).datum().key]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<p>
                 </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });



        // ---- DRAW AXIS ----

        vis.xAxisGroup = vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg.select(".y-axis")
            .call(vis.yAxis);

        vis.svg.select("text.axis-title").remove();

        vis.svg.append("text")
            .attr("class", "axis-title genText")
            .attr("x", -5)
            .attr("y", -15)
            .attr("dy", ".1em")
            .style("text-anchor", "end")
            .text("Hate Crimes");


        d3.select("#anti-asian-area-caption").html("<p class='genText medText'>As we hope we've shown, one important means of stemming the tide " +
            "of hate crimes is pushing the narrative around politically volitile events <mark>away from racist, reactive, " +
            "and violent responses.</mark> As shown here, growing antagonism with China and COVID have had a noticable " +
            "impact on hate crimes against Asian Americans over the past few years (hover to learn more).</p>")
    }

}

function change() {
    let doc = document.getElementsByClassName("antiAsianHateBlock")[0];
    let color = ["rgba(119, 102, 222, 0.2)", "rgba(234, 82, 234, 0.2)", "rgba(151, 157, 172, 0.2)", "rgba(244, 63, 63, 0.2)", "rgba(242, 148, 35, 0.2)", "rgba(210, 215, 19, 0.2)", "rgba(103, 204, 82, 0.2)", "rgba(104, 188, 197, 0.2)", "rgba(95, 133, 194, 0.2)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);
