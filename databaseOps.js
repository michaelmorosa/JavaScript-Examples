'use strict'

// using a Promises-wrapped version of sqlite3
const db = require('./sqlWrap');

// SQL commands for ActivityTable
const insertDB = "insert into ActivityTable (activity, date, amount) values (?,?,?)"
const getOneDB = "select * from ActivityTable where activity = ? and date = ? and amount = ?";
const allDB = "select * from ActivityTable where amount = ?";
const all_of_DB = "select * FROM ActivityTable";
const delDB = "delete from ActivityTable where rowIdNum = ?";

async function store_future_activity(activity, date, distance) {
  console.log("storing future activity");
  console.log(activity);
  console.log(date);
  console.log(distance);
  // all DB commands are called using await
  await db.run(insertDB, [activity, date, distance]);
  console.log("inserted one item:");
  // look at the item we just inserted
  let result = await db.get(getOneDB, [activity, date, distance]);
  console.log(result);
}


async function store_past_activity(activity, date, distance) {
  console.log("storing past activity");
  console.log(activity);
  console.log(date);
  console.log(distance);
  // all DB commands are called using await
  await db.run(insertDB, [activity, date, distance]);
  console.log("inserted one item:");
  // look at the item we just inserted
  let result = await db.get(getOneDB, [activity, date, distance]);
  console.log(result);
}


function reformat_date(date) {
  let [mm, dd, yyyy] = date.split("/");
  return `${mm}/${dd}/${yyyy}`
}

function get_month(date){
  if(date[0].toString()+date[1].toString() == "01"){
      return("January");
  }
  if(date[0].toString()+date[1].toString() == "02"){
      return("February");
  }
  if(date[0].toString()+date[1].toString() == "03"){
      return("March");
  }
  if(date[0].toString()+date[1].toString() == "04"){
      return("April");
  }
  if(date[0].toString()+date[1].toString() == "05"){
      return("May");
  }
  if(date[0].toString()+date[1].toString() == "06"){
      return("June");
  }
  if(date[0].toString()+date[1].toString() == "07"){
      return("July");
  }
  if(date[0].toString()+date[1].toString() == "08"){
      return("August");
  }
  if(date[0].toString()+date[1].toString() == "09"){
      return("September");
  }
  if(date[0].toString()+date[1].toString() == "10"){
      return("October");
  }
  if(date[0].toString()+date[1].toString() == "11"){
      return("November");
  }
  if(date[0].toString()+date[1].toString() == "12"){
      return("December");
  }
}

