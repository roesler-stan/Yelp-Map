// http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922

// Issues
// after successfully zooming to correct state once, it then always zooms to center
// temporary box isn't over dot when you're within zoom

$(document).ready(function() {
	var translate_amount = [0, 0];
	var scale_amount = 0;

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
	var both_color = current_color_rgb;
	var academic_color = academic_color_rgb;
	var scraped_color = scraped_color_rgb;
	var both_bold = "bold";
	var academic_bold = "normal";
	var scraped_bold = "normal";
	var both_text_color = "white";
	var academic_text_color = "black";
	var scraped_text_color = "black";

	var source_title = 'Academic and Scraped';
	var title = "Academic and Scraped Data - All Restaurants"

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

	function draw_reviews(reviews_data, business_data, projection) {
		// review number to look for
		var review_number = 0;
		// absolute number, which could be negative
		var review_number_absolute = 0;
		
		var location = projection([business_data.lon, business_data.lat]);
		var x = location[0];
		var y = location[1];

		var business_text = make_business_text(business_data.name, business_data.city, business_data.state)
		var box_text = review_text(reviews_data, business_text, review_number);
		var business_color = color(category_to_number[business_data.cat]);

		var permanent_box = d3.select("body")
			.append("div")
			.attr("class", "tooltip")
			.style("min-width", "200px")
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

	// draw a temporary text box for the given point
	function draw_temporary(d, temporary_box, projection) {
		var circle_data = d.target.__data__;
		var business_id = circle_data['business_id'];
		var business_cat = circle_data['cat'];

		// to do: use mouse location

		// Get the location from the point itself
		var lat = circle_data['lat'];
		var lon = circle_data['lon'];
		var location = projection([lon, lat]);
		// var x = location[0] - 20;
		// var y = location[1] + 5;

		// To do: calculate x and y with translate amount and scale (and pass parameters, not global vars)

		var x = d.target['cx']['animVal']['value'] - 30 + translate_amount[0];
		var y = d.target['cy']['animVal']['value'] + 5 + translate_amount[1];
		console.log(x);
		console.log(y);

		var business_text = '<span style="font-size: 120%; font-weight: bold">' + circle_data['name'] + '</span>' +
		'<br/><span style="font-size: 110%; font-style: italic">' + circle_data['city'] + ', ' + circle_data['state'] + '</span>';
    	
    	temporary_box
	    	.transition()
      	   .duration(200)
           .style("opacity", .9)
			.style("background-color", color(category_to_number[business_cat]))
           temporary_box.html(business_text)
           .style("left", x + "px")     
           .style("top", y + "px");
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
		// path generator that will convert GeoJSON to SVG paths
		// and tell path generator to use albersUsa projection
		var path = d3.geo.path().projection(projection);

		var source = 'both'
		var category = "All";

		function reset() {
			active.classed("active", false);
			active = d3.select(null);

			svg.transition()
				.duration(750)
				.call(zoom.translate([0, 0]).scale(1).event);
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
		}

		function zoomed() {
			g.style("stroke-width", 1.5 / d3.event.scale + "px");
			g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			translate_amount = d3.event.translate;
			scale_amount = d3.event.scale;
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

	    d3.select("#title").on("click", reset);

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

	    var zoom = d3.behavior.zoom()
			.translate([0, 0])
			.scale(1)
			.scaleExtent([1, 8])
			.on("zoom", zoomed);

		// make a single div for temporary mouse-over boxes
		var temporary_box = d3.select("body")
		    .append("div")
			.attr("class", "tooltip")
			.attr("id", "temporary-box")
			.style("max-width", "250px")
			.style("min-width", "100px")
			.style("opacity", 0)
			.style("cursor", "pointer");

		// shuffle the data with each update
		//business_data = shuffle(business_data);

		g.selectAll("circle")
			.data(business_data)
			.enter()
			.append("circle")
			.style("cursor", "pointer")
			.attr("cx", function(d) {
				var location = projection([d.lon, d.lat]);
				if (location == null) {
					return 0;
				}
				return location[0];
			})
			.attr("cy", function(d) {
				var location = projection([d.lon, d.lat]);
				if (location == null) {
					return 0;
				}
				return location[1];
			})
			.attr("r", 3)
			//function(d) {return 5 + d.count / 120;//})
				.style("fill", function(d) { return color(category_to_number[d.cat]) })	
				.style("opacity", function(d) {
					var location = projection([d.lon, d.lat]);
					if (location == null) {
						return 0
					} else {
						return 0.4;
					}
				})
			.attr("color", function(d) { return color(category_to_number[d.cat]); })

			// If a user hovers over a dot, draw a temporary text box
			//.each(function (d, i) { $(this).hoverIntent(draw_temporary, remove_temporary) })
			.each(function (d, i) { $(this).hoverIntent(
				function(d) {
					// var x = this['cx']['animVal']['value'];
					// var y = this['cy']['animVal']['value'];
					draw_temporary(d, temporary_box, projection);
				},
				function() {
					temporary_box.transition()
					.duration(200)
					.style("opacity", 0);
				})
			})

			// Get a review for that restaurant and draw a permanent box for the business
			.on("click", function(d) {get_reviews(d, projection);});

			// Buttons for type of restaurant - academic, scraped, or both
		 	g.append("rect")
		 		.attr("id", "both")
				.attr("x", width - button_margin)
				.attr("y", legend_top)
		    	.attr("rx", 2)
				.attr("ry", 2)
		 		.attr("width", 123)
		    	.attr("height", 18)
		    	.style("fill", both_color)
				.style("cursor", "pointer")
				.on("click", function() {
					both_color = current_color_rgb;
					academic_color = academic_color_rgb;
					scraped_color = scraped_color_rgb;
					scraped_bold = "normal";
					academic_bold = "normal";
					both_bold = "bold";
					scraped_text_color = "black";
					academic_text_color = "black";
					both_text_color = "white";
					source = 'both';
					update_data(category, source);
				});

		    g.append("text")
				.attr("x", width - button_margin + 3)
				.attr("y", legend_top + 13)
		    	.style("fill", both_text_color)
		    	.style("font-size", "13px")
				.text("Academic + Scraped")
		    	.style("font-weight", both_bold)
				.style("cursor", "pointer")
				.on("click", function() {
					both_color = current_color_rgb;
					academic_color = academic_color_rgb;
					scraped_color = scraped_color_rgb;
					scraped_bold = "normal";
					academic_bold = "normal";
					both_bold = "bold";
					scraped_text_color = "black";
					academic_text_color = "black";
					both_text_color = "white";
					source = 'both';
					update_data(category, source);
				});

			// Buttons for type of restaurant - academic, scraped, or both
		 	g.append("rect")
		 		.attr("id", "academic")
				.attr("x", width - button_margin)
				.attr("y", legend_top + 24)
		    	.attr("rx", 2)
				.attr("ry", 2)
		 		.attr("width", 62)
		    	.attr("height", 18)
		    	.style("fill", academic_color)
				.style("cursor", "pointer")
				.on("click", function() {
					both_color = both_color_rgb;
					academic_color = current_color_rgb;
					scraped_color = scraped_color_rgb;
					scraped_bold = "normal";
					academic_bold = "bold";
					both_bold = "normal";
					scraped_text_color = "black";
					academic_text_color = "white";
					both_text_color = "black";
					source = 'Academic';
					update_data(category, source);
				});

		    g.append("text")
				.attr("x", width - button_margin + 3)
				.attr("y", legend_top + 37)
		    	.style("fill", academic_text_color)
		    	.style("font-weight", academic_bold)
		    	.style("font-size", "13px")
				.text("Academic")
				.style("cursor", "pointer")
				.on("click", function() {
					both_color = both_color_rgb;
					academic_color = current_color_rgb;
					scraped_color = scraped_color_rgb;
					scraped_bold = "normal";
					academic_bold = "bold";
					both_bold = "normal";
					scraped_text_color = "black";
					academic_text_color = "white";
					both_text_color = "black";
					source = 'Academic';
					update_data(category, source);
				});

			// Buttons for type of restaurant - academic, scraped, or both
		 	g.append("rect")
		 		.attr("id", "scraped")
				.attr("x", width - button_margin)
				.attr("y", legend_top + 48)
		    	.attr("rx", 2)
				.attr("ry", 2)
		 		.attr("width", 50)
		    	.attr("height", 18)
		    	.style("fill", scraped_color)
				.style("cursor", "pointer")
				.on("click", function() {
					both_color = both_color_rgb;
					academic_color = academic_color_rgb;
					scraped_color = current_color_rgb;
					scraped_bold = "bold";
					academic_bold = "normal";
					both_bold = "normal";
					scraped_text_color = "white";
					academic_text_color = "black";
					both_text_color = "black";
					source = 'Scraped';
					update_data(category, source);
				});

		    g.append("text")
				.attr("x", width - button_margin + 3)
				.attr("y", legend_top + 60)
		    	.style("fill", scraped_text_color)
		    	.style("font-size", "13px")
		    	.style("font-weight", scraped_bold)
				.text("Scraped")
				.style("cursor", "pointer")
				.on("click", function() {
					both_color = both_color_rgb;
					academic_color = academic_color_rgb;
					scraped_color = current_color_rgb;
					scraped_bold = "bold";
					academic_bold = "normal";
					both_bold = "normal";
					scraped_text_color = "white";
					academic_text_color = "black";
					both_text_color = "black";
					source = 'Scraped';
					update_data(category, source);
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
					category = category_to_name[d];
					update_data(category, source);
				});

			legend.append("text")
				.attr("x", width - legend_margin - 6)
				.attr("y", categories_top + 9)
				// .attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) { return category_to_name[d]; })
				.style("font-size", "13px")
				.style("font-weight", function(d) {
					if (category_to_name[d] == category) {
						return "bold";
					} else {
						return "normal";
					}
				})
				.on("click", function(d)  {
					category = category_to_name[d];
					update_data(category, source);
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

		title = source_title + " Data - " + category + " Restaurants (" + business_data.length.toLocaleString('en') + ")";
	    d3.select("#title").text(title);

		svg.call(zoom).call(zoom.event);
	};

	function update_data(category, source) {
		d3.selectAll("circle")
			.style("opacity", function(d) {
				if ((d.cat == category || category == "All") && (d.type == source || source == "both")) {
					return 0.9;
				} else {
					return 0;
				}
			})
			.style("pointer-events", function(d) {
				if ((d.cat == category || category == "All") && (d.type == source || source == "both")) {
					return "all";
				} else {
					return "none";
				}
			});

		if (source == 'both') {
			source_title = 'Academic and Scraped';
		} else {
			source_title = source;
		}

		// title = source_title + " Data - " + category + " Restaurants (" + business_data.length.toLocaleString('en') + ")";
		title = source_title + " Data - " + category + " Restaurants";
	    d3.select("#title").text(title);
	}

	// If the drag behavior prevents the default click,
	// also stop propagation so we don’t click-to-zoom.
	function stopped() {
		if (d3.event.defaultPrevented) d3.event.stopPropagation();
	}

	function get_reviews(business, projection) {
		$.getJSON($SCRIPT_ROOT + "/data",
			{dtype: 'reviews', business_id: business.business_id},
			function(data) {
				draw_reviews(data, business, projection)
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
						add_data(map_data, business_data, projection);
					});
			}
		);
	}

	main();

});