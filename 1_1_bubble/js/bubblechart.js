/*
    Title: bubblechart.js
    Programmer: Layla R. Lajami
    Purpose: This file only calls some functions to read the data and creates
             the animated bubble chart
    Date: Spring 2014
*/

// Read the data and create the custom bubble chart by calling the 
// corresponding function from bubble.js
d3.csv("data/ficek_personal_communication.csv", function(data) 
{ 
    custom_bubble_chart.init(data);
    custom_bubble_chart.toggle_view('all');
});

// sets the active view 
$(document).ready(function() 
{
  $('#view_selection a').click(function() 
  {
    var view_type = $(this).attr('id');
    $('#view_selection a').removeClass('active');
    $(this).toggleClass('active');
    custom_bubble_chart.toggle_view(view_type);
    return false;
  });
});