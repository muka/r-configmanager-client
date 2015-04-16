
var ConfigManager = require('./');

var client = new ConfigManager({
    baseUrl: "http://config.raptor.local",
    userid: "415c0b7e-dd61-4633-98e6-ac0184dda324"
});

//client
//    .get('test', 'workflow')
//    .then(console.log)
//    .catch(console.warn)
//    .finally(function() { console.log("Completed GET"); })

var _val = 1.3;

console.log("Setting value to: %s", _val);
client
    .set('test', _val, 'workflow')
    .then(function() {
        return client.get('test', 'workflow')
    })
    .then(function(res) {

        console.log("Result is: %s", res);

        console.log((_val === res) ?
                "It works!" : "Values are not equals?")

    })
    .catch(function(e) {
        console.warn("An error occured!");
        console.warn(e);
    })
    .finally(function() { console.log("Completed"); })