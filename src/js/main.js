/* jshint browserify: true, devel: true */
"use strict";

var $ = require("jQuery");
var Konva = require('konva');

var squareLayer, lineLayer, rooms, connectors, nextConnectorId;

squareLayer = new Konva.Layer();
lineLayer = new Konva.Layer();
rooms = [];
connectors = [];
nextConnectorId = 0;

function updateLines() {
	for (var i = 0; i < connectors.length; i++) {
		var connector = connectors[i];

		connector.line.setPoints([connector.start.attrs.x + 8, connector.start.attrs.y + 8, connector.end.attrs.x + 8, connector.end.attrs.y + 8]);

		var x = (connector.start.attrs.x + connector.end.attrs.x + 16) / 2;
		var y = (connector.start.attrs.y + connector.end.attrs.y + 16) / 2;
		var dx = connector.start.attrs.x - connector.end.attrs.x;
		var dy = connector.start.attrs.y - connector.end.attrs.y;
		var angle = Math.atan2(dy,dx) * 180 / Math.PI;

		if (typeof connector.fromLabel !== 'undefined') {
			connector.fromLabel.position({
				x: x,
				y: y
			});
			connector.fromLabel.rotation(angle + 180);
		}

		if (typeof connector.toLabel !== 'undefined') {
			connector.toLabel.position({
				x: x,
				y: y
			});
			connector.toLabel.rotation(angle);
		}
	}

	lineLayer.draw();
}

function addRoom(id, x, y, color) {
	var room = new Konva.Rect({
		id: id,
		x: x,
		y: y,
		width: 16,
		height: 16,
		fill: color,
		stroke: 'black',
		strokeWidth: 1,
		draggable: true
	});

	room.on('dragend', function() {
		updateLines();
	});

	rooms[id] = room;

	// add the shape to the layer
	squareLayer.add(room);
}

function addConnector(fromRoomId, toRoomId, fromLabel, toLabel) {
	var id = nextConnectorId++;
	var connector = {
		start: rooms[fromRoomId],

		end: rooms[toRoomId],

		line: new Konva.Line({
			strokeWidth: 2,
			stroke: 'black',
			id: id + "-line",
			opacity: 1,
			points: [0, 0]
		}),
	};

	lineLayer.add(connector.line);

	if (typeof fromLabel !== 'undefined' && fromLabel !== null) {
		connector.fromLabel = new Konva.Text({
			id: id + '-fromLabel',
			text: fromLabel,
			width: 64,
			fontSize: 9,
			fontFamily: 'Arial',
			fill: 'black',
			align: 'center'
		});
		connector.fromLabel.setOffsetX(connector.fromLabel.attrs.width / 2);
		connector.fromLabel.setOffsetY(16);
		lineLayer.add(connector.fromLabel);
	}

	if (typeof toLabel !== 'undefined' && toLabel !== null) {
		connector.toLabel = new Konva.Text({
			id: id + 'toLabel',
			text: toLabel,
			width: 64,
			fontSize: 9,
			fontFamily: 'Arial',
			fill: 'black',
			align: 'center'
		});
		connector.toLabel.setOffsetX(connector.fromLabel.attrs.width / 2);
		connector.toLabel.setOffsetY(16);
		lineLayer.add(connector.toLabel);
	}

	connectors.push(connector);
}

$(function() {
	var width = window.innerWidth;
	var height = window.innerHeight;

    var stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    });

	addRoom(0, 0, 0, 'green');
	addRoom(1, 64, 0, 'brown');

	addConnector(0, 1, 'go steel door', 'out');

    // keep lines in sync with squares
    squareLayer.on('beforeDraw', function() {
        updateLines();
    });

    // add the layer to the stage
	stage.add(lineLayer);
    stage.add(squareLayer);
	updateLines();
});

