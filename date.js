exports.getDate = () => {
    var options = {weekday: "long", day: "numeric", month:"long"}
let today = new Date();
return today.toLocaleDateString("en-US", options);
}

exports.getDay = () => {
    var options = {weekday: "long"}
let today = new Date();
return today.toLocaleDateString("en-US", options);

}