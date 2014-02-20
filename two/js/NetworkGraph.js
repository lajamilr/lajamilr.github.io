function update(date, hour_minute_0, hour_minute_1, tooltip)
{
    d3.select("svg")
       .remove();
    // get the data
    d3.csv("data/dsn.csv", function(error, links) 
    {
        var width = 500,
            height = 500,
            color = d3.scale.category20c();

        var nodes = {};
        
        var filterd_links = links.filter(bound_data);

        filterd_links.forEach(function(link) 
        {
            link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
            link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
            link.value = +link.value;
        });
       
        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(filterd_links)
            .size([width, height])
            .linkDistance(90)
            .gravity(0.06)
            .charge(-300)
            .friction(.5)
            .size([width/2 , height ])
            .on("tick", tick)
            .start();
         
        var svg = d3.select("#vis").append("svg")
            .attr("width", width)
            .attr("height", height);
         
        // build the arrow.
        svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
         
        // add the links and the arrows
        var path = svg.append("svg:g").selectAll("path")
            .data(force.links())
            .enter().append("svg:path")
            .attr("class", function(d) { return "link " + d.type; })
            .attr("marker-end", "url(#end)")
            .on("mouseover", function(d, i) { show_details(d, i, this); })
            .on("mouseout", function(d, i) { hide_details(d, i, this); });

        // define the nodes
        var node = svg.selectAll(".node")
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            .on("click", click)
            .on("dblclick", dblclick)
            .call(force.drag);
         
        // add the nodes
        node.append("circle")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.name); });

         
        // add the text 
        node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });
         
        // add the curvy lines
        function tick() 
        {
            path.attr("d", function(d) 
            {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + 
                    d.source.x + "," + 
                    d.source.y + "A" + 
                    dr + "," + dr + " 0 0,1 " + 
                    d.target.x + "," + 
                    d.target.y;
            });
         
            node
                .attr("transform", function(d) { 
                    return "translate(" + d.x + "," + d.y + ")"; });

            /*node.attr("cx", function(d) { return d.x = Math.max(r, Math.min(width- r, d.x)); })
                .attr("cy", function(d) { return d.y = Math.max(r, Math.min(height - r, d.y)); });

            path.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });*/
        }
         
        // action to take on mouse click
        function click() 
        {
            d3.select(this).select("text").transition()
                .duration(750)
                .attr("x", 22)
                .style("stroke", "lightsteelblue")
                .style("stroke-width", ".5px")
                .style("font", "20px sans-serif");
            d3.select(this).select("circle").transition()
                .duration(750)
                .attr("r", 16);
        }
         
        // action to take on mouse double click
        function dblclick() 
        {
            d3.select(this).select("circle").transition()
                .duration(750)
                .attr("r", 6);
            d3.select(this).select("text").transition()
                .duration(750)
                .attr("x", 12)
                .style("stroke", "none")
                .style("fill", "black")
                .style("font", "10px sans-serif");
        }

        function bound_data(d)
        {
            return d.date_start == date &&
                   d.hour_minute_start >= hour_minute_0 && d.hour_minute_start <= hour_minute_1;
        }

        function show_details(d, i, element) 
        {
            d3.select(element).style("stroke", "red")
                              .style("stroke-width", 2);
                    
            var content = "<span class=\"type\">Source:</span><span class=\"value\"> " + d.source.name + "</span><br/>";
            content +="<span class=\"type\">Target:</span><span class=\"value\"> " + d.target.name + "</span><br/>";
            content +="<span class=\"type\">Duration:</span><span class=\"value\"> " + addCommas(d.value) + " seconds</span><br/>";
            content +="<span class=\"type\">Date Start:</span><span class=\"value\"> " + d.date_start + "</span><br/>";
            content +="<span class=\"type\">Time Start:</span><span class=\"value\"> " + d.time_start + "</span>";
            tooltip.showTooltip(content, d3.event);
        }


      function hide_details(d, i, element) 
      {
        d3.select(element).style("stroke", "#666")
                          .style("stroke-width", 1.5);
        tooltip.hideTooltip();
      }
     
    });
}