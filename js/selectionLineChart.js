/* * * * * * * * * * * * * *
* Separate Line Chart    *
* * * * * * * * * * * * * */
/* * * * * * * * * * * * * *
*  selectionLineChart *
* * * * * * * * * * * * * */
class selectionLineChart {
    constructor(parentElement, hateCrimes) {


        this.parentElement = parentElement;
        this.hateCrimes = hateCrimes;
        this.displayData = [];

        // format time
        this.formatTime = d3.timeFormat("%Y");


        this.initVis()
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 50, right: 100, bottom: 100, left: 500};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        // Create new version of hate crime data to analyze
        vis.displayData = vis.hateCrimes

        // Scales and axes
        // Make x scale just a linear scale between numbers, as all our values are years as integers (TF: Simon)
        // ScaleBand is for bar charts
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            // https://stackoverflow.com/questions/16549868/d3-remove-comma-delimiters-for-thousands
            .tickFormat(d3.format("d"));

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");



        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'stackedTooltip')



        // Add title space
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'ssb-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');

        vis.wrangleData();
    }

    wrangleData() {

        let vis = this

        // list of race biases
        vis.raceBiases = [
            "Anti-Black or African American",
            "Anti-White",
            "Anti-Jewish",
            "Anti-Arab",
            "Anti-Asian",
            "Anti-Hispanic or Latino",
            "Anti-Other Race/Ethnicity/Ancestry",
            "Anti-Multiple Races, Group",
            "Anti-Native Hawaiian or Other Pacific Islander",
        ]

        // list of religion biases
        vis.religionBiases = [
            "Anti-Jewish",
            "Anti-Protestant",
            "Anti-Other Religion",
            "Anti-Islamic (Muslim)",
            "Anti-Catholic",
            "Anti-Multiple Religions, Group",
            "Anti-Atheism/Agnosticism",
            "Anti-Gender Non-Conforming",
            "Anti-Jehovah's Witness",
            "Anti-Mormon",
            "Anti-Buddhist",
            "Anti-Sikh",
            "Anti-Other Christian",
            "Anti-Hindu",
            "Anti-Eastern Orthodox (Russian, Greek, Other)",
        ]

        // list of gender and sexuality biases
        vis.lgbtqBiases = [
            "Anti-Gay (Male)",
            "Anti-Heterosexual",
            "Anti-Lesbian (Female)",
            "Anti-Lesbian, Gay, Bisexual, or Transgender (Mixed Group)",
            "Anti-Bisexual",
            "Anti-Gender Non-Conforming",
            "Anti-Female",
            "Anti-Transgender",
            "Anti-Male",
        ]

        // list of disability biases
        vis.disabilitiesBiases = [
            "Anti-Physical Disability",
            "Anti-Mental Disability",
            // "Unknown (offender's motivation not known)"
        ]

        vis.filtered = [];


        // // Filter the display data based on the type chosen
        // if (selectedCategory === "race") {
        //     // console.log("race bar chart");
        //     vis.filteredData = vis.displayData.filter(d => {
        //         // Checking if variable in in the array of race related biases
        //         // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
        //         if (vis.raceBiases.indexOf(d.BIAS_DESC) !== -1) {
        //             return d
        //         }
        //     })
        // } else if (selectedCategory=== "religion") {
        //     // console.log("religion bar chart");
        //     vis.filteredData = vis.displayData.filter(d => {
        //         // Checking if variable in in the array of race related biases
        //         // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
        //         if (vis.religionBiases.indexOf(d.BIAS_DESC) !== -1) {
        //             return d
        //         }
        //     })
        // }

        // Filter the display data based on the type chosen
        switch (selectedCategory) {
            case "race":
                vis.filteredData = vis.displayData.filter(d => {
                    // Checking if variable in in the array of race related biases
                    // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
                    if (vis.raceBiases.indexOf(d.BIAS_DESC) !== -1) {
                        return d
                    }
                })
                break;
            case "religion":
                // console.log("religion bar chart");
                vis.filteredData = vis.displayData.filter(d => {
                    // Checking if variable in in the array of race related biases
                    // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
                    if (vis.religionBiases.indexOf(d.BIAS_DESC) !== -1) {
                        return d
                    }
                })
                break;
            case "lgbtq":
                // console.log("religion bar chart");
                vis.filteredData = vis.displayData.filter(d => {
                    // Checking if variable in in the array of race related biases
                    // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
                    if (vis.lgbtqBiases.indexOf(d.BIAS_DESC) !== -1) {
                        return d
                    }
                })
                break;
            case "disability":
                // console.log("religion bar chart");
                vis.filteredData = vis.displayData.filter(d => {
                    // Checking if variable in in the array of race related biases
                    // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
                    if (vis.disabilitiesBiases.indexOf(d.BIAS_DESC) !== -1) {
                        return d
                    }
                })
                break;
        }



        // Group data by key variable (date) and count instances
        vis.dateGroup = Array.from(d3.group(vis.filteredData, d => d.INCIDENT_DATE), ([key, array]) => ({
            key: key,
            value: array.length
        }));

        // change from string to number
        vis.dateGroup.forEach(d => {
            d.value = +d.value;
        });


        // Group data by bias description and count instances
        vis.biasGroup = Array.from(d3.group(vis.filteredData, d => d.BIAS_DESC), ([key, array]) => ({
            key: key,
            value: array.length
        }));

        // Create array of all biases
        vis.bias = []

        vis.biasGroup.forEach((d, i) => {
            // push every bias to the array
            vis.bias.push(vis.biasGroup[i].key)
        });

        //Group data by key variables description and year  and count leaves
        // Group sort https://observablehq.com/@d3/d3-groupsort
        vis.biasYear = Array.from(d3.rollups(vis.filteredData, leaves => leaves.length, d => d.BIAS_DESC, d => vis.formatTime(d3.timeYear(d.INCIDENT_DATE))),
            ([key, value]) => ({key, value}))

        // Make a unique key because Jewish is in both race and religion; otherwise, the circle don't don't update in key (Simon TF)
        vis.biasYear = vis.biasYear.map(d => {
            d['keyAndCategory'] = d.key + '_' + selectedCategory;
            return d;
        })





        vis.updateVis()
    }

    updateVis(){
        let vis = this;


        // ---- Update Title ----
        let title = vis.svg.selectAll(".title")
            .data(vis.biasYear);

        // Enter
        title.enter()
            .append("text")
            .attr('class', 'title genText')
            .attr('id', 'ssb-title')
            .merge(title)
            // .text([selectedCategory])
            // Match the title to the selectedCategory
            .text(function(){
                switch (selectedCategory) {
                    // Switch expression https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
                    // https://www.cs171.org/Homework_instructions/week-11/lab/week-11_lab.html
                    case 'race': return "Race/Ethnicity Based Hate Crimes Reported per Year (1991-2020)";
                    case 'religion': return "Religion Based Hate Crimes Reported per Year (1991-2020)";
                    case 'lgbtq': return "Gender and Sexuality (LGBTQ+) Based Hate Crimes Reported per Year (1991-2020)";
                    case 'disability': return "Disability Based Hate Crimes Reported per Year (1991-2020)";
                }
            })
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');

        // Exit
        title.exit().remove();


        // Update scale domains
        // Update x domain to the year values
        vis.x.domain(d3.extent(vis.dateGroup.map(d => d.key.getFullYear())));

        // find max values of the years by iterating over the list of lists to set that values (Simon TF)
        let maxValues = vis.biasYear.map(d => d.value.map(dd => dd[1])).map(d => d3.max(d));
        // Update y domain based on max values
        vis.y.domain([0, d3.max(maxValues)]);

        // Color palettes
        const color = d3.scaleOrdinal()
            .domain(vis.bias)
            .range(["#F43F3F", "#F29423", "#D2D713", "#67CC52", "#68BCC5", "#5F85C2", "#7766DE", "#EA52EA", "#979DAC", "black", "#9F8170", "#702963", "#006B3C", "#E9967A", "#9E1B32"]);

        // ---- Update Lines ----
        vis.svg.selectAll(".line")
            .data(vis.biasYear)
            .join("path")
            .attr("class", "line") // Need to add this to make sure the graphs update
            .attr("fill", "none")
            .attr("id", function(d) {
                return ((d.key).split(/(\s+)/)[0]) + "_line";
            })
            .attr("stroke", function (d) {
                return color(d.key);
            })
            .attr("stroke-width", 2)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) {
                        return vis.x(parseInt(d[0]));
                    })
                    .y(function (d) {
                        return vis.y(d[1]);
                    })
                    (d.value)
            })



        // ---- Update and Add Circles ----
        // Adding circles https://stackoverflow.com/questions/17394006/adding-circles-to-multiline-graph-with-d3-js/17394289
        let circle = vis.svg.selectAll(".circle")
            // Use d.keyAndCategory to have unique keys to change the data
            // When you have data in an object, d3 needs a key function to determine when the data has changed so it knows how to redraw (Simon TF)
            .data(vis.biasYear, d => d.keyAndCategory)


        vis.categoryDict = {
            "race": this.raceBiases,
            "religion": this.religionBiases,
            "lgbtq": this.lgbtqBiases,
            "disability": this.disabilitiesBiases
        }

        let circleCount = 0;
        let tempClass;

        circle.enter()
            .append("g")
            .attr("class", "circle")
            .selectAll(".circle")
            .data(function(d, index){
                tempClass = vis.categoryDict[selectedCategory][index];
                return d.value})
            .enter()
            .append("circle")
            .attr("class", function(d) {
                let localIndex = circleCount;
                if(d[0] == 2020){
                    circleCount++;
                }
                    return (vis.categoryDict[selectedCategory][localIndex]).split(/(\s+)/)[0];
            })
            .attr("r", 4)
            .attr("cx", function(dd){return vis.x(dd[0])})
            .attr("cy", function(dd){return vis.y(dd[1])})
            // .attr("stroke", function (d) {
            //     return color(d.key);
            // })
            .on('mouseover', function(event, d){

            let localGroup =  d3.select(this).attr("class");

            highlightLabel(localGroup);

            d3.select(this)
                .attr('stroke-width', '1px')
                .attr('stroke', 'black')
                .attr("r", 4)

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
             <div style="border: thin solid grey; border-radius: 2px; background: lightgrey; padding: 5px">
                <p>Group: ${localGroup}<p>
                <p>Year: ${d[0]}<p>
                <p>Hate Crimes: ${d[1].toLocaleString()}<p>
             </div>`);
            })
            .on('mouseout', function(event, d){

            clearLabels();

            d3.select(this)
                .attr("stroke", "black")
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
            });

        circle.exit().remove();







        // ---- DRAW AXIS ----

        vis.xAxisGroup = vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .attr("class", "genText")
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg.select(".y-axis")
            .attr("class", "genText")
            .call(vis.yAxis);

        vis.svg.select("text.axis-title").remove();

        vis.svg.append("text")
            .attr("class", "axis-title genText")
            .attr("x", -5)
            .attr("y", -15)
            .attr("dy", ".1em")
            .style("text-anchor", "end")
            .text("Hate Crimes");


        // ---- DRAW LEGEND ----


        // https://www.d3-graph-gallery.com/graph/custom_legend.html
        // Add one dot in the legend for each name.
        let mydots = vis.svg.selectAll(".mydots")
            .data(vis.biasYear, d=>d.keyAndCategory) // need to have unique key to know what remains constant

        mydots.enter()
            .append("circle")
            .attr("class", "mydots")
            .attr("cx", -vis.margin.left + 10)
            .attr("cy", function(d,i){ return i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return color(d.key)})

        mydots.exit().remove();


        // Add one text in the legend for each name
        let mylabels = vis.svg.selectAll(".mylabels")
            .data(vis.biasYear, d=>d.keyAndCategory)

        mylabels.enter()
            .append("text")
            .attr("class", "mylabels")
            .attr("id", function(d){return d.key.slice(0, 9) + "_label";})
            .attr("x", -vis.margin.left + 35)
            .attr("y", function(d,i){ return i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color(d.key)})
            .style("font-family", "Book Antiqua")
            //.style("text-decoration", "underline overline")
            .text(function(d){
                return d.key
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", function(event, d) {
                let entrant = (d.key).split(/(\s+)/)[0];

                d3.select(this)
                    .style("text-decoration", "underline overline");
                d3.selectAll("circle")
                    .attr("opacity", "0");
                d3.selectAll("." + entrant)
                    .attr("opacity", "1");

                d3.selectAll("path")
                    .attr("opacity", "0");

                d3.select("#" + entrant + "_line")
                    .attr("opacity", "1");

            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("text-decoration", "none");
                d3.selectAll("circle")
                    .attr("opacity", "1");

                d3.selectAll("path")
                    .attr("opacity", "1");
            })

        mylabels.exit().remove();

        d3.select("#line-area-caption").html("<h5 class=\"genText medText\">A sharp rise in the number of hate " +
            "crimes perpetrated against <mark>Asian Americans, Hispanics and Latinos, and White Americans</mark> also contributed " +
            "to 2020's record highs. Sharp rises in the number of hate crimes against certain communities are often" +
            " due to politically charged events negatively associated with said communities.<p class='genText medText'>" +
            "<ol class='medText'><li>Hover over each dot to get more info.</li><li>Hover over each entry in the key to just show the " +
            "line in question.</li><li>Use the selector on top to change the type of discrimination being shown.</li></ol></p></h5>");





    }


}

function highlightLabel(group) {
    d3.select("#" + group.slice(0, 9) + "_label")
        .style("text-decoration", "underline overline");
}

function clearLabels() {
    d3.selectAll(".mylabels")
        .style("text-decoration", "none");
}

function change() {
    let doc = document.getElementsByClassName("lineChartBlock")[0];
    let color = ["rgba(104, 188, 197, 0.05)", "rgba(95, 133, 194, 0.05)", "rgba(119, 102, 222, 0.05)", "rgba(234, 82, 234, 0.05)", "rgba(151, 157, 172, 0.05)", "rgba(244, 63, 63, 0.05)", "rgba(242, 148, 35, 0.05)", "rgba(210, 215, 19, 0.05)", "rgba(103, 204, 82, 0.05)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);
