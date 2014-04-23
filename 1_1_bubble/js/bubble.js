/*
    Title: bubble.js
    Programmer: Layla R. Lajami
    Purpose: This file contains JavaScript Source code for creating animated bubble chart
             Code is adopted from Jim Vallandingham's tutorial and is modified from Nai Saevang,
             who modified the original code from duky427
             http://vallandingham.me/bubble_charts_in_d3.html
             https://github.com/naisaevang/unemploymentVis
             https://gist.github.com/ducky427/5583054
    Date: Spring 2014
*/

var custom_bubble_chart = (function(d3, CustomTooltip) {
  "use strict";

  var width = 1024,
      height = 800,
      tooltip = CustomTooltip("gates_tooltip", 240),
      layout_gravity = 0,
      damper = 0.1,
      nodes = [],
      vis, force, circles, radius_scale;

  // the x and y coordinates for the center of the visualization
  var center = {x: width / 2, y: height / 2};
  // Specifying the x and y coordinates for each type label
  var type_centers = {
      "Voice": {x: width / 3 , y: height / 2},
      "SMS":   {x: width / 2, y: height / 2},
      "Data":  {x: 2 * width / 3, y: height / 2}
    };
// Specifying the x and y coordinates for each direction label
  var direction_centers = {
      "Incoming": {x: width / 3 , y: height / 2},
      "Outgoing": {x: width / 2, y: height / 2},
      "Missed call": {x: 2 * width / 3, y: height / 2}
    };
// Specifying the x and y coordinates for each month label
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

  function custom_chart(data) 
  {
    // find the maximum duration in the entire dataset
    var max_amount = d3.max(data, function(d) { return parseInt(d.Duration, 10); } );
    // scale the radius of the circle in the range of [5, 50]
    radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([5, 50]);

    /*create node objects from original data that will serve as the data behind each
      bubble in the vis, then add each node to nodes array to be used later
      */
    data.forEach(function(d)
    {
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

    // add the circles
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
  /*  
    The charge of a force layout specifies node-node repulsions, 
    so it could be used to push nodes away from one another, creating this effect.
    For more info: read Jim Vallandingham's tutorial
  */
  function charge(d) 
  {
    return -Math.pow(d.radius, 2.0) / 7;
  }

  function start() 
  {
    force = d3.layout.force()
            .nodes(nodes)
            .size([width, height]);
  }

  /*
    this function configures and startup the force directed simulation
    For more info: read Jim Vallandingham's tutorial
  */
  function display_group_all() 
  {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
         .on("tick", function(e) 
         {
            circles.each(move_towards_center(e.alpha))
                   .attr("cx", function(d) {return d.x;})
                   .attr("cy", function(d) {return d.y;});
         });
    force.start();
    hide_months();
    hide_types();
    hide_direction();
  }

  /*
    this function moves the x and y coordinates of each bubble to the center of the visualization
    This push towards the center is dampened by a constant, 0.02 + damper and alpha.
    The alpha dampening allows the push towards the center to be reduced over the course of the simulation, 
    giving other forces like gravity and charge the opportunity to push back.
    The variable damper is set to 0.1. This probably took some time to find a good value for.
    For more info: read Jim Vallandingham's tutorial
  */
  function move_towards_center(alpha) 
  {
    return function(d) 
    {
      d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    };
  }

  /*
    The switch to displaying by type is done by restarting the force simulation. 
    This time the tick function calls move_towards_type. Otherwise it’s about the same as display_group_all.
    For more info: read Jim Vallandingham's tutorial
  */
  function display_by_type() 
  {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) 
        {
          circles.each(move_towards_type(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    hide_months();
    hide_direction();
    display_types();
  }

  /*
    This function move each bubble to its corresponding group based on its type
    It is similar to move_towards_center. 
    This is just an associative array where each type has its own location to move towards.
  */  
  function move_towards_type(alpha) 
  {
    return function(d) {
      var target = type_centers[d.type];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }

  //This function displays the types labels
  function display_types() 
  {
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

  /*
    The switch to displaying by direction is done by restarting the force simulation. 
    This time the tick function calls move_towards_direction. Otherwise it is about the same as display_group_all.
    For more info: read Jim Vallandingham's tutorial
  */
  function display_by_direction() 
  {
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

  /*
    This function move each bubble to its corresponding group based on its direction
    It is similar to move_towards_center. 
    This is just an associative array where each direction has its own location to move towards.
  */ 
  function move_towards_direction(alpha) 
   {
    return function(d) {
      var target = direction_centers[d.direction];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }

  //This function displays the direction labels
  function display_direction() 
  {
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

  /*
    The switch to displaying by month is done by restarting the force simulation. 
    This time the tick function calls move_towards_month. Otherwise it’s about the same as display_group_all.
    For more info: read Jim Vallandingham's tutorial
  */
  function display_by_month() 
  {
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

  /*
    This function move each bubble to its corresponding group based on its month
    It is similar to move_towards_center. 
    This is just an associative array where each month has its own location to move towards.
  */ 
  function move_towards_month(alpha) 
  {
    return function(d) 
    {
      var target = month_centers[d.month_name];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }

  //This function displays the months labels
  function display_months()
  {
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

  // This function hides the types labels
  function hide_types() 
  {
      var types = vis.selectAll(".types").remove();
  }

  // This function hides the directions elements
  function hide_direction() 
  {
      var direction = vis.selectAll(".direction").remove();
  }
  
  // This function hides the months labels
  function hide_months() 
  {
      var direction = vis.selectAll(".months").remove();
  }

  /* 
    This function shows the Link info in the tooltip
    It also changes the circle boundaries color (stroke)
   */
  function show_details(data, i, element) {
    d3.select(element).attr("stroke", "black");
    var content = "<span class=\"type\">Type:</span><span class=\"value\"> " + data.type + "</span><br/>";
    content +="<span class=\"type\">Direction:</span><span class=\"value\"> " + data.direction + "</span><br/>";
    content +="<span class=\"type\">Duration:</span><span class=\"value\"> " + addCommas(data.value) + " seconds</span><br/>";
    content +="<span class=\"type\">Date:</span><span class=\"value\"> " + data.date + "</span><br/>";
    content +="<span class=\"type\">Time:</span><span class=\"value\"> " + data.time + "</span>";
    tooltip.showTooltip(content, d3.event);
  }

  // This function hide the tooltip and reset the circle boundaries (stroke)
  function hide_details(data, i, element) {
    d3.select(element).attr("stroke", function(d) { return d3.rgb(fill_color(d.rate)).darker();} );
    tooltip.hideTooltip();
  }

  /*
    This block of code is used to toggle between the different view 
    Source code is provided by Nai Saevang
  */

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