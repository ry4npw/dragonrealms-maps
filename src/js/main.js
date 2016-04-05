/* jshint browserify: true, devel: true */
"use strict";

var $ = require("jQuery");
var Konva = require('konva');

var squareLayer, lineLayer, roomsGroup, rooms, connectors, nextConnectorId;

squareLayer = new Konva.Layer();
lineLayer = new Konva.Layer();
rooms = [];
connectors = [];
nextConnectorId = 0;

roomsGroup = new Konva.Group({
	draggable: true
});
// redraw lines
roomsGroup.on('dragmove', function() {
	updateLines();
});

function updateLines() {
	for (var i = 0; i < connectors.length; i++) {
		var connector = connectors[i];

		connector.line.setPoints([rooms[connector.start].getAbsolutePosition().x + 8, rooms[connector.start].getAbsolutePosition().y + 8, rooms[connector.end].getAbsolutePosition().x + 8, rooms[connector.end].getAbsolutePosition().y + 8]);

		var x = (rooms[connector.start].getAbsolutePosition().x + rooms[connector.end].getAbsolutePosition().x + 16) / 2;
		var y = (rooms[connector.start].getAbsolutePosition().y + rooms[connector.end].getAbsolutePosition().y + 16) / 2;
		var dx = rooms[connector.start].getAbsolutePosition().x - rooms[connector.end].getAbsolutePosition().x;
		var dy = rooms[connector.start].getAbsolutePosition().y - rooms[connector.end].getAbsolutePosition().y;
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
		strokeWidth: 1
		//draggable: true
	});

	//room.on('dragend', function() {
	//	updateLines();
	//});

	rooms[id] = room;

	// add the shape to the layer
	roomsGroup.add(room);
}

function addBlankRoom(id, x, y) {
	var room = new Konva.Rect({
		id: id,
		x: x,
		y: y,
		visible: false
	});

	rooms[id] = room;

	// add the shape to the layer
	roomsGroup.add(room);
}


function addConnector(fromRoomId, toRoomId, fromLabel, toLabel) {
	var id = nextConnectorId++;
	var connector = {
		start: fromRoomId,

		end: toRoomId,

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

	// addRoom(roomId, x, y, color)
	addRoom(0, 384, 0, 'gray');
	addRoom(1, 384, 64, 'gray');
	addRoom(2, 448, 64, 'gray'); // Entry Hall
	addRoom(3, 512, 128, 'gray'); // Great Hall
	addRoom(4, 448, 192, 'gray'); // Chapel of Meraud
	addRoom(5, 576, 192, 'gray');
	addRoom(6, 640, 192, 'gray');
	addRoom(7, 640, 256, 'gray');
	addRoom(8, 704, 256, 'gray'); // Broken Fountain
	addRoom(9, 704, 128, 'gray'); // Receving Area
	addRoom(10, 704, 64, 'gray'); // Audience Chamber
	addRoom(11, 640, 64, 'gray'); // Throne Room
	addRoom(12, 768, 64, 'gray');
	addRoom(13, 768, 128, 'gray'); // Seating Area
	addRoom(14, 768, 192, 'gray');
	addRoom(15, 704, 192, 'gray'); // Ballroom
	addRoom(16, 768, 256, 'gray');
	addRoom(17, 832, 256, 'gray'); // Dining Room
	addRoom(18, 896, 256, 'gray'); // Dining Room
	addRoom(19, 896, 320, 'gray'); // Pantry
	addRoom(20, 832, 320, 'gray'); // Kitchen
	addRoom(21, 832, 384, 'gray'); // Wash Room
	addRoom(22, 832, 448, 'gray');
	addRoom(23, 768, 320, 'gray');
	addRoom(24, 704, 384, 'gray'); // Grand Foyer
	addRoom(25, 704, 448, 'gray'); // Entry Stair
	addRoom(26, 640, 320, 'gray');
	addRoom(27, 576, 320, 'gray'); // Library
	addRoom(28, 576, 256, 'gray'); // Study
	addRoom(29, 448, 448, 'gray'); // Armory
	addRoom(30, 384, 448, 'gray');
	addRoom(31, 448, 384, 'gray'); // Larder
	addRoom(32, 384, 512, 'gray'); // Arched Chamber
	addRoom(33, 448, 512, 'gray'); // Catacombs
	addRoom(34, 384, 384, 'gray');
	addRoom(35, 384, 320, 'gray');
	addRoom(36, 320, 320, 'gray'); // Twisting Stair
	addRoom(37, 320, 384, 'gray'); // Twisting Stair
	addRoom(38, 320, 448, 'gray'); // Dungeon Guard Post
	addRoom(39, 256, 448, 'gray'); // Dungeon Guard Barracks
	addRoom(40, 192, 384, 'gray'); // Dungeon
	addRoom(41, 128, 384, 'gray'); // Cell
	addRoom(42, 256, 384, 'gray'); // Cell
	addRoom(43, 192, 320, 'gray'); // Dungeon
	addRoom(44, 128, 320, 'gray'); // Cell
	addRoom(45, 256, 320, 'gray'); // Cell
	addRoom(46, 192, 256, 'gray'); // Dungeon
	addRoom(47, 128, 256, 'gray'); // Cell
	addRoom(48, 256, 256, 'gray'); // Cell
	addRoom(49, 192, 192, 'gray'); // Drain Pipe
	addRoom(50, 128, 128, 'gray'); // Drain Pipe
	addRoom(51, 64, 128, 'gray'); // Drain Pipe
	addRoom(52, 320, 192, 'gray'); // Old Sewers
	addRoom(53, 1088, 64, 'gray'); // Prince's Chamber
	addRoom(54, 1152, 64, 'gray'); // Balcony Remains
	addRoom(55, 1088, 128, 'gray');
	addRoom(56, 1088, 256, 'gray'); // Sleeping Chamber
	addRoom(57, 1088, 320, 'gray');
	addRoom(58, 1088, 384, 'gray');
	addRoom(59, 1024, 448, 'gray');
	addRoom(60, 960, 384, 'gray');
	addRoom(61, 1024, 384, 'gray');
	addRoom(62, 1024, 320, 'gray'); // Grand Staircase

	//maze
	addBlankRoom(63, 320, 160); // n
	addBlankRoom(64, 352, 160); // ne
	addBlankRoom(65, 352, 192); // e
	addBlankRoom(66, 352, 224); // se
	addBlankRoom(67, 320, 224); // s
	addBlankRoom(68, 288, 192); // w
	addBlankRoom(69, 288, 160); // nw

	// addConnector(roomId, roomId, labelFrom1To2, labelFrom2To1)
	addConnector(0, 1);
	addConnector(1, 2, 'go tunnel');
	addConnector(2, 3);
	addConnector(4, 3, 'go door');
	addConnector(3, 5);
	addConnector(5, 6);
	addConnector(6, 7);
	addConnector(7, 8);
	addConnector(6, 9, 'go tunnel');
	addConnector(9, 10);
	addConnector(11, 10, 'go door');
	addConnector(10, 12, 'go panel');
	addConnector(9, 13, 'climb doors', 'out');
	addConnector(9, 14);
	addConnector(15, 14, 'go door');
	addConnector(14, 16);
	addConnector(16, 17, 'go door');
	addConnector(17, 18);
	addConnector(18, 19);
	addConnector(19, 20);
	addConnector(20, 21);
	addConnector(21, 22, 'go ?');
	addConnector(23, 20, 'go door');
	addConnector(23, 24);
	addConnector(24, 25);
	addConnector(24, 26);
	addConnector(26, 27);
	addConnector(27, 28);
	addConnector(29, 28, 'go hole');
	addConnector(29, 30);
	addConnector(30, 31, 'go door');
	addConnector(30, 32, 'go arch', 'out');
	addConnector(32, 33, 'go trapdoor');
	addConnector(30, 34);
	addConnector(34, 35);
	addConnector(35, 36, 'climb stair', 'up');
	addConnector(36, 37, 'down', 'up');
	addConnector(37, 38, 'down', 'climb stair');
	addConnector(38, 39);
	addConnector(40, 38, 'go wood door');
	addConnector(41, 40, 'go iron door');
	addConnector(40, 42, 'go steel door');
	addConnector(40, 43);
	addConnector(44, 43, 'go iron door');
	addConnector(43, 45, 'go steel door');
	addConnector(43, 46);
	addConnector(47, 46, 'go iron door');
	addConnector(46, 48, 'go steel door');
	addConnector(46, 49, 'go grate');
	addConnector(49, 50);
	addConnector(50, 51);
	addConnector(46, 52, 'climb ladder');
	addConnector(12, 53, 'up', 'go crawlspace');
	addConnector(53, 54);
	addConnector(53, 55);
	addConnector(55, 56, 'go door');
	addConnector(56, 57);
	addConnector(57, 58);
	addConnector(58, 59);
	addConnector(59, 60);
	addConnector(60, 61);
	addConnector(61, 62);
	addConnector(8, 62, 'climb stair');
	addConnector(52, 63);
	addConnector(52, 64);
	addConnector(52, 65);
	addConnector(52, 66);
	addConnector(52, 67);
	addConnector(52, 68);
	addConnector(52, 69);

	// add rooms to layer
	squareLayer.add(roomsGroup);

    // keep lines in sync with squares
    squareLayer.on('beforeDraw', function() {
        updateLines();
    });

    // add the layer to the stage
	stage.add(lineLayer);
    stage.add(squareLayer);
});

