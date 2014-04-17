function update(date, hour_minute_0, hour_minute_1, tooltip, isCircularLayout)
{
    d3.select("svg")
       .remove();
    
    // get the data
    d3.csv("data/dsn.csv", function(error, links) 
    {
        if(error){console.log(error);}
        var width = 500,
            height = 500,
            color = d3.scale.category20c();

        var nodes = [];
        var dataNodes = []; 
        var filterd_links = links.filter(bound_data);
        var length = filterd_links.length;

        for (var j = 0; j < length; j++)
        {
            filterd_links[j].source = nodes[filterd_links[j].source] || (nodes[filterd_links[j].source] = {name: filterd_links[j].source});
            filterd_links[j].target = nodes[filterd_links[j].target] || (nodes[filterd_links[j].target] = {name: filterd_links[j].target});
            filterd_links[j].starting_time = [];
            filterd_links[j].starting_time.push(filterd_links[j].time_start);
            filterd_links[j].durations = [];
            filterd_links[j].durations.push(+filterd_links[j].value);
            filterd_links[j].num_connections = 1;
            filterd_links[j].total_duration = +filterd_links[j].value;

             // link.value should hold the avg duration for all connections
            filterd_links[j].value = +filterd_links[j].value;
       
            for (var i = 0; i < j; i++)
            {
                if(filterd_links[j].source.name == filterd_links[i].source.name && 
                   filterd_links[j].target.name == filterd_links[i].target.name)
                {
                    filterd_links[i].starting_time.push(filterd_links[j].time_start);
                    filterd_links[i].durations.push(+filterd_links[j].value);
                    filterd_links[i].num_connections++;
                    filterd_links[i].total_duration +=  (+filterd_links[j].value);
                    filterd_links[i].value = (filterd_links[i].total_duration/filterd_links[i].num_connections);

                    filterd_links.splice(j,1);
                    j--;
                    length--;
                    break;
                }
            } 
        }


        for(var i = 1; i < 26; i++)
        {
            if(typeof nodes[i] == 'undefined')
            {   
                var node = {name : ""+i};
                nodes[i] = node;
            }
            nodes[i].out_degree = 0;
            nodes[i].in_degree = 0;
            nodes[i].outgoing_neighbors = [];
            nodes[i].incoming_neighbors = [];
            nodes[i].sum_duration = 0;
            nodes[i].sum_avg_duration = 0;
        }
        
        for(var j = 0; j < filterd_links.length; j++)
        {
            nodes[filterd_links[j].source.name].out_degree++;
            nodes[filterd_links[j].target.name].in_degree++;
            nodes[filterd_links[j].source.name].sum_duration += filterd_links[j].total_duration;
            nodes[filterd_links[j].source.name].sum_avg_duration += filterd_links[j].value;
            nodes[filterd_links[j].source.name].outgoing_neighbors.push(filterd_links[j].target.name);
            nodes[filterd_links[j].target.name].incoming_neighbors.push(filterd_links[j].source.name);
        }


        var scale = d3.scale.linear()
                      .domain(scaleBounds(filterd_links))
                      .range([50,100]);

        var nodeScale = d3.scale.linear()
                      .domain(scaleBounds2(nodes))
                      .range([4,10]);


        if(isCircularLayout)
        {
            // setting the locations of the nodes on the circumference of a circle of radius = 200
            var radius = 200,
                theta = 0,
                new_theta = 0,
                d_theta = 360.0/25.0;

            for(var i = 1; i < nodes.length; i++)
            {
                new_theta = toRadians(theta);
                theta += d_theta;
                nodes[i].x  = radius * ( Math.cos(new_theta) + 1) + 50;
                nodes[i].px = radius * ( Math.cos(new_theta) + 1) + 50;
                nodes[i].y  = radius * (-Math.sin(new_theta) + 1) + 50;
                nodes[i].py = radius * (-Math.sin(new_theta) + 1) + 50;
                nodes[i].fixed = true;
            }
        }
        else // If the layout is not circular, then remvoe the nodes that don't have any links
        {
 
            for(var i =1; i < nodes.length; i++)
            {
                if(!(nodes[i].in_degree == 0 && nodes[i].out_degree == 0))
                    dataNodes.push(nodes[i]) 
            }
            nodes = dataNodes;
        }
        
        var svg = d3.select("#vis").append("svg")
            .attr("width", width)
            .attr("height", height);

        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(filterd_links)
            .size([width, height])
            .linkDistance(function(d){return scale(d.value);})
            .gravity(0.06)
            .charge(-300)
            .friction(.5)
            .on("tick", tick)
            .start();
        // appending a date lable in the upper left corner of the visualization 
        svg.append("text")
           .attr("x", 10)
           .attr("y", 10)
           .attr("dy", ".35em")
           .text(date);

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
            .attr("r", function(d){return nodeScale(d.out_degree);})
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
        }
         
        // action to take on mouse click
        function click(d,i) 
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
            show_details2(d, i, d3.select(this));
        }
         
        // action to take on mouse double click
        function dblclick(d,i) 
        {
            d3.select(this).select("circle").transition()
                .duration(750)
                .attr("r", function(d){return nodeScale(d.out_degree);})
            d3.select(this).select("text").transition()
                .duration(750)
                .attr("x", 12)
                .style("stroke", "none")
                .style("fill", "black")
                .style("font", "10px sans-serif");
            hide_details2(d, i, d3.select(this));
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
                    
            var content = "<span class=\"type\"><b>Source:</b></span><span class=\"value\"> " + d.source.name + "</span><br/>";
            content +="<span class=\"type\"><b>Target:</b></span><span class=\"value\"> " + d.target.name + "</span><br/>";
            content +="<span class=\"type\"><b>Total Duration:</b></span><span class=\"value\"> " + addCommas(d.total_duration) + " seconds</span><br/>";
            content +="<span class=\"type\"><b>Average Duration:</b></span><span class=\"value\"> " + addCommas(d.value.toFixed(2)) + " seconds</span><br/>";
            content +="<span class=\"type\"><b>#Connections:</b></span><span class=\"value\"> " + d.num_connections + "</span><br/>";
            content +="<span class=\"type\"><b>Date Start:</b></span><span class=\"value\"> " + d.date_start + "</span><br/>";
            content +="<span class=\"type\"><b>Time Start:</b></span>";
            content += stringifyArray(d.starting_time);
            tooltip.showTooltip(content, d3.event);
        }

        function show_details2(d, i, element) 
        {           
            var content = "<span class=\"type\"><b>Name:</b></span><span class=\"value\"> " + d.name + "</span><br/>";
            content +="<span class=\"type\"><b>Out Degree:</b></span><span class=\"value\"> " + d.out_degree + "</span><br/>";
            content +="<span class=\"type\"><b>In Degree:</b></span><span class=\"value\"> " + d.in_degree + "</span><br/>";
            content +="<span class=\"type\"><b>Sum Duration:</b></span><span class=\"value\"> " + addCommas(d.sum_duration) + " seconds</span><br/>";
            content +="<span class=\"type\"><b>Sum Avg Duration:</b></span><span class=\"value\"> " + addCommas(d.sum_avg_duration.toFixed(2)) + " seconds</span><br/>";
            content +="<span class=\"type\"><b>Outgoing Neighbors:</b></span>";
            content += stringifyArray(d.outgoing_neighbors);
            content +="<br/><span class=\"type\"><b>Incoming Neighbors:</b></span>";
            content += stringifyArray(d.incoming_neighbors);
            tooltip.showTooltip(content, d3.event);
        }

        function hide_details2(d, i, element) 
        {
            tooltip.hideTooltip();
        }

        function hide_details(d, i, element) 
        {
            d3.select(element).style("stroke", "#666")
                              .style("stroke-width", 1.5);
            tooltip.hideTooltip();
        }

        function stringifyArray(array)
        {
            if(array.length > 0)
            {
                var content = "<span class=\"type\"></span><span class=\"value\"> " + array[0] + "</span>";
                for(var i =1; i < array.length; i++)
                {
                    content += "<span class=\"type\">, </span><span class=\"value\"> " + array[i] + "</span>";
                }
                return content;
            }
            else
                return "";
        }

        function scaleBounds(array)
        {
            if(array.length > 0)
            {
                var max = array[0].value,
                    min = array[0].value;
                for(var i = 1; i < array.length; i++)
                {
                    if(array[i].value > max)
                        max = array[i].value;
                    if(array[i].value < min)
                        min = array[i].value;
                }
                return [min,max]; 
            }
            else return [0,0];
        }

        function scaleBounds2(array)
        {
            if(array.length > 0)
            {
                var max = array[1].out_degree,
                    min = array[1].out_degree;
                for(var i = 2; i < array.length; i++)
                {
                 if(array[i].out_degree > max)
                     max = array[i].out_degree;
                 if(array[i].out_degree < min)
                     min = array[i].out_degree;
                }
                return [min,max]; 
            }
            else
                return [0,0]; 
        }

        function toRadians (angle) 
        {
            return angle * (Math.PI / 180.0);
        }
    });  
}