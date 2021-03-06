// http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922

$(document).ready(function() {
	var drag = d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);

	function dragstarted(d) {
		d3.event.sourceEvent.stopPropagation();
		d3.select(this).classed("dragging", true);
	}

	function dragged(d) {
		d3.select(this).attr("left", d.left = d3.event.left).attr("top", d.top = d3.event.top);
	}

	function dragended(d) {
		d3.select(this).classed("dragging", false);
	}

	// Define constants
	var color = d3.scale.category10();
	var domain = [0, 1, 2, 3, 4, 5, 6];
	var range = ["#FFE87C", "#e31a1c", "#1f78b4", "#b15928", "#33a02c", "#6a3d9a", "#ff7f00"];
	color.domain(domain);
	color.range(range);

	var category_to_number = {"All": 0, "Mexican": 1, "Chinese": 2, "Italian": 3, "American": 4, "Multiple": 5, "Other": 6};
	var category_to_name = {0: "All", 1: "Mexican", 2: "Chinese", 3: "Italian", 4: "American", 5: "Multiple", 6: "Other"};

	var active = d3.select(null);

	//Width and height of map
	var width = $(document).width() - 50;
	var window_height = $(document).height();
	// space from bottom for notes 1 and 2
	var note_margin1 = 5;
	// y-value for second line of note
	var note_margin2 = 20;
	// amount to shift map up
	var translate_up = 50;
	var map_height = window_height - translate_up - (2 * note_margin2);
	// amount to shift map left
	var translate_left = width / 25;
	// how much to magnify map of US
	var map_scale = Math.max(1000, width);
	// amount to shift cuisine type buttons to left
	var legend_margin = 10;
	// amount to shift data source buttons to the left
	var button_margin = 150;
	// amount to shift categories boxes down
	var categories_top = 20;
	// y at which to start drawing data source buttons
	var legend_top = 200;

	// colors for boxes on right
	var both_color_rgb = "#bcbddc";
	var academic_color_rgb = "#9e9ac8";
	var scraped_color_rgb = "#807dba";
	var current_color_rgb = "#54278f";

	var source_title = 'Academic and Scraped';
	var title = "Academic and Scraped Data";

	function make_business_text(name, city, state) {
		var text = '<span style="font-size: 120%; font-weight: bold">' + name + '</span>' +
		'<br/><span style="font-size: 110%; font-style: italic">' + city + ', ' + state + '</span>';
		return text;
	}

	function review_text(reviews_data, business_text, review_number) {
		if (reviews_data.length == 0) {
    		box_text = business_text + '<br/><br/>' + 'No reviews!';
    	} else {
			box_text = business_text + '<br/><br/>' + reviews_data[review_number]['text'] + '<br/><br/> - ' + reviews_data[review_number]['uname'];
    	}
    	return box_text;
	}

	function draw_business(business_data, circle_data, temporary_box) {
		// don't let box be drawn outside of window
		var x = Math.max(circle_data['pageX'] - 50, 100);
		var y = Math.max(circle_data['pageY'] - 50, 100);

		var business_text = make_business_text(business_data.name, business_data.city, business_data.state)
		var business_color = color(category_to_number[business_data.cat]);

		temporary_box
			.transition()
			.duration(200)
			.style("opacity", .9)
			.style("background-color", business_color)
			temporary_box.html(business_text)
			.style("left", x + "px")
			.style("top", y + "px");
	}

	function draw_reviews(reviews_data, business_data, circle_data, drag) {
		// review number to look for
		var review_number = 0;
		// absolute number, which could be negative
		var review_number_absolute = 0;
		
		// don't let box be drawn outside of window
		var x = Math.max(circle_data['pageX'] - 30, 100);
		var y = Math.max(circle_data['pageY'] - 50, 100);

		var business_text = make_business_text(business_data.name, business_data.city, business_data.state)
		var box_text = review_text(reviews_data, business_text, review_number);
		var business_color = color(category_to_number[business_data.cat]);

		var permanent_box = d3.select("body")
			.append("div")
			.attr("class", "tooltip")
			.style("min-width", "300px")
			.style("max-width", "380px")
			.style("opacity", 0)
			.attr("id", "permanent-box");

	    // box to click on right arrow and see next review
	    var right_box = d3.select("body")
	    	.append("div")
	    	.attr("class", "tooltip")
	    	.style("opacity", 0)
	    	.attr("id", "right-box")
	        .text('→')
			.style("cursor", "pointer");

	    var left_box = d3.select("body")
	    	.append("div")
	    	.attr("class", "tooltip")
	    	.style("opacity", 0)
	    	.attr("id", "left-box")
	        .text('←')
			.style("cursor", "pointer");

    	permanent_box
			.transition()
			.duration(50)
			.style("opacity", .9)
			.style("background-color", business_color)
			permanent_box.html(box_text)
			.style("left", x - 80 + "px")
			.style("top", y - 50 + "px")
			.on("dblclick", function() {
				this.remove();
				right_box.remove();
				left_box.remove();
			});

        // Merge this with lines above?  Will transitions still work?
        right_box
			.transition()
			   .duration(50)
			.style("opacity", 1)
			.style("background-color", business_color)
			right_box.style("left", x + permanent_box.node().getBoundingClientRect()['width'] - 108 + "px")
			.style("top", y - 47 + "px")
			.style("width", "20px")
			.on("click", function() {
			    review_number_absolute += 1;
			    review_number = Math.abs(review_number_absolute % reviews_data.length);
		       	box_text = review_text(reviews_data, business_text, review_number);
		       	permanent_box.html(box_text);
		       	right_box
		        	.style("left", x + permanent_box.node().getBoundingClientRect()['width'] - 108 + "px");
			});

        left_box
			.transition()
			   .duration(50)
			.style("opacity", 1)
			.style("background-color", business_color)
			left_box.style("left", x - 75 + "px")
			.style("top", y - 47 + "px")
			.style("width", "20px")
			.on("click", function() {
			    review_number_absolute -= 1;
			    review_number = Math.abs(review_number_absolute % reviews_data.length);
		       	box_text = review_text(reviews_data, business_text, review_number);
		       	permanent_box.html(box_text);
		       	right_box
		        	.style("left", x + permanent_box.node().getBoundingClientRect()['width'] - 108 + "px");
		    });

	    d3.select('body').call(d3.keybinding()
	       	.on('→', function() {
			    review_number_absolute += 1;
			    review_number = Math.abs(review_number_absolute % reviews_data.length);
		       	box_text = review_text(reviews_data, business_text, review_number);
		       	permanent_box.html(box_text);
		       	right_box.style("left", x + permanent_box.node().getBoundingClientRect()['width'] - 108 + "px");
			})
	    	.on('←', function() {
			    review_number_absolute -= 1;
			    review_number = Math.abs(review_number_absolute % reviews_data.length);
		       	box_text = review_text(reviews_data, business_text, review_number);
		       	permanent_box.html(box_text);
		       	right_box.style("left", x + permanent_box.node().getBoundingClientRect()['width'] - 108 + "px");
	    	})
	    	.on('escape', function() {
	    		permanent_box.remove();
	    		right_box.remove();
	    		left_box.remove();
	    	}));
	}

	// Shuffle an array: https://github.com/coolaj86/knuth-shuffle
	function shuffle(data) {
		var currentIndex = data.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = data[currentIndex];
			data[currentIndex] = data[randomIndex];
			data[randomIndex] = temporaryValue;
		}

		return data;
	}

	function add_data(map_data, business_data, projection) {
		// path generator that will convert GeoJSON to SVG paths and tell path generator to use albersUsa projection
		var path = d3.geo.path().projection(projection);

		var source = 'both'
		var category = "All";

		function reset() {
			active.classed("active", false);
			active = d3.select(null);

			svg.transition()
				.duration(750)
				.call(zoom.translate([0, 0]).scale(1).event);

			g.selectAll("circle").attr("r", 2.75);
		}

		function clicked(d) {
			if (active.node() === this) return reset();
			active.classed("active", false);
			active = d3.select(this).classed("active", true);

			var bounds = path.bounds(d),
				dx = bounds[1][0] - bounds[0][0],
				dy = bounds[1][1] - bounds[0][1],
				x = (bounds[0][0] + bounds[1][0]) / 2,
				y = (bounds[0][1] + bounds[1][1]) / 2,
				scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / window_height))),
				translate = [width / 2 - scale * x, window_height / 2 - scale * y];

			svg.transition()
				.duration(750)
				.call(zoom.translate(translate).scale(scale).event);

			g.selectAll("circle").attr("r", 1.5);
		}

		function zoomed() {
			g.style("stroke-width", 1.5 / d3.event.scale + "px");
			g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}

		d3.select("body").append("div")
			.attr("id", "title")
			.attr("align", "center")
			.style("font-size", "28px")
			.text(title);

		// Create SVG element and append map to the SVG
		var svg = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", window_height)
			.on("click", stopped, true);

		svg.append("rect")
		    .attr("class", "background")
		    .style("fill", "white")
		    .attr("width", width)
		    .attr("height", window_height)
		    .on("click", reset);

	    // d3.select("#title").on("click", reset);

		var g = svg.append("g");

		g.selectAll("path")
			.data(map_data.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.attr("class", "zip")
      		.on("click", clicked);

		var temporary_box = d3.select("body")
			.append("div")
			.attr("class", "tooltip")
			.attr("id", "temporary-box")
			.style("max-width", "250px")
			.style("min-width", "100px")
			.style("opacity", 0)
			.style("cursor", "pointer");

	    var zoom = d3.behavior.zoom()
			.translate([0, 0])
			.scale(1)
			.scaleExtent([1, 8])
			.on("zoom", zoomed);

		// shuffle the data with each update
		business_data = shuffle(business_data);

		g.selectAll("circle")
			.data(business_data)
			.enter()
			.append("circle")
			.style("cursor", "pointer")
			.attr("visible_tag", function(d) {
				d.category_correct = 1;
				d.source_correct = 1;
			})
			.attr("cx", function(d) {
				var location = projection([d.lon, d.lat]);
				return location[0];
			})
			.attr("cy", function(d) {
				var location = projection([d.lon, d.lat]);
				return location[1];
			})
			.attr("r", 2.75)
			.style("fill", function(d) { return color(category_to_number[d.cat]) })
			.style("opacity", 0.4)
			.attr("color", function(d) { return color(category_to_number[d.cat]); })

			.each(function (business_data, i) { $(this).hoverIntent(
				function(circle_data) {draw_business(business_data, circle_data, temporary_box);},
				function() {
					temporary_box.transition()
					.duration(200)
					.style("opacity", 0);
				})
			})

			.each(function (business_data, i) { $(this).click(
				function(circle_data) {get_reviews(business_data, circle_data);})
			});

			// To do: make function for drawing buttons
			// Buttons for type of restaurant - academic, scraped, or both
		 	g.append("rect")
		 		.attr("id", "both_rect")
				.attr("x", width - button_margin)
				.attr("y", legend_top)
		    	.attr("rx", 2)
				.attr("ry", 2)
		 		.attr("width", 123)
		    	.attr("height", 18)
		    	.style("fill", current_color_rgb)
				.style("cursor", "pointer")
				.on("click", function() {
					var source = 'both';
					update_source(source);
					d3.select('#both_text').style("fill", "white");
					d3.select('#academic_text').style("fill", "black");
					d3.select('#scraped_text').style("fill", "black");
					d3.select('#both_text').style("font-weight", "bold");
					d3.select('#academic_text').style("font-weight", "normal");
					d3.select('#scraped_text').style("font-weight", "normal");
					d3.select('#both_rect').style("fill", current_color_rgb);
					d3.select('#academic_rect').style("fill", academic_color_rgb);
					d3.select('#scraped_rect').style("fill", scraped_color_rgb);
				});

		    g.append("text")
		    	.attr("id", "both_text")
				.attr("x", width - button_margin + 3)
				.attr("y", legend_top + 13)
		    	.style("fill", "white")
		    	.style("font-size", "13px")
		    	.style("font-weight", "bold")
				.text("Academic + Scraped")
				.style("cursor", "pointer")
				.on("click", function() {
					var source = 'both';
					update_source(source);
					d3.select('#both_text').style("fill", "white");
					d3.select('#academic_text').style("fill", "black");
					d3.select('#scraped_text').style("fill", "black");
					d3.select('#both_text').style("font-weight", "bold");
					d3.select('#academic_text').style("font-weight", "normal");
					d3.select('#scraped_text').style("font-weight", "normal");
					d3.select('#both_rect').style("fill", current_color_rgb);
					d3.select('#academic_rect').style("fill", academic_color_rgb);
					d3.select('#scraped_rect').style("fill", scraped_color_rgb);
				});

			// Buttons for type of restaurant - academic, scraped, or both
		 	g.append("rect")
		 		.attr("id", "academic_rect")
				.attr("x", width - button_margin)
				.attr("y", legend_top + 24)
		    	.attr("rx", 2)
				.attr("ry", 2)
		 		.attr("width", 62)
		    	.attr("height", 18)
		    	.style("fill", academic_color_rgb)
				.style("cursor", "pointer")
				.on("click", function() {
					var source = 'Academic';
					update_source(source);
					d3.select('#both_text').style("fill", "black");
					d3.select('#academic_text').style("fill", "white");
					d3.select('#scraped_text').style("fill", "black");
					d3.select('#both_text').style("font-weight", "normal");
					d3.select('#academic_text').style("font-weight", "bold");
					d3.select('#scraped_text').style("font-weight", "normal");
					d3.select('#both_rect').style("fill", both_color_rgb);
					d3.select('#academic_rect').style("fill", current_color_rgb);
					d3.select('#scraped_rect').style("fill", scraped_color_rgb);
				});

		    g.append("text")
		    	.attr("id", "academic_text")
				.attr("x", width - button_margin + 3)
				.attr("y", legend_top + 37)
		    	.style("fill", "black")
		    	.style("font-size", "13px")
				.text("Academic")
				.style("cursor", "pointer")
				.on("click", function() {
					var source = 'Academic';
					update_source(source);
					d3.select('#both_text').style("fill", "black");
					d3.select('#academic_text').style("fill", "white");
					d3.select('#scraped_text').style("fill", "black");
					d3.select('#both_text').style("font-weight", "normal");
					d3.select('#academic_text').style("font-weight", "bold");
					d3.select('#scraped_text').style("font-weight", "normal");
					d3.select('#both_rect').style("fill", both_color_rgb);
					d3.select('#academic_rect').style("fill", current_color_rgb);
					d3.select('#scraped_rect').style("fill", scraped_color_rgb);
				});

			// Buttons for type of restaurant - academic, scraped, or both
		 	g.append("rect")
		 		.attr("id", "scraped_rect")
				.attr("x", width - button_margin)
				.attr("y", legend_top + 48)
		    	.attr("rx", 2)
				.attr("ry", 2)
		 		.attr("width", 50)
		    	.attr("height", 18)
		    	.style("fill", scraped_color_rgb)
				.style("cursor", "pointer")
				.on("click", function() {
					var source = 'Scraped';
					update_source(source);
					d3.select('#both_text').style("fill", "black");
					d3.select('#academic_text').style("fill", "black");
					d3.select('#scraped_text').style("fill", "white");
					d3.select('#both_text').style("font-weight", "normal");
					d3.select('#academic_text').style("font-weight", "normal");
					d3.select('#scraped_text').style("font-weight", "bold");
					d3.select('#both_rect').style("fill", both_color_rgb);
					d3.select('#academic_rect').style("fill", academic_color_rgb);
					d3.select('#scraped_rect').style("fill", current_color_rgb);
				});

		    g.append("text")
		    	.attr("id", "scraped_text")
				.attr("x", width - button_margin + 3)
				.attr("y", legend_top + 60)
		    	.style("fill", "black")
		    	.style("font-size", "13px")
				.text("Scraped")
				.style("cursor", "pointer")
				.on("click", function() {
					var source = 'Scraped';
					update_source(source);
					d3.select('#both_text').style("fill", "black");
					d3.select('#academic_text').style("fill", "black");
					d3.select('#scraped_text').style("fill", "white");
					d3.select('#both_text').style("font-weight", "normal");
					d3.select('#academic_text').style("font-weight", "normal");
					d3.select('#scraped_text').style("font-weight", "bold");
					d3.select('#both_rect').style("fill", both_color_rgb);
					d3.select('#academic_rect').style("fill", academic_color_rgb);
					d3.select('#scraped_rect').style("fill", current_color_rgb);
				});

			var legend_data = new Set(color.domain());
			legend_data = Array.from(legend_data);
			legend_data = legend_data.sort();

			var legend = g.selectAll(".legend")
				.data(legend_data)
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(-50," + i * 20 + ")"; });

			legend.append("rect")
				.attr("x", width - legend_margin)
				.attr("y", categories_top)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", color)
				.on("click", function(d) {
					var category = category_to_name[d];
					update_category(category);
				});

			legend.append("text")
				.attr("id", "category-text")
				.attr("x", width - legend_margin - 6)
				.attr("y", categories_top + 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) { return category_to_name[d]; })
				.style("font-size", "13px")
				.style("font-weight", function(d) {
					if (category_to_name[d] == "All") {
						return "bold";
					} else {
						return "normal";
					}
				})
				.on("click", function(d)  {
					var category = category_to_name[d];
					update_category(category);
				});

		g.append("text")
			.attr('id', 'note')
			.attr("x", width / 8)
			.attr("y", map_height + note_margin1)
			.attr("text-anchor", "left")  
			.style("font-size", "12px")
			.html("Hover over dots to see a business's information, and click to see its reviews.  Navigate reviews with the arrow keys, and hit \"escape\" or double click to remove a box.");

		g.append("text")
			.attr('id', 'note')
			.attr("x", width / 8)
			.attr("y", map_height + note_margin2)
			.attr("text-anchor", "left")  
			.style("font-size", "12px")
			.html('Data are from Yelp.com\'s <a style="fill: #1f77b4;" href="https://www.yelp.com/dataset_challenge" target="_blank">Academic Dataset</a> and Yelp.com. Code is adapted from <a style="fill: #1f77b4;" href="http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922" target="_blank">Michelle Chandra\'s code</a> and several D3 tutorials.');

		// title = source_title + " Data (" + business_data.length.toLocaleString('en') + ")";
		title = source_title + " Data";
	    d3.select("#title").text(title);

		svg.call(zoom).call(zoom.event);
        d3.select("#loading").remove();
	};

	function update_source(source) {
		d3.selectAll("circle")
			.style("opacity", function(d) {
				if (d.type != source & source != "both") {
					d.source_correct = 0;
					return 0;
				} else {
					d.source_correct = 1;
				}
				if (d.category_correct == 0) {
					return 0;
				}
				if (d.category_correct == 1) {
					return 0.9;
				}
			})
			.style("pointer-events", function(d) {
				if (d.type != source & source != "both") {
					d.source_correct = 0;
					return "none";
				} else {
					d.source_correct = 1;
				}
				if (d.category_correct == 0) {
					return "none";
				}
				if (d.category_correct == 1) {
					return "all";
				}
			});

		if (source == 'both') {
			source_title = 'Academic and Scraped';
		} else {
			source_title = source;
		}

		title = source_title + " Data";
	    d3.select("#title").text(title);
	}

	function update_category(category) {
		d3.selectAll("circle")
			.style("opacity", function(d) {
				if ((d.cat != category) & (category != "All")) {
					d.category_correct = 0;
					return 0;
				} else {
					d.category_correct = 1;
				}
				if (d.source_correct == 0) {
					return 0;
				}
				if (d.source_correct == 1) {
					return 0.9;
				}
			})
			.style("pointer-events", function(d) {
				if ((d.cat != category) & (category != "All")) {
					d.category_correct = 0;
					return "none";
				} else {
					d.category_correct = 1;
				}
				if (d.source_correct == 0) {
					return "none";
				}
				if (d.source_correct == 1) {
					return "all";
				}
			});

		d3.selectAll("#category-text")
			.style("font-weight", function(d) {
				if (category_to_name[d] == category) {
					return "bold";
				} else {
					return "normal";
				}
			});
	}

	// If the drag behavior prevents the default click,
	// also stop propagation so we don’t click-to-zoom.
	function stopped() {
		if (d3.event.defaultPrevented) d3.event.stopPropagation();
	}

	function get_reviews(business_data, circle_data) {
		$.getJSON($SCRIPT_ROOT + "/data",
			{dtype: 'reviews', business_id: business_data.business_id, business_type: business_data.type},
			function(data) {
				draw_reviews(data, business_data, circle_data);
			}
		);
	}

	function main() {
		var projection = d3.geo.albersUsa()
			// translate to center of screen, slightly to the left
			.translate([(width / 2) - translate_left, window_height / 2 - translate_up])
			// scale things down so see entire US
			.scale([map_scale]);

		// Get the map data and draw the map
		$.getJSON($SCRIPT_ROOT + "/data",
			{dtype: 'map'},
			function(map_data) {
				// Get the businesses data and add dots to map
				$.getJSON($SCRIPT_ROOT + "/data",
					{dtype: 'business'},
					function(business_data) {
				        // document.getElementById("loading").style.width = "0%";
						add_data(map_data, business_data, projection);
					}
				);
			}
		);
	}

	main();

});