async function extract_future_activity() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  /*
  mm = 5; 
  dd = 1;
  yyyy = 2021;*/
  let todayform = new Date(mm + " " + dd + ", " + yyyy + " 00:00:00 GMT+00:00");
  let todayepoch = todayform.getTime();
  todayepoch = todayepoch - 25200;

  let extracted_data = await db.all(allDB, -1);

  let extracted = await db.all(all_of_DB);
  //console.log(extracted);
 
  let tracker;
  let tracker2 = 0;
  let most_recent = 0;
  let actualDay; 

  ////////get most recent activity//////
  
  for (let i = 0; i < (extracted_data.length); i++) {
    let date_formated = reformat_date(extracted_data[i].date);
    let month = get_month(date_formated);
    let day = date_formated[3].toString() + date_formated[4].toString();
    let year = "20"+date_formated[6].toString()+date_formated[7].toString();
    let future_time = new Date(month + " " + day + ", " + year + " 00:00:00 GMT+00:00");
    let future_time_epoch = future_time.getTime() + 8640000;

    //any data for older than a week(already happened)
    if ((todayepoch - 604800000) > future_time_epoch){    //60480000 is a week in epoch
      let rowNum = extracted_data[i].rowIdNum;
      //await db.run(delDB, rowNum);
    }
    //any data for most recent that happened within a week and also hasn't happened
    else{
      if (future_time_epoch >= tracker2 && todayepoch > future_time_epoch && tracker2 < todayepoch){
        let rowNum = extracted_data[i].rowIdNum;
        tracker2 = future_time_epoch;
        tracker = extracted_data[i];

        actualDay = future_time.getDay();
        if (actualDay == 0){
          actualDay = "Sunday";
        }
        if (actualDay == 1){
          actualDay = "Monday";
        }
        if (actualDay == 2){
          actualDay = "Tuesday";
        }
        if (actualDay == 3){
          actualDay = "Wednesday";
        }
        if (actualDay == 4){
          actualDay = "Thursday";
        }
        if (actualDay == 5){
          actualDay = "Friday";
        }
        if (actualDay == 6){
          actualDay = "Saturday";
        }
        tracker.day = actualDay;
      }

      else if(future_time_epoch > todayepoch){
        let rowNum = extracted_data[i].rowIdNum;
        console.log(future_time + "Hasn't happened yet!! Row: " + rowNum);
      }
    }
  };

  //console.log();
  //testDB();
  most_recent = tracker;
  //testDB();

  ////////////////////////////////////////////
  extracted_data = await db.all(all_of_DB);
  console.log(extracted_data);  // to see database

  //create object to store paceholder variable
  if(most_recent != undefined && most_recent != 0){
    if ((todayepoch - tracker2) > 86400000){
      console.log(most_recent);
      return(most_recent);
    }
    else{
      most_recent.day = "yesterday";
      return(most_recent);
    }
  }
  else{
    most_recent = {"rowIdNum":20,"activity": 20, "date" : 20, "amount" : 20}
    return(most_recent);
  } 
};
////////////////////////////////////////////////////////////////////////////////////


function reformat_dated(date) {
  let [yyyy, mm, dd] = date.split("-");
  return `${mm}/${dd}/${yyyy}`
}


async function get_list_of_activities(activity, date){
  let list = [];
  //convert end of week day to epoch
  let date_formated = reformat_dated(date);
  let end_of_week = new Date(date_formated);
  let end_of_week_epoch = end_of_week.getTime();
  let extracted_data = await db.all(all_of_DB);

  let i;
  for(i = 0; i < extracted_data.length; i++){
    //convert date to epoch
    let date_formated = reformat_date(extracted_data[i].date);
    let month = get_month(date_formated);
    let day = date_formated[3].toString() + date_formated[4].toString();
    let year = "20"+date_formated[6].toString()+date_formated[7].toString();
    let past_time = new Date(month + " " + day + ", " + year + " 00:00:00 GMT+00:00");
    let past_time_epoch = past_time.getTime();

    if(extracted_data[i].activity == activity){
      if (((end_of_week_epoch - past_time_epoch) < 604800000) && end_of_week_epoch >= past_time_epoch){
        list.push(extracted_data[i]);
      }
    }
    continue;
  }

  //add distances for activities scheduled for the same day

  //get rid of repeats
  let trash = [];
  for(let j = 0; j < list.length; j++){
    for(let k = 0; k < list.length; k++){
      if((j != k) && (list[j].date == list[k].date)){
        list[j].amount = list[j].amount + list[k].amount;
        let r = 0;
        for(let q = 0; q < trash.length; q++){
          if(list[k].date == trash[q].date){
            r = 1;
          }
        }
        if(r == 1){
          continue;
        }
        else{
          trash.push(list[k]);
        }
      }
    }
  }

  for(let i = 0; i < trash.length; i++){
    for(let j = 0; j < list.length; j++){
      if(trash[i] == list[j]){
        delete(list[j]);
        j--;
      }
    }
  }
  

  let now_list = [];
  for(let i = 0; i < list.length; i++){
    if(list[i] != undefined){
      now_list.push(list[i]);
    }
   }

  let epoch_list = [];
  //convert dates to epoch and order activities so that they go in order
  for(let i = 0; i < now_list.length; i++) {
      let date_formated = now_list[i].date;
      let time = new Date(date_formated);
      let epoch = time.getTime();
      epoch_list.push(epoch);
  }
  
  epoch_list.sort();
  let final_list = [];
  for(let i = 0; i < (now_list.length); i++) {
      for(let j = 0; j < (now_list.length); j++) {
        let date_formated = now_list[j].date;
        let time = new Date(date_formated);
        let epoch = time.getTime();

        if(epoch_list[i] == epoch){
          final_list.push(now_list[j]);
          break;
        }
      }
  }

  function epoch_to_date(epoch) {
    let dateObject = new Date(epoch)
    let day = dateObject.getDate();
    let year = dateObject.getFullYear();
    let month = dateObject.getMonth()+1;
    
      //get day in correct form
    day = day.toString();
    if(day.length == 1){
    day = "0"+day[0];
    }
    //get month in correct form
    month = month.toString();
    if(month.length == 1){
      month = "0"+month[0];
    }
    //correct month
    year = year - 2000;

    let new_date = month.toString()+"/"+day.toString()+"/"+year.toString();
    return(new_date);
  }

  //get epoch time and subtract one week
  //start at that beginning of the week and add a day each time in epoch to the current time iteration, comparing the epoch time with the object date(in epoch) right after
  //if they aren't equal, then add in an object with the same activity as the others, with that date of the current time iteration and distance 0(to show that they didn't do anything that day)
  
  let empties = [];
  let date_format = reformat_dated(date);
  let time = new Date(date_format);
  let epoch = time.getTime();
  epoch = epoch + 25200000 - 518400000;
  empties.push({"activity":activity, "date":epoch_to_date(epoch), "amount":0});

  for(let i = 0; i < 6; i++) {
    epoch = epoch + (86400000);
    empties.push({"activity":activity, "date":epoch_to_date(epoch), "amount":0});
  }

  for(let j = 0; j < empties.length; j++) {
    for(let k = 0; k < final_list.length; k++) {
      if(empties[j].date == final_list[k].date){
        empties[j] = final_list[k];
        break;
      }
    }
  }

  return(empties);
}


