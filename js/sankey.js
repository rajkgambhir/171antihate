
class sankey {

    constructor(parentElement,data) {

        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];


        // format time
        this.formatTime = d3.timeFormat("%Y");

        this.initVis()
    }
    initVis(){
        let vis = this;

        vis.margin = {top: 50, right: 50, bottom: 50, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width  - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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

        vis.filteredData = vis.data.filter(d => {
            // Checking if variable in in the array of race related biases
            // https://stackoverflow.com/questions/33583789/checking-for-a-variable-match-with-an-array-in-javascript
            if (vis.raceBiases.indexOf(d.BIAS_DESC) !== -1) {
                return d
            }
        })


        vis.wrangleData();
    }
    wrangleData(){
        let vis = this;


        vis.offenderVictim = Array.from(d3.rollups(vis.filteredData, leaves => leaves.length, d => d.OFFENDER_RACE, d => d.BIAS_DESC),
            ([key, value]) => ({key, value}))

        vis.objectData = []

        vis.offenderVictim.forEach(d => {
            // console.log("d in biasbreakdownyear", d)
            let obj = {
                //Creating an object with an element called year and every element found in d.value map
                OffenderRace: d.key,
                // Every property within the d.value made into an object
                ...Object.fromEntries(d.value)
            }
            vis.raceBiases.forEach(f=>{
                obj[f] = obj[f] || 0;
            })
            // obj['Anti-American Indian or Alaska Native'] = obj['Anti-American Indian or Alaska Native'] || 0;

            vis.objectData.push(obj)
        });

        // Convert object into array https://www.javascripttutorial.net/object/convert-an-object-to-an-array-in-javascript/
        vis.entries = Object.values(vis.objectData);


       // DEAD CODE IS USEFEUL IN THE FUTURE
        // vis.entries.forEach(d=>{
       //     console.log("d in vis.test", d)
       //     Object.entries(d)
       //     vis.arraygroup.push(d)
       // })
       //
       //  for (let i = 0; i < 9; i++) {
       //      // if (window.UndefinedVariable) {
       //      //     Object.assign(window.UndefinedVariable, {})
       //      // }
       //      vis.testing.push(Object.entries(vis.entries[i]))
       //  }
       //  console.log("vis.testing", vis.testing)

        // Create array of all offenders races
        vis.offenders = []

        vis.entries.forEach((d,i) => {
            // push every bias to the array
            vis.offenders.push(vis.entries[i].OffenderRace)
        });

        // Create an array
        // The reason it wasn't working before was because there were only 8 objects in teh array so i<8 (as i = 8 would be nine objects) so I got the error message
        vis.totalentries = []
        for (let i = 0; i < 8; i++){
            vis.totalentries.push(Object.entries(vis.entries[i]))
            vis.totalentries[i].forEach(d=>{
                d.unshift(vis.offenders[i])
            })
            vis.totalentries[i].shift()
        }



        // flatten array because right now total entries is a nested array/an array of arrays (an array of 8 arrays of 9 arrrays)
        vis.flat = vis.totalentries.flat()

        // DEAD CODE IS USEFEUL IN THE FUTURE
        // vis.entries0 = Object.entries(vis.entries[0])
        //
        // console.log("vis.entries0", vis.entries0)
        //
        // vis.entries0.forEach(d=>{
        //     // console.log("di in entries", d)
        //     // d.unshift("White")
        //     d.unshift(vis.offenders[0])
        // })
        //
        // vis.entries0.shift()
        //
        // console.log("vis.entries0", vis.entries0)
        //
        //
        // vis.entries1 = Object.entries(vis.entries[1])
        // vis.entries1.forEach(d=>{
        //     d.unshift(vis.offenders[1])
        // })
        // vis.entries1.shift()
        // console.log("vis.entries1", vis.entries1)
        //
        // vis.entries2 = Object.entries(vis.entries[2])
        // vis.entries2.forEach(d=>{
        //     d.unshift(vis.offenders[2])
        // })
        // vis.entries2.shift()
        // console.log("vis.entries2", vis.entries2)


        // DEAD CODE IS USEFEUL IN THE FUTURE
        // vis.test =[]
        //
        // // Delete first item in array https://www.w3schools.com/jsref/jsref_shift.asp
        // vis.entries.forEach((d,i)=> {
        //     console.log(d)
        //     d.shift();
        // })
        //
        // console.log("vis.entries", vis.entries)
        //
        // vis.whiteOffender = []
        //
        // vis.whiteOffender.push((vis.offenderVictim[0]))
        //
        // console.log("vis.whiteOffender", vis.whiteOffender)
        //
        // console.log("vis.whiteOffender", vis.whiteOffender[0].value)
        //
        // vis.whiteOffender.forEach((d)=>{
        //     for (let i = 0; i < vis.whiteOffender.length; i++) {
        //         console.log("d white", d.value[i])
        //     }
        // })



        vis.updateVis()
    }
    updateVis(){
        let vis = this;

        // https://developers.google.com/chart/interactive/docs/gallery/sankey
        google.charts.load('current', {'packages':['sankey']});
        google.charts.setOnLoadCallback(drawChart);


        function drawChart() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'From');
            data.addColumn('string', 'To');
            data.addColumn('number', 'Number of Hate Crimes');
            data.addRows(vis.flat);

            // Sets chart options.
            var options = {
                width: vis.width,
                sankey: {
                    node: {
                        label: {
                            fontName: "Book Antiqua",
                            fontSize: 14
                        }
                    }
                }
            };

            // Instantiates and draws our chart, passing in some options.
            var chart = new google.visualization.Sankey(document.getElementById("sankeyDiv"));
            chart.draw(data, options);

            d3.select("#sankey-area-caption").html("<p class='genText bigText'>Black people have long been victims of hate crimes " +
                "in this country. This graph shows perpetrators of hate crimes on the left side, and corresponding victims " +
                "of hate crimes on the right. Hover over to explore.</p>")


        }
    }
}

function change() {
    let doc = document.getElementsByClassName("sankeyContainerBlock")[0];
    let color = ["rgba(103, 204, 82, 0.2)", "rgba(104, 188, 197, 0.2)", "rgba(95, 133, 194, 0.2)", "rgba(119, 102, 222, 0.2)", "rgba(234, 82, 234, 0.2)", "rgba(151, 157, 172, 0.2)", "rgba(244, 63, 63, 0.2)", "rgba(242, 148, 35, 0.2)", "rgba(210, 215, 19, 0.2)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);
