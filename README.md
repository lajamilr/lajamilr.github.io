lajamilr.github.io
==================
ITCS 4650 ~ CS Senior Project ~ Spring 2014

Purpose:
--------  
Visualization large datasets using:
	•	HTML
	•	JavaScript
	•	JQuery
	•	D3
	•	dimplejs

Datasets:
---------
Two datasets are used, both from Crawdad
http://crawdad.cs.dartmouth.edu/index.html

	1)	The ctu/personal dataset
Mobile phone records of Czech Ph.D. student Michal Ficek.
http://crawdad.cs.dartmouth.edu/ctu/personal/

	2)	The st_andrews/sassy dataset
Encounter records of a group of participants carrying sensor motes
http://crawdad.cs.dartmouth.edu/st_andrews/sassy/

Visualizations
--------------
I have created 3 visualizations:

	1. Animated bubble chart for the ctu/personal dataset
This visualization displays all the records in the dataset with some grouping options. The user can group the bubbles by month, type, and direction.

	2. Coordinated bubble chart for the ctu/personal dataset
This visualization gives the user a day by day analysis of the records by allowing the user to filter out the data based on the date and the type of data.

	3. A network graph for the st_andrews/sassy dataset
This visualization consists of nodes and links that illustrate the architecture of the network. Two Layouts are used: forced directed layout and circular layout. The visualization has an animation feature that allows the user to select a range of dates and a duration for each graph. The respective graphs will then be displayed one by one.


Acknowledgment
==============
This project is created by Layla R. Lajami under the supervision of Dr. Yu Wang and his PhD Student Chao Zhang at The University of North Carolina at Charlotte.

✴ If you have any question, please contact me at http://layla-r-lajami.weebly.com/contact-me.html
✴ Source code can be downloaded from: https://github.com/lajamilr/lajamilr.github.io 

References
==========
✴ Jim Vallandingham’s tutorial “Creating Animated Bubble Charts in D3”: http://vallandingham.me/bubble_charts_in_d3.html
✴ Nai Saevang “Unemployment Visualization”: https://github.com/naisaevang/unemploymentVis
✴ DimpleJS “Time Bubble Lines”: http://dimplejs.org/advanced_examples_viewer.html?id=advanced_time_axis
✴ D3noob’s blocks “Directional Force Layout Diagram with node colouring”: http://bl.ocks.org/d3noob/8043434
✴ Bootstrap: http://getbootstrap.com/css/
✴ Sourceforge.net Multi Dates Picker: http://multidatespickr.sourceforge.net/
✴ jQuery Datepicker Widget: http://api.jqueryui.com/datepicker/
✴ jQery Slider Widget: http://api.jqueryui.com/slider/
✴ Marc Neuwirth “Using a jQuery UI Slider to Select a Time Range”: http://marcneuwirth.com/blog/2010/02/21/using-a-jquery-ui-slider-to-select-a-time-range/
✴ Crawdad “The ctu/personal dataset”: http://crawdad.cs.dartmouth.edu/ctu/personal/
✴ Crawdad “The st_andrews/sassy dataset” http://crawdad.cs.dartmouth.edu/st_andrews/sassy/