async function delete_activity(rowIdNum, activity, date, amount){
  await db.run(delDB,rowIdNum);
  let extracted_data = await db.all(allDB, -1);
  console.log(extracted_data);
}

module.exports.store_past_activity = store_past_activity;
module.exports.store_future_activity = store_future_activity;
module.exports.extract_future_activity = extract_future_activity;
module.exports.delete_activity = delete_activity;
module.exports.get_list_of_activities = get_list_of_activities;


async function testDB() {
  // for testing, always use today's date
  //const today = new Date().getTime();

  // all DB commands are called using await

  // empty out database - probably you don't want to do this in your program

  
  await db.run(insertDB,['Walk','04/29/21',-1]);

  /*
  await db.run(insertDB,["Walk","04/18/21",5]);
  await db.run(insertDB,["Swim","04/15/21",6]);
  await db.run(insertDB,["Run","04/16/21",8]);
  //console.log(extracted_data);
  await db.run(insertDB,["Run","04/17/21",7]);
  await db.run(insertDB,["Soccer","04/15/21",4]);
  await db.run(insertDB,["Basketball","04/15/21",3]);

  await db.run(insertDB,["Yoga","04/10/21",9]);
  await db.run(insertDB,["Walk","04/11/21",6]);
  await db.run(insertDB,["Swim","04/12/21",5]);
  await db.run(insertDB,["Run","04/9/21",4]);
  //let extracted_data = await db.all(allDB, -1);
  //console.log(extracted_data);
  await db.run(insertDB,["Run","04/4/21",1]);
  await db.run(insertDB,["Soccer","04/9/21",3]);
  await db.run(insertDB,["Basketball","04/8/21",2]);*/
  /////////////edited by michael////////////

  /////////////edited by michael////////////
  
  /*
  console.log("inserted two items");

  // look at the item we just inserted
  let result = await db.get(getOneDB,["running",today,2.4]);
  console.log(result);

  // get multiple items as a list
  result = await db.all(allDB,["walking"]);
  console.log(result);*/
}