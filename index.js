var Service, Characteristic;
var exec = require("child_process").exec;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-cmd", "CMD", CmdAccessory);
}


function CmdAccessory(log, config) {
	this.log = log;

	// url info
	this.on_cmd   = config["on_cmd"];
	this.off_cmd  = config["off_cmd"];
	this.name = config["name"];
}

CmdAccessory.prototype = {

	cmdRequest: function(cmd, callback) {
		exec(cmd,function(error, stdout, stderr) {
				callback(error, stdout, stderr)
			})
	},

	setPowerState: function(powerOn, callback) {
		var cmd;

		if (powerOn) {
			cmd = this.on_cmd;
			this.log("Setting power state to on");
		} else {
			cmd = this.off_cmd;
			this.log("Setting power state to off");
		}

		this.cmdRequest(cmd, function(error, stdout, stderr) {
			if (error) {
				this.log('power function failed: %s', stderr);
				callback(error);
			} else {
				this.log('power function succeeded!');
				callback();
				this.log(stdout);
			}
		}.bind(this));
	},

	identify: function(callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "cmd Manufacturer")
			.setCharacteristic(Characteristic.Model, "cmd Model")
			.setCharacteristic(Characteristic.SerialNumber, "cmd Serial Number");

		var switchService = new Service.Lightbulb(this.name);

		switchService
			.getCharacteristic(Characteristic.On)
			.on('set', this.setPowerState.bind(this));

		return [switchService];
	}
};
