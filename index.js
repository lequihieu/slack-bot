const fs = require('fs');
const SlackBot = require("slackbots");
const channel = "general";
const bot = new SlackBot({
    token: "xoxb-1294607140501-1289250778870-rkg51mI90ZttdqDOdTczjoSa",
    name: "lequihieu"
});

bot.on("start", function() 
{
    bot.postMessageToChannel(channel, "Hello world!");
    console.log("Hello world!");
});

bot.on("message", function(data) 
{
    if (data.type !== "message" || data.text == "Done and not scheduled" || data.text == "Not scheduled, please add user to scheduled") {
        return;
    }

    handleMessage(data.text);
});

function handleMessage(message) 
{
    var data = message.toLowerCase().split(" ");

    switch(data[0]) {
        case "add":
            addToCalendar(data[1]);
            break;
        case "show":
            showThisWeek();
            break;
        case "done":
            doneToday();
            break;
        case "no":
            notDoneToday();
            break;
        default:
            return;

    }
}
function readData() 
{
    let rawData = fs.readFileSync("data.json");
    return JSON.parse(rawData);
}
function writeData(objectData) 
{
    let newData = JSON.stringify(objectData);
    fs.writeFileSync('data.json', newData);
}
function addWork(dataUser, objectData)
{
    objectData.list_data.push(dataUser);
    return objectData;
}
function sendGreeting() 
{
    var greeting = getGreeting();
    bot.postMessageToChannel(channel, greeting);
}

function addToCalendar(dataUser) 
{
    let objectData = readData();
    let newObjectData = addWork(dataUser, objectData);
    writeData(newObjectData);
    bot.postMessageToChannel(channel, "Done!");
}
function showThisWeek() 
{
    const objectData = readData();
    const listData = objectData.list_data;
    const currentId = objectData.current_id;
    const currentDay = objectData.current_day;
    var result = "";
    const max_right = Math.min(currentId + (4 - currentDay), listData.length - 1);

    for(let i = currentId; i <= max_right; i++) 
    {
        result = result + (i - currentId + currentDay + 2).toString() + ": "+ listData[i] + ". ";
    }
    bot.postMessageToChannel(channel, result);
}

function doneToday() 
{
    var objectData = readData();
    var result = "";
    if(objectData.current_id > (objectData.list_data.length - 1)){
        bot.postMessageToChannel(channel, "Not scheduled, please add user to schedule");
        return;
    }
    if(objectData.current_id == (objectData.list_data.length - 1)) 
    {
        bot.postMessageToChannel(channel, "Done and not scheduled");
        objectData.current_id = objectData.current_id + 1;
        objectData.current_day = (objectData.current_day + 1)%5;
        writeData(objectData);
        return;
    } 
    objectData.current_id = objectData.current_id + 1;
    objectData.current_day = (objectData.current_day + 1)%5;
    writeData(objectData);
    if(objectData.current_day == 0) result = "End of the week";
    bot.postMessageToChannel(channel, "OK!! " + result);
    
}
function notDoneToday()
{
    var objectData = readData();
    const currentId = objectData.current_id;

    if(objectData.current_id > (objectData.list_data.length - 1)){
        bot.postMessageToChannel(channel, "Not scheduled, please add user to schedule");
        return;
    }
    
    if(objectData.list_data[currentId] != objectData.list_data[currentId + 1]) 
        objectData.list_data[currentId + 1] = objectData.list_data[currentId];
    else {
        objectData.list_data.splice(currentId, 0, null);
    } 
    objectData.current_id = objectData.current_id + 1;
    objectData.current_day = (objectData.current_day + 1)%5;
    writeData(objectData);
    if(objectData.current_day == 0) result = "End of the week";
    bot.postMessageToChannel(channel, "OK!! " + result);
}
