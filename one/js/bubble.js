var custom_bubble_chart = (function(d3, CustomTooltip) {
  "use strict";

  var width = 1024,
      height = 800,
      tooltip = CustomTooltip("gates_tooltip", 240),
      layout_gravity = 0,
      damper = 0.1,
      nodes = [],
      vis, force, circles, radius_scale;

  var center = {x: width / 2, y: height / 2};

  var type_centers = {
      "Voice": {x: width / 3 , y: height / 2},
      "SMS":   {x: width / 2, y: height / 2},
      "Data":  {x: 2 * width / 3, y: height / 2}
    };

  var direction_centers = {
      "Incoming": {x: width / 3 , y: height / 2},
      "Outgoing": {x: width / 2, y: height / 2},
      "Missed call": {x: 2 * width / 3, y: height / 2}
    };

  var month_centers = {
      "September":{x: 350 , y: height / 2},
      "October":  {x: 450, y: height / 2},
      "November": {x: 500, y: height / 2},
      "December": {x: 550, y: height / 2},
      "January":  {x: 650, y: height / 2},
      "February": {x: 700, y: height / 2}
    };

  // Color Mapping  
  var color_domain = ["Voice","SMS","Data"];
  var color_range = ["seagreen","steelblue","orange"];
  var fill_color = d3.scale.ordinal()
                  .domain(color_domain)
                  .range(color_range);

  function custom_chart(data) {
    var max_amount = d3.max(data, function(d) { return parseInt(d.Duration, 10); } );
    radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([5, 50]);

    //create node objects from original data
    //that will serve as the data behind each
    //bubble in the vis, then add each node
    //to nodes to be used later
    data.forEach(function(d){
      var node = {
        radius: radius_scale(parseInt(d.Duration, 10)),
        id: d.id,
        value: d.Duration,
        type: d.Type,
        direction: d.Direction,
        date: d.Date,
        time: d.Time,
        times: d.TimeS,
        year: d.Year,
        month: d.Month,
        day: d.Day,
        hour: d.Hour,
        minute: d.Minute,
        second: d.Second,
        month_name: d.MonthName,
        x: Math.random() * 1000,
        y: Math.random() * 1000
      };
      nodes.push(node);
    });

    vis = d3.select("#vis").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "svg_vis");

    circles = vis.selectAll("circle")
                 .data(nodes, function(d) { return d.id ;});

    circles.enter().append("circle")
      .attr("r", 0)
      .attr("fill", function(d) { return fill_color(d.type) ;})
      .attr("stroke-width", 2)
      .attr("stroke", function(d) {return d3.rgb(fill_color(d.type)).darker();})
      .attr("id", function(d) { return  "bubble_" + d.id; })
      .on("mouseover", function(d, i) {show_details(d, i, this);} )
      .on("mouseout", function(d, i) {hide_details(d, i, this);} );

    circles.transition().duration(2000).attr("r", function(d) { return d.radius; });

  }

  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 7;
  }

  function start() {
    force = d3.layout.force()
            .nodes(nodes)
            .size([width, height]);
  }

  function display_group_all() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
         .on("tick", function(e) {
            circles.each(move_towards_center(e.alpha))
                   .attr("cx", function(d) {return d.x;})
                   .attr("cy", function(d) {return d.y;});
         });
    force.start();
    hide_months();
    hide_types();
    hide_direction();
  }

  function move_towards_center(alpha) {
    return function(d) {
      d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    };
  }

  function display_by_type() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_type(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    hide_months();
    hide_direction();
    display_types();
  }

  function move_towards_type(alpha) {
    return function(d) {
      var target = type_centers[d.type];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }


  function display_types() {
      var types_x = {"Voice": 150, "SMS": width / 2, "Data":width - 150};
      var types_data = d3.keys(types_x);
      var types = vis.selectAll(".types")
                 .data(types_data);

      types.enter().append("text")
                   .attr("class", "types")
                   .attr("x", function(d) { return types_x[d]; })
                   .attr("y", 40)
                   .attr("text-anchor", "middle")
                   .text(function(d) { return d;});

  }

  function display_by_direction() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_direction(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    hide_months();
    hide_types();
    display_direction();
  }

   function move_towards_direction(alpha) {
    return function(d) {
      var target = direction_centers[d.direction];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }


  function display_direction() {
      var direction_x = {"Incoming": 200, "Outgoing": width / 2 + 50, "Missed Call": width - 100};
      var direction_data = d3.keys(direction_x);
      var direction = vis.selectAll(".direction")
                 .data(direction_data);

      direction.enter().append("text")
                   .attr("class", "direction")
                   .attr("x", function(d) { return direction_x[d]; })
                   .attr("y", 40)
                   .attr("text-anchor", "middle")
                   .text(function(d) { return d;});

  }

  function display_by_month() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_month(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    hide_types();
    hide_direction();
    display_months();
  }

  function move_towards_month(alpha) {
    return function(d) {
      var target = month_centers[d.month_name];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }


  function display_months() {
      var months_x = {"Sept": 150, "Oct": 380, "Nov":550,
                      "Dec": 680, "Jan": 850, "Feb": 980};
      var months_data = d3.keys(months_x);
      var months = vis.selectAll(".months")
                 .data(months_data);

      months.enter().append("text")
                   .attr("class", "months")
                   .attr("x", function(d) { return months_x[d]; })
                   .attr("y", 40)
                   .attr("text-anchor", "middle")
                   .text(function(d) { return d;});

  }

  function hide_types() {
      var types = vis.selectAll(".types").remove();
  }

  function hide_direction() {
      var direction = vis.selectAll(".direction").remove();
  }

  function hide_months() {
      var direction = vis.selectAll(".months").remove();
  }


  function show_details(data, i, element) {
    d3.select(element).attr("stroke", "black");
    var content = "<span class=\"type\">Type:</span><span class=\"value\"> " + data.type + "</span><br/>";
    content +="<span class=\"type\">Direction:</span><span class=\"value\"> " + data.direction + "</span><br/>";
    content +="<span class=\"type\">Duration:</span><span class=\"value\"> " + addCommas(data.value) + "</span><br/>";
    content +="<span class=\"type\">Date:</span><span class=\"value\"> " + data.date + "</span><br/>";
    content +="<span class=\"type\">Time:</span><span class=\"value\"> " + data.time + "</span>";
    tooltip.showTooltip(content, d3.event);
  }

  function hide_details(data, i, element) {
    d3.select(element).attr("stroke", function(d) { return d3.rgb(fill_color(d.rate)).darker();} );
    tooltip.hideTooltip();
  }

  var my_mod = {};
  my_mod.init = function (_data) {
    custom_chart(_data);
    start();
  };

  my_mod.display_all = display_group_all;
  my_mod.display_type = display_by_type;
  my_mod.display_direction = display_by_direction;
  my_mod.display_month = display_by_month;

  my_mod.toggle_view = function(view_type) {
    if (view_type == 'type') {
      display_by_type();
    } else if (view_type == 'direction') {
      display_by_direction();
    }else if (view_type == 'month') {
      display_by_month();
    } else {
      display_group_all();
      }
    };

  return my_mod;
})(d3, CustomTooltip);