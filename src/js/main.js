/* jshint browserify: true, devel: true */
"use strict";

var $ = require('jQuery');
var Konva = require('konva');
var x2js = new X2JS();

var mapScaleFactor, roomSize, showLabels, squareLayer, lineLayer, labelLayer, roomsGroup, connectors, xmin, xmax, ymin, ymax;

mapScaleFactor = 0.5;
roomSize = 8 * mapScaleFactor;
showLabels = false;
squareLayer = new Konva.Layer();
lineLayer = new Konva.Layer();
labelLayer = new Konva.Layer();
roomsGroup = new Konva.Group();
connectors = [];
xmin = 0;
xmax = 0;
ymin = 0;
ymax = 0;

function drawLines() {
	for (var key in connectors) {
		var connector = connectors[key];

		// set start and end rooms
		var start = roomsGroup.find("#" + connector.start)[0];
		var startx = start.getAbsolutePosition().x;
		var starty = start.getAbsolutePosition().y;
		var end = roomsGroup.find("#" + connector.end)[0];
		var endx = end.getAbsolutePosition().x;
		var endy = end.getAbsolutePosition().y;
		var offset = roomSize / 2;

		// draw a line from the center of the starting room to the center of the ending room
		connector.line.setPoints([startx + offset, starty + offset, endx + offset, endy + offset]);
	}

	lineLayer.draw();
}

function drawLabels() {
	if (!showLabels)
		return;

	for (var key in connectors) {
		var connector = connectors[key];

		// set start and end rooms
		var start = roomsGroup.find("#" + connector.start)[0];
		var startx = start.getAbsolutePosition().x;
		var starty = start.getAbsolutePosition().y;
		var end = roomsGroup.find("#" + connector.end)[0];
		var endx = end.getAbsolutePosition().x;
		var endy = end.getAbsolutePosition().y;

		var drawStartToEndLabel = typeof connector.startToEndLabel !== 'undefined';
		var drawEndToStartLabel = typeof connector.endToStartLabel !== 'undefined';
		var x = (startx + endx + roomSize) / 2;
		var y = (starty + endy + roomSize) / 2;

		if (drawStartToEndLabel || drawEndToStartLabel) {
			// math to draw labels at the same angle as the line
			var dx = startx - endx;
			var dy = starty - endy;
			var angle = Math.atan2(dy, dx) * 180 / Math.PI;

			// label path from start to end
			if (drawStartToEndLabel) {
				connector.startToEndLabel.position({
					x: x,
					y: y
				});
				connector.startToEndLabel.rotation(angle + 180); // need to rotate 180 degrees
			}

			// label return path from end to start
			if (drawEndToStartLabel) {
				connector.endToStartLabel.position({
					x: x,
					y: y
				});
				connector.endToStartLabel.rotation(angle);
			}
		}
	}

	labelLayer.draw();
}


function addRoom(id, x, y, color) {
	var room = new Konva.Rect({
	id: id,
	x: x,
	y: y,
	width: roomSize,
	height: roomSize,
	fill: color,
	strokeEnabled: false
	//stroke: 'black',
	//strokeWidth: 1
	});

	// TODO show room details on mouseover
	// TODO open elanthipedia URL on click?

	// add the shape to the layer
	roomsGroup.add(room);

	// save room details
	if (x > xmax) {
		xmax = x;
	}
	if (x < xmin) {
		xmin = x;
	}
	if (y > ymax) {
		ymax = y;
	}
	if (y < ymin) {
		ymin = y;
	}
}

function addBlankRoom(id, x, y) {
	var room = new Konva.Rect({
		id: id,
		x: x,
		y: y,
		visible: false
	});

	// add the shape to the layer
	roomsGroup.add(room);
}

function createConnectorId(startRoomId, endRoomId) {
	return (startRoomId < endRoomId) ? startRoomId + '-' + endRoomId : endRoomId + '-' + startRoomId;
}

function addConnector(startRoomId, endRoomId, startToEndLabel) {
	var id = createConnectorId(startRoomId, endRoomId);
	var connector = {
	start: startRoomId, // starting room id
	end: endRoomId, // ending room id
	line: new Konva.Line({
		strokeWidth: 1,
		stroke: 'black',
		id: id + "-line",
		opacity: 1,
		points: [0, 0] // points are added in drawLines()
	}),
	};

	lineLayer.add(connector.line);

	// TODO show labels on mouseover when showLabels = false?

	// label for path from starting room to ending room
	if (showLabels && typeof startToEndLabel !== 'undefined' && startToEndLabel !== null) {
		connector.startToEndLabel = new Konva.Text({
			id: id + '-startToEndLabel',
			text: startToEndLabel,
			width: 96,
			fontSize: 9,
			fontFamily: 'Arial',
			fill: 'black',
			align: 'center'
		});
		connector.startToEndLabel.setOffsetX(connector.startToEndLabel.attrs.width / 2);
		connector.startToEndLabel.setOffsetY(11);
		labelLayer.add(connector.startToEndLabel);
	}

	// add connector to array
	connectors[id] = connector;
}

// Normalize map to start at 5, 5 (top left)
function normalizeMapPoints(genieMap) {
	var lowestx = Number.MAX_SAFE_INTEGER;
	var lowesty = Number.MAX_SAFE_INTEGER;
	var mapPadding = (showLabels) ? 5 * mapScaleFactor : 0;
	var room;

	// find the lowest x, y value
	for(var i=0; i < genieMap.zone.node.length; i++) {
		room = genieMap.zone.node[i];
		var roomx = parseInt(room.position._x);
		var roomy = parseInt(room.position._y);
		if (roomx < lowestx) {
			lowestx = roomx;
		}
		if (roomy < lowesty) {
			lowesty = roomy;
		}
	}

	// adjust all rooms to start at 0, 0
	for(var j=0; j < genieMap.zone.node.length; j++) {
		room = genieMap.zone.node[j];
		room.position._x = mapScaleFactor * (mapPadding + parseInt(room.position._x) - lowestx);
		room.position._y = mapScaleFactor * (mapPadding + parseInt(room.position._y) - lowesty);
	}

	return genieMap;
}

function convertGenieConnector(roomId, zoneId, connector) {
	if (!connector._destination) {
		//console.log("mapped exit '" + connector._exit + "' for node " + roomId + " has no destination!");
		return;
	}

	var id = createConnectorId(roomId, zoneId + '-' + connector._destination);
	if (connectors[id]) {
		var existingConnector = connectors[id];

		if (!showLabels) {
			return;
		}

		if (existingConnector.endToStartLabel) {
			console.log(id + " reverse label '" + existingConnector.endToStartLabel.attrs.text + "' already exists!");
			return;
		}

		if (existingConnector.startToEndLabel) {
			if (connector._move === existingConnector.startToEndLabel.attrs.text) {
				return;
			}
		}

		// create a reverse label.
		if (connector._move && !(connector._move.endsWith('north') || connector._move.endsWith('northeast') || connector._move.endsWith('east') || connector._move.endsWith('southeast') || connector._move.endsWith('south') || connector._move.endsWith('southwest') || connector._move.endsWith('west') || connector._move.endsWith('northwest'))) {
			existingConnector.endToStartLabel = new Konva.Text({
				id: id + '-endToStartLabel',
				text: connector._move,
				width: 96,
				fontSize: 9,
				fontFamily: 'Arial',
				fill: 'black',
				align: 'center'
			});
			existingConnector.endToStartLabel.setOffsetX(existingConnector.endToStartLabel.attrs.width / 2);
			existingConnector.endToStartLabel.setOffsetY(11);
			labelLayer.add(existingConnector.endToStartLabel);
		}
		return;
	}

	if (showLabels && connector._move && !(connector._move.endsWith('north') || connector._move.endsWith('northeast') || connector._move.endsWith('east') || connector._move.endsWith('southeast') || connector._move.endsWith('south') || connector._move.endsWith('southwest') || connector._move.endsWith('west') || connector._move.endsWith('northwest'))) {
		// label non-cardinal movements
		addConnector(roomId, zoneId + '-' + connector._destination, connector._move);
	} else {
		// do not label cardinal movements
		addConnector(roomId, zoneId + '-' + connector._destination);
	}
}

function createRoomsForMap(map) {
	for (var i = 0; i < map.zone.node.length; i++) {
		var room = map.zone.node[i];
		var roomColor = room._color;
		var roomId = map.zone._id + '-' + room._id;

		// default room color
		if (!roomColor) {
			roomColor = '#808080';
		}

		addRoom(roomId, room.position._x, room.position._y, roomColor);

		if (Array.isArray(room.arc)) {
			// draw connectors
			for (var j = 0; j < room.arc.length; j++) {
				var connector = room.arc[j];
				convertGenieConnector(roomId, map.zone._id, connector);
			}
		} else if (room.arc) {
			convertGenieConnector(roomId, map.zone._id, room.arc);
		}
	}
}

function getMap(name) {
	console.log("loading: " + name);
	return x2js.xml_str2json($.ajax({
		url: "/maps/" + name,
		type: "GET",
		async: false,
		dataType: "text"
	}).responseText);
}

function stitchMaps(map, mapList, mapsToRender, renderedMaps) {
	if (!map || !map.zone || !map.zone.node) {
		console.log("map is not valid!");
		return;
	}

	// look for linked maps
	for (var i =0; i < map.zone.node.length; i++) {
		var room = map.zone.node[i];

		if (room._note) {
			var mapName = room._note.split('|')[0];
			if (mapName.endsWith('xml') && mapsToRender.indexOf(mapName) > -1 && renderedMaps.indexOf(mapName) === -1) {
				// found a linked map, align the matching rooms
				mapList[mapName] = offsetMap(room, getMap(mapName));
				renderedMaps.push(mapName);
				stitchMaps(mapList[mapName], mapList, mapsToRender, renderedMaps);
			}
		}
	}
}

function offsetMap(room1, map) {
	// find matching room
	var x = room1.position._x;
	var y = room1.position._y;

	var room2;
	for (var j=0; j < map.zone.node.length; j++) {
		room2 = map.zone.node[j];

		// match on room name (may need to make this more thorough?)
		if (room2._name === room1._name)
			break;
	}

	// transpose map to new coordinates
	var dx = parseInt(room1.position._x) - parseInt(room2.position._x);
	var dy = parseInt(room1.position._y) - parseInt(room2.position._y);

	for (var k=0; k<map.zone.node.length; k++) {
		var tempRoom = map.zone.node[k];
		tempRoom.position._x = parseInt(tempRoom.position._x) + dx;
		tempRoom.position._y = parseInt(tempRoom.position._y) + dy;
	}

	return map;
}

$(function() {
	// load map data
	console.log("stitching maps");
	var mapList = [];
	mapList["Map1_Crossing.xml"] = normalizeMapPoints(getMap("Map1_Crossing.xml"));
	var mapsToRender = [
		//"Map1_Crossing.xml",
		"Map8_Crossing_East_Gate.xml",
		"Map7_NTR.xml",
		"Map13_Dirge.xml",
		"Map14c_Faldesu.xml",
		"Map31_Riverhaven_East_Gate.xml",
		"Map30_Riverhaven.xml",
		"Map33_Riverhaven_West_Gate.xml",
		"Map33a_Road_to_Therenborough.xml",
		"Map34_Mistwood_Forest.xml",
		"Map34a_Rossman's_Landing.xml",
		"Map40_Langenfirth_to_Therenborough.xml",
		"Map42_Therenborough_and_Keep.xml",
		"Map35_Throne_City.xml",
		//"Map998_Transports.xml",
		//"Map98_Road_To_Aesry.xml",
		//"Map98a_Sea_Caves.xml",
		//"Map99_Aesry_Surlaenis'a.xml",
		//"Map150_Fang_Cove.xml",
		//"Map90_Ratha.xml",
		//"Map90a_Sand_Sprites_Ochre_La'heke.xml",
		//"Map90d_Taisgath.xml",
		//"Map95_Ratha_NE.xml",
		//"Map92_Ratha_NW.xml",
		"Map47_Muspar'i.xml",
		//"Map47a_Muspar'i_Thief.xml",
		"Map48_Haizen_Cugis.xml",
		"Map41_Marauders.xml",
		"Map61_Leth_Deriel.xml",
		"Map60_STR1.xml",
		//"Map1a_Crossing_Thief.xml",
		"Map50_Segoltha_River.xml",
		"Map4a_Tiger_Clan.xml",
		"Map4_Crossing_West_Gate.xml",
		"Map2_Lake_of_Dreams.xml",
		"Map6_Crossing_North_Gate.xml",
		"Map112_Ilaya_Taipa.xml",
		"Map113_West_Segoltha.xml",
		"Map123_Himineldar_Shel.xml",
		"Map116_Hibarnhvidar.xml",
		"Map118e_Firecats.xml",
		"Map126_Hawstkaal_Road.xml",
		"Map127_Boar_Clan.xml",
		"Map69_Shard_West_Gate.xml",
		"Map66_STR3.xml",
		"Map68_Shard_South_Gate.xml",
		"Map67_Shard.xml",
		//"Map67a_Shard_Thief.xml",
		//"Map68_shard_south_gate.xml",
		"Map68b_Lost_Ground.xml",
		"Map68a_Ice_Caves.xml",
		"Map65_Under_the_Gondola.xml",
		"Map62_STR2.xml",
		"Map63_Oshu'ehhrsk_Manor.xml",
		"Map114_Ain_Ghazal.xml",
		"Map58_Acenamacra_Village.xml",
		"Map59_Boggy_Wood.xml",
		//"Map107_Mer'Kresh.xml",
		//"Map107a_Belarritaco_Bay.xml",
		//"Map108_M'Riss.xml",
		"Map40a_Langenfirth_to_RakashTown.xml",
		"Map32_Riverhaven_North_Gate.xml",
		//"Map30b_Riverhaven_Thief.xml",
		//"Map30a_Dunshade_Manor.xml",
		"Map31a_Zaulfung.xml",
		"Map31b_Maelshyve's_Fortress.xml",
		"Map14b_Greater_Fist.xml",
		//"Map7a_Vineyard.xml",
		"Map11_Vipers_Rock_Guardians.xml",
		"Map10_Abandoned_Mine_Lairocott.xml",
		"Map9b_Sorrow's_Reach.xml",
		"Map12a_Misenseor_Abbey.xml",
		//"Drathroks_Duskruin.xml",
		//"Map8a_Lost_Crossing.xml"
		//"Map1m_Crossing_Jadewater.xml",
		//"Map2a_Temple.xml",
		//"Map2d_Escape_Tunnels.xml",
		//"Map1l_Crossing_Amusement_Pier.xml",
		//"Map1j_Market_Plaza.xml"
	];
	var renderedMaps = ["Map1_Crossing.xml"];
	stitchMaps(mapList["Map1_Crossing.xml"], mapList, mapsToRender, renderedMaps);

	if (!mapList) {
		console.log("failed to fetch map list");
		return;
	}

	for (var key in mapList) {
		var map = mapList[key];
		console.log("rendering: " + map.zone._name);
		createRoomsForMap(map);
	}

	// add rooms to layer
	squareLayer.add(roomsGroup);

	var stage = new Konva.Stage({
		container: 'container',
		width: Math.abs(parseInt(xmin)) + Math.abs(parseInt(xmax)) + roomSize,
		height: Math.abs(parseInt(ymin)) + Math.abs(parseInt(ymax)) + roomSize,
		draggable: true
	});

	squareLayer.setOffsetX(xmin);
	squareLayer.setOffsetY(ymin);

	// labels on top of squares on top of lines
	stage.add(lineLayer);
	drawLines();
	stage.add(squareLayer);

	if (showLabels) {
		stage.add(labelLayer);
		drawLabels();
	}

	// Uncomment below to pop up the result as a PNG in a new window/tab
	//var dataUrl = stage.toDataURL({
	//	mimeType: "image/png"
	//});
	//window.open(dataUrl);
});

