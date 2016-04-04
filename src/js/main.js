/* jshint browserify: true, devel: true */
"use strict";

var $ = require("jQuery");
var Konva = require('konva');

$(function() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    });

	var squareLayer, lineLayer, mapPoints;

	squareLayer = new Konva.Layer();
	lineLayer = new Konva.Layer();

    function updateLines() {
		var b = mapPoints;
        var connector = lineLayer.get('#connectorLine')[0];

        connector.setPoints([b.start.attrs.x + 8, b.start.attrs.y + 8, b.end.attrs.x + 8, b.end.attrs.y + 8]);

		var text = lineLayer.get('#connectorLabel')[0];
		text.position({
			x: (b.start.attrs.x + b.end.attrs.x - 16) / 2,
			y: (b.start.attrs.y + b.end.attrs.y) / 2
		});

        lineLayer.draw();
    }

	function addRect(xpos, ypos, fillColor) {
	    var rect = new Konva.Rect({
		  x: xpos,
	      y: ypos,
	      width: 16,
	      height: 16,
	      fill: fillColor,
	      stroke: 'black',
	      strokeWidth: 1,
		  draggable: true
	    });

        rect.on('dragend', function() {
            updateLines();
        });

	    // add the shape to the layer
	    squareLayer.add(rect);

		return rect;
	}

	var room1 = addRect(0, 0, 'green');
	var room2 = addRect(64, 0, 'brown');

    var line = new Konva.Line({
        strokeWidth: 2,
        stroke: 'black',
        id: 'connectorLine',
        opacity: 1,
        points: [0, 0]
    });
    var text = new Konva.Text({
	  id: 'connectorLabel',
      text: 'go door',
      fontSize: 9,
      fontFamily: 'Arial',
      fill: 'black',
	  align: 'center'
    });

	lineLayer.add(line);
	lineLayer.add(text);

	mapPoints = {
        start: room1,
        end: room2
    };

    // keep lines in sync with squares
    squareLayer.on('beforeDraw', function() {
        updateLines();
    });

    // add the layer to the stage
	stage.add(lineLayer);
    stage.add(squareLayer);
	updateLines();
});

