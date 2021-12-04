let colorCounter = 0;

class TextViz {

    constructor() {

    }


    initIntroText() {
        let vis = this;

        vis.highlightText()

    }

    highlightText() {
        d3.select("#introText").html("<h1 class=\"bigText genText\" id=\"introText\"><mark>Waves of Hate" +
            "</mark></h1><h3 class=\"genText labelText\">Raj Gambhir, Priyanka Thapa, Nikhil Dharmaraj</h3><h6 " +
            "class=\"genText labelText\" style='font-style: italic'><mark>Use the orange dots below to advance. " +
            "Click on the second dot to continue.</mark></h6><h6 class=\"genText labelText\">" +
            "Content Warning: Graphic Images, Upsetting Themes</h6><h6 class=\"genText labelText\">Statistics from the Federal Bureau of Investigation</h6>")

    }


}

function change() {
    let doc = document.getElementsByClassName("introTextBlock")[0];
    let color = ["rgba(244, 63, 63, 0.2)", "rgba(242, 148, 35, 0.2)", "rgba(210, 215, 19, 0.2)", "rgba(103, 204, 82, 0.2)", "rgba(104, 188, 197, 0.2)", "rgba(95, 133, 194, 0.2)", "rgba(119, 102, 222, 0.2)", "rgba(234, 82, 234, 0.2)", "rgba(151, 157, 172, 0.2)"];
    doc.style.backgroundColor = color[colorCounter];
    colorCounter = (colorCounter + 1) % color.length;
}
setInterval(change, 2500);