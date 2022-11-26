    // The legend part 
    var ColorsArray = ["#00BFFF", "#00A7FE", "#008FFE", "#0001FD", "#2D00FD", "#5800BD", "#8A00FC", "#D000FC", "#FB00E1", "#FBOOE2", "#FA0083", "#FA006C", "#FA0054", "#FA003D", "#FA0026", "#FA000F", "#F90800"]
    var colorList = {
        1: ColorsArray[0],
        2: ColorsArray[1],
        3: ColorsArray[2],
        4: ColorsArray[3],
        5: ColorsArray[4],
        6: ColorsArray[5],
        7: ColorsArray[6],
        8: ColorsArray[7],
    };
    var colorList1 = {
        9: ColorsArray[8],
        10: "#FB00E2",
        11: ColorsArray[10],
        12: ColorsArray[11],
        13: ColorsArray[12],
        14: ColorsArray[13],
        14: ColorsArray[14],
        15: ColorsArray[15],
        16: ColorsArray[16],
    };

    colorize = function(colorList) {
        var container = document.getElementById('container');

        for (var key in colorList) {
            var boxContainer = document.createElement("DIV");
            var box = document.createElement("DIV");
            var label = document.createElement("SPAN");

            label.innerHTML = " " + key;
            box.className = "box";
            box.style.backgroundColor = colorList[key];

            boxContainer.appendChild(box);
            boxContainer.appendChild(label);

            container.appendChild(boxContainer);

        }
    }
    colorize1 = function(colorList1) {
        var container1 = document.getElementById('container1');

        for (var key in colorList1) {
            var boxContainer = document.createElement("DIV");
            var box = document.createElement("DIV");
            var label = document.createElement("SPAN");

            label.innerHTML = " " + key;
            box.className = "box";
            box.style.backgroundColor = colorList1[key];

            boxContainer.appendChild(box);
            boxContainer.appendChild(label);

            container1.appendChild(boxContainer);

        }
    }
    colorize(colorList);
    colorize1(colorList1);
    // Tooltip to display episode rating graph on hover
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "black")
        .style("opacity", 0.6)
        .attr("id", "graphVisualize");

    // Tooltip to display hovered text    
    var tooltip1 = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "black")
        .style("color", "white")
        .style("opacity", 0.5);

    console.clear()

    // width and height of svg
    var w = 1800,
        h = 750;

    var radius = 25;
    var centerScale = d3.scalePoint().padding(1).range([100, w - 300]);
    var forceStrength = 0.05;
    var ColorsArray = ["#00BFFF", "#00A7FE", "#008FFE", "#0001FD", "#2D00FD", "#5800BD", "#8A00FC", "#D000FC", "#FB00E1", "#FBOOE2", "#FA0083", "#FA006C", "#FA0054", "#FA003D", "#FA0026", "#FA000F", "#F90800"]

    // appending svg to body
    var svg = d3.select("body").append("svg")
        .attr("width", w)
        .attr("height", h)

    // Force simulations
    var simulation = d3.forceSimulation()
        .force("collide", d3.forceCollide(function(d) {
            return d.r + 8
        }).iterations(16))
        .force("charge", d3.forceManyBody())
        .force("y", d3.forceY().y(h / 2))
        .force("x", d3.forceX().x(w / 2))

    // importing data
    d3.csv("./WebSeriesData.csv", function(rawdata) {
        var NoOfSeasons = []
        var diff = new Set();
        for (i = 0; i < rawdata.length; i = j) {
            var TempSet = new Set();
            for (j = i; j < rawdata.length; j++) {
                if (rawdata[j].primaryTitle != rawdata[i].primaryTitle) {
                    break;
                }
                TempSet.add(rawdata[j].seasonNumber)
            }
            NoOfSeasons.push({
                SeriesName: rawdata[i].primaryTitle,
                Seasons: TempSet.size
            })
            diff.add(TempSet.size)
        }

        // Collecting the series names and its attributes
        var seriesTitle = [...new Set(rawdata.map(function(d) {
            return d.primaryTitle
        }))]
        var data = seriesTitle.map(function(d) {
            return rawdata.find(function(e) {
                return e.primaryTitle === d
            })
        });
        data.forEach(function(d) {
            d.r = radius;
            d.x = w / 2;
            d.y = h / 2;
        })

        // selecting the circles(basically the rings in our visualization)
        var circles = svg.selectAll("circle")
            .data(data, function(d) {
                return d.ID;
            });

        // appending the circles and assigning its attributes   
        var circlesEnter = circles.enter().append("circle")
            .attr("r", function(d, i) {
                return ((d.averageRating % 6) * 13); // radius of the circle determines the avg rating of the series
            })
            .attr("cx", function(d, i) {
                return 175 + 25 * i + 2 * i ** 2;
            })
            .attr("cy", function(d, i) {
                return 250;
            })

        .style("fill", "none")
            .style("stroke", function(d, i) {
                const a = [...diff.keys()];
                k = 0;
                for (k = 0; k < a.length; k++) {
                    if (a[k] == d.numSeasons) { // the color of the ring determines the # of seasons a series has as per legend. 
                        break;
                    }
                }
                return ColorsArray[k];
            })
            .style("stroke-width", function(d, i) {
                return (1 / d.showVariance) * 0.6; // the rings border thickness detemines the consistency of the ratings of episodes.
            }) // Higher the consistency => higher the thickness
            .style("pointer-events", "all")
            .attr("data-html", "true")

        .call(d3.drag() // calling the drag functions implemented.
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        circles = circles.merge(circlesEnter) // merging the rings together

        function ticked() {
            circles
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                })

            .on("mouseover", function(d) {

                    tooltip1.html(d.primaryTitle + "<br>" + d.averageRating + "<br>" + d.genres); // text display on hovering the rings

                    curr_series = d.parentTconst //id of the current series

                    // graph visualization on hovering
                    var margin = {
                            top: 10,
                            right: 10,
                            bottom: 10,
                            left: 20
                        },
                        width = 300 - margin.left - margin.right, // width and height of the svg block which holds the graph
                        height = 150 - margin.top - margin.bottom;

                    // append the svg object to the tooltip id which holds the graph
                    var svg1 = d3.select("#graphVisualize")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right) // assigning width and height of svg
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");

                    //Read the data
                    d3.csv("WebSeriesData.csv",

                        function(dataRaw) {

                            data = dataRaw.filter(d => d.parentTconst === curr_series) // filtering the data to get the data of hovered series.

                            // Adding X axis
                            var xTool = d3.scaleBand().range([0, width])
                                .domain(data.map(function(d) {
                                    return d.tconst;
                                }))
                            svg1.append("g")
                                .attr("class", "axisTrend")
                                .attr("transform", "translate(0," + height + ")")
                                .call(d3.axisBottom(xTool).tickFormat(""));

                            // Adding Y axis
                            var yTool = d3.scaleLinear()
                                .domain([0, d3.max(data, function(d) {
                                    return +d.averageRating;
                                })])
                                .range([height, 0]);
                            svg1.append("g")
                                .attr("class", "axisTrend")
                                .call(d3.axisLeft(yTool));

                            // Adding the path (i.e line graph)
                            svg1.append("path")
                                .datum(data)
                                .attr("fill", "none")
                                .attr("stroke", "steelblue")
                                .attr("stroke-width", 1.5)
                                .attr("d", d3.line()
                                    .x(function(d) {
                                        return xTool(d.tconst)
                                    })
                                    .y(function(d) {
                                        return yTool(d.averageRating) // assigning the episode ratings of a series
                                    })
                                )
                        }
                    )
                    tooltip1.style("visibility", "visible"); // making the tooltips visible since mouse is hovered
                    return tooltip.style("visibility", "visible");
                })
                .on("mousemove", function() {
                    tooltip1.style("top", (d3.event.pageY - 70) + "px").style("left", (d3.event.pageX + 55) + "px"); // updating the graph and textbox position as mouse moves
                    return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    d3.selectAll("#graphVisualize > *").remove(); //removing the already existed graph on the tooltip so that it doesnt interfere in next hovered graph
                    tooltip.style("visibility", "hidden"); // hiding the textbox and graph
                    return tooltip1.style("visibility", "hidden");
                })

        }

        simulation // assigning the simulation
            .nodes(data)
            .on("tick", ticked);

        // functions which are called on drag (implemented using d3)
        function dragstarted(d, i) {
            if (!d3.event.active) simulation.alpha(1).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d, i) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d, i) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            var me = d3.select(this)
            me.classed("selected", !me.classed("selected"))

            d3.selectAll("circle")
                .style("fill", "none")

            d3.selectAll("circle.selected")
                .style("fill", "none")
        }

        // Onclicking other buttons we see that the rings get transitioned
        function splitRings(byVar) {
            // assigning the data depending on the button clicked
            if (byVar == "showVotes") {
                data1 = data.sort(function(a, b) {
                    return d3['ascending'](a.showVotes, b.showVotes);
                })
            } else if (byVar == "averageRating") {
                data1 = data.sort(function(a, b) {
                    return d3['ascending'](a.averageRating, b.averageRating);
                })
            } else if (byVar == "numSeasons") {
                data1 = data;
                console.log(data1);
            }

            // upadting the domain with the values based on the button click    
            centerScale.domain(data1.map(function(d) {
                return d[byVar];
            }));

            // if button clicked is "All", then no titles to display
            if (byVar == "all") {
                hideTitles()
            } else {
                showTitles(byVar, centerScale); // titles get displayed if any other button is clicked
            }

            // Reset the 'x' force to draw the rings to their centers
            simulation.force('x', d3.forceX().strength(forceStrength).x(function(d) {
                return centerScale(d[byVar]);
            }));

            // Reset the alpha value and restart the simulation
            simulation.alpha(2).restart();
        }

        // function to hide titles called when "All" button is clicked.
        function hideTitles() {
            svg.selectAll('.title').remove();
        }

        // function to showtitles called when buttons other than "All" is clicked.
        function showTitles(byVar, scale) {
            count = 0
                // setting the domain of titles
            var titles = svg.selectAll('.title')
                .data(scale.domain());

            // appending the text with assigning attributes to it        
            titles.enter().append('text')
                .attr('class', 'title')
                .merge(titles)
                .attr('x', function(d) {
                    return scale(d);
                })
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .text(function(d) {
                    count = count + 1
                    if (count % 4 == 0) // Its clumsy to display the titles for all unique values of attributes so displaying after certain period.
                        return d;
                    return;
                });

            titles.exit().remove()
        }

        function setupButtons() {
            d3.selectAll('.button')
                .on('click', function() {

                    // Remove active class from all buttons
                    d3.selectAll('.button').classed('active', false);
                    // Find the button just clicked
                    var button = d3.select(this);

                    // Set it as the active button
                    button.classed('active', true);

                    // Get the id of the button
                    var buttonId = button.attr('id');

                    console.log(buttonId)
                        // Toggle the rings chart based on
                        // the currently clicked button.
                    splitRings(buttonId);
                });
        }
        setupButtons()
    })