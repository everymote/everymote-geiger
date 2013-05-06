"use strict";
var config = require('./config');
  var cosm = require('cosm'),
        client = new cosm.Cosm(config.cosm.apiKey),
        feed = new cosm.Feed(cosm, {id: config.cosm.feed}),
        streamCpm = new cosm.Datastream(client, feed, {id: 2}),
        streamSv = new cosm.Datastream(client, feed, {id: 3});

var arduinoSerialPort = '/dev/tty.usbmodemfd1231';

var serialport = require('serialport');
var serialPort = new serialport.SerialPort(arduinoSerialPort,
{//Listening on the serial port for data coming from Arduino over USB
	baudRate: 19200,
	parser: serialport.parsers.readline('\n')
});

var lisener = function(thing){
	serialPort.on('data', function (jsonData)
	{
		try
		{
			var data = JSON.parse(jsonData);
			console.log(data);
			if(thing.socket){
				thing.socket.emit('updateInfo', "CPM: " + data.cpm + " - " + data.radiationValue + " uSv/h");
			}
			streamCpm.addPoint(data.cpm);
			streamSv.addPoint(data.radiationValue);
		}
		catch (ex)
		{
			console.warn(ex);
		}
	});
};

var createThing = function(){
    
	var thing = {};
    thing.settings = { 
		"name": 'Geiger Counter',
		"id": 2345622,
		"iconType": "Information",
		//"position": config.getPosition(),
		"actionControles": []
	};	
	lisener(thing);
	return thing;
};

module.exports.thing = createThing();