'use strict';  // always start with this 
// import data from './data.js'


////////////////////////////////////////////////
//note: for /week request url, we used /go instead
////////////////////////////////////////////////

import barchart from './barchart.js'
let yLabel;

//global variable for easy access used twice
let global;
let global_yes;

/* Set default date in forms to current date */
document.getElementById('pAct-date').valueAsDate = newUTCDate();
document.getElementById('fAct-date').valueAsDate = newUTCDate();
document.getElementById('pAct-date1').valueAsDate = newUTCDate();

window.addEventListener("load", url_funct);

/* Past Activity 'Add New Activity' Button - Show Form */
let add_past_activity_button = document.getElementById("addPastActivityButton")
add_past_activity_button.addEventListener("click", add_past_activity_onclick);


/* Future Activity 'Add New Activity' Button - Show Form */
let add_future_activity_button = document.getElementById("addFutureActivityButton")
add_future_activity_button.addEventListener("click", add_future_activity_onclick);


/* Past Activity Form Dropdown */
let past_activity_dropdown = document.getElementById("pAct-activity")
past_activity_dropdown.addEventListener("change", past_activity_dropdown_onchange);


/* Past Activity 'Submit' Button - Submit Form */
let submit_past_activity_button = document.getElementById("submitPastActivityButton")
submit_past_activity_button.addEventListener("click", decide);


/* Future Activity 'Submit' Button - Submit Form */
let submit_future_activity_button = document.getElementById("submitFutureActivityButton")
submit_future_activity_button.addEventListener("click", submit_future_activity_onclick)

/*Open up past activity block when yes button on reminder is pressed */
let submit_yes_button = document.getElementById("yes");
submit_yes_button.addEventListener("click", submit_yes_button_onclick);

/*Open up past activity block when yes button on reminder is pressed */
let submit_no_button = document.getElementById("no");
submit_no_button.addEventListener("click", submit_no_button_onclick);

let overlay_on = document.getElementById("button-next-to-text-past-activity");
overlay_on.addEventListener("click", turn_overlay_on);

let overlay_off = document.getElementById("x-symbol");
overlay_off.addEventListener("click", turn_overlay_off);

let go_button = document.getElementById("go-button");
go_button.addEventListener("click", go);


//get list of events from database to display on graph
function go(){
  let activity = document.getElementById("p-activity").value;
  let date = document.getElementById("pAct-date1").value;
  let obj = {"activity":activity, "date":date};
  console.log(obj);

  fetch('/go', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj), // post body
  })
  .then(function (response){
    return(response.json());
  })
  .then(data => {
    let list = [];
    //convert date of each data to epoch
    for (let i = 0; i < (data.length); i++) {
      let date_formated = data[i].date;
      let end_of_week = new Date(date_formated);
      let epoch = end_of_week.getTime();
      list.push({
        'date': epoch,
        'value': data[i].amount
      })
    }

    if(data[0].activity == "Walk"){
      yLabel = "Kilometers Walked";
      barchart.render(list, yLabel);
    }
    else if(data[0].activity == "Run"){
      yLabel = "Kilometers Ran";
      barchart.render(list, yLabel);
    }
    else if(data[0].activity == "Swim"){
      yLabel = "Laps Swam";
      barchart.render(list, yLabel);
    }
    else if(data[0].activity == "Bike"){
      yLabel = "Kilometers Biked";
      barchart.render(list, yLabel);
    }
    else if(data[0].activity == "Yoga"){
      yLabel = "Minutes Exercised";
      barchart.render(list, yLabel);
    }
    else if(data[0].activity == "Soccer"){
      yLabel = "Minutes Played";
      barchart.render(list, yLabel);
    }
    else if(data[0].activity == "Basketball"){
      yLabel = "Minutes Played";
      barchart.render(list, yLabel);
    }
    //put date and activity into each of it's own objects
    
  })
  .catch((error) => {
    console.error('Go Error:', error);
  });
}
/**
 * ONCLICK - Hide 'Add New Activity' Button under the Past Section and Show
 * Form to Add a Past Activity
 */


function url_funct() {
  go();
  fetch('/reminder')
  .then(function (response){
    return(response.json());
  })
  .then(data => {
    global = data;
    if (data.date == 20){
      let remblock = document.getElementById("reminder");
      remblock.style.display = "none";
      let space = document.getElementById("spacer");
      space.style.display = "none";
    }
    else{
    let activityQuestion = document.getElementById("activity-question");
    if((data.activity == "Soccer") || (data.activity == "Basketball")){
      if((data.day == "yesterday")){
        activityQuestion.textContent = "Did you play "+data.activity+" "+data.day+"?";
      }
      else{
        activityQuestion.textContent = "Did you play "+data.activity+" on "+data.day+"?";
      }
    }
    else if((data.activity == "Yoga")){
      if((data.day == "yesterday")){
        activityQuestion.textContent = "Did you do "+data.activity+" "+data.day+"?";
      }
      else{
        activityQuestion.textContent = "Did you do "+data.activity+" on "+data.day+"?";
      }
    }
    else{
      if((data.day == "yesterday")){
        activityQuestion.textContent = "Did you "+data.activity+" "+data.day+"?";
      }
      else{
        activityQuestion.textContent = "Did you "+data.activity+" on "+data.day+"?";
      }
    }
  }
  })
  .catch((error) => {
  console.error('URL Error:', error);
  });
  }


function submit_yes_button_onclick(){
  //hide reminder block
  let remblock = document.getElementById("reminder");
  remblock.style.display = "none";
  let space = document.getElementById("spacer");
  space.style.display = "none";
  
  add_past_activity_onclick();
  console.log(global.date);

  let year = "20"+global.date[6].toString() + global.date[7].toString();
  let month = global.date[0].toString() + global.date[1].toString();
  let day = global.date[3].toString() + global.date[4].toString();
  let date = year+"-"+month+"-"+day;

  document.getElementById('pAct-date').value = date;
  past_activity_dropdown.value = global.activity;

  let pActUnit = document.getElementById("pAct-unit");
  /* Show Form, Hide 'Add New Activity' Button */
  switch (past_activity_dropdown.value) {
    case 'Walk': case 'Run': case 'Bike':
      pActUnit.value = 'km';
      break;
    case 'Swim':
      pActUnit.value = 'laps';
      break;
    case 'Yoga': case 'Soccer': case 'Basketball':
      pActUnit.value = 'minutes';
      break;
    default:
      pActUnit.value = 'units';
  }
  
  global_yes = 1;

}

function submit_no_button_onclick(){
  fetch('/no', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(global), // post body
  })
  .then(function (response){
    let remblock = document.getElementById("reminder");
     remblock.style.display = "none";
    let space = document.getElementById("spacer");
    space.style.display = "none";
    return(response.json());
  })
  .then(data => {
    console.log(data.msg);
  })
  .catch((error) => {
    console.error('Future Plans Error:', error);
  });
  
}

function turn_overlay_on() {
  document.getElementById("overlay").style.display = "block";
}

function turn_overlay_off() {
  document.getElementById("overlay").style.display = "none";
}

/*
function submit_yes_button(){
   //closes reminder block
   let remblock = document.getElementById("reminder");
   remblock.style.display = "none";
  
}*/

function add_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  pActAdd.classList.add("hide");
  pActForm.classList.remove("hide");
}


/**
 * ONCLICK - Hide 'Add New Activity' Button under the Future Section and Show
 * Form to Add a Future Activity
 */
function add_future_activity_onclick() {
  /* Connect to Past Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  fActAdd.classList.add("hide");
  fActForm.classList.remove("hide");
}


/**
 * ONCHANGE - Automatically Change Units in Past Activty Form to accomodate the
 * selected Activity from the dropdown menu
 */
function past_activity_dropdown_onchange() {
  /* Connect to Past Activity Unit Input */
  let pActUnit = document.getElementById("pAct-unit");

  /* Show Form, Hide 'Add New Activity' Button */
  switch (past_activity_dropdown.value) {
    case 'Walk': case 'Run': case 'Bike':
      pActUnit.value = 'km';
      break;
    case 'Swim':
      pActUnit.value = 'laps';
      break;
    case 'Yoga': case 'Soccer': case 'Basketball':
      pActUnit.value = 'minutes';
      break;
    default:
      pActUnit.value = 'units';
  }
}


/**
 * ONCLICK - Validate Past Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");
  
  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('pAct-date').value,
    activity: document.getElementById('pAct-activity').value,
    scalar: document.getElementById('pAct-scalar').value,
    units: document.getElementById('pAct-unit').value
  }
  let time = reformat_date(data.date);
  data.date = time;

  if (!past_activity_form_is_valid(data)) {  
    alert("Invalid Past Activity. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  pActAdd.classList.remove("hide");
  pActForm.classList.add("hide");
  
  /* Add 'p' tag above 'Add New Activity' Button */
  let newActivity = create_submission_success_element(   
    "Got it! ",
    `${data.activity} for ${data.scalar} ${data.units}. `,
    "Keep it up!"
  )
  insert_latest_response(pActAdd, newActivity)

  console.log('Past Activity Sending:', data);
  /* Post Activity Data to Server */
  fetch(`/store_past`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
  .then(response => response.json())
  .then(data => {
    console.log('Past Activity Success:', data);
  })
  .catch((error) => {
    console.error('Past Activity Error:', error);
  });
 
  /* Reset Form */
  document.getElementById('pAct-date').valueAsDate = newUTCDate()
  document.getElementById('pAct-activity').value = "Walk"
  document.getElementById('pAct-scalar').value = ""
  document.getElementById('pAct-unit').value = "km"
}
 

function decide(){
  if(global_yes == 1){
    submit_no_button_onclick(); //deletes future activity
    submit_past_activity_onclick();
  }
  else{
    submit_past_activity_onclick();
  }
}


//get date as month
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

/**
 * ONCLICK - Validate Future Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_future_activity_onclick() {
  /* Connect to Future Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");
  
  let date = document.getElementById('fAct-date').value;
  let activity = document.getElementById('fAct-activity').value;
  let date_formated = reformat_date(date);
  let month = get_month(date_formated);
  let day = date_formated[3].toString() + date_formated[4].toString();
  let year = "20"+date_formated[6].toString()+date_formated[7].toString();
  let future_time = new Date(month+" "+day+", "+year+" 00:00:00 GMT+00:00");

  /* Activity Data to Send to Server */
  let data = {"date" : date_formated, "activity" : activity, "epoch" : future_time.getTime()};

  /* Form Validation */
  if (!future_activity_form_is_valid(data)) {  
    alert("Invalid Future Plan. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  fActAdd.classList.remove("hide");
  fActForm.classList.add("hide");

  /* Add 'p' tag above 'Add New Activity' Button  */
  let newActivity = create_submission_success_element(
    "Sounds good! Don't forget to come back to update your session for ",
    `${activity} on ${reformat_date(date)}`,
    "!"
  )
  insert_latest_response(fActAdd, newActivity)

  console.log('Future Plans Sending:', data);

  /* Post Activity Data to Server */
  fetch('/store_future', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
  .then(function (response){
      return(response.json());
  })
  .then(data => {
    console.log(data.msg);
  })
  .catch((error) => {
    console.error('Future Plans Error:', error);
  });

  /* Reset Form */
  document.getElementById('fAct-date').valueAsDate = newUTCDate()
  document.getElementById('fAct-activity').value = "Walk"
}


/**
 * Create DOM element for acknowledgment message to send to user for submitting a form
 * @param {string} beg - regular starting section
 * @param {string} mid - bolded middle section
 * @param {string} end - regular trailing text
 * @returns {HTMLElement} DOM element combining beg, mid, end
 */
function create_submission_success_element(beg, mid, end) {
  /* Create all HTML elements to add */
  let newMessage = document.createElement('p')
  let baseText = document.createElement('span')
  let dynamicText = document.createElement('strong')
  let exclamationText = document.createElement('span')
  
  /* Update textContent of all generated DOM elements */
  baseText.textContent = beg
  dynamicText.textContent = mid
  exclamationText.textContent = end
  
  /* Append all text contents back to back in wrapper 'p' tag */
  newMessage.appendChild(baseText)
  newMessage.appendChild(dynamicText)
  newMessage.appendChild(exclamationText)

  return newMessage  
}


/**
 * Checks if past activity data is valid
 * @param {Object} data
 * @param {string} data.date - format 'mm-dd-yyyy'
 * @param {string} data.activity
 * @param {string} data.scalar - time or distance integer or float
 * @param {string} data.units - units for scalar value
 * @returns {boolean} Boolean represents if data is valid
 */
function past_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-','/'))
  if ( date != "Invalid Date" && date > newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "" || data.scalar == "" || data.units == "" )
}


/**
 * Checks if future activity data is valid
 * @param {Object} data
 * @param {string} data.date
 * @param {string} data.activity
 * @returns {boolean} Boolean represents if data is valid
 */
function future_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-','/'))
  if ( date != "Invalid Date" && date < newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "")
}


/**
 * Insert Prompt at the top of parent and remove old prompts
 * @param {HTMLElement} parent - DOM element 
 * @param {HTMLElement} child - DOM element
 */
function insert_latest_response(parent, child) {
  if(parent.children.length > 1) {
    parent.removeChild(parent.children[0])
  }
  parent.insertBefore(child, parent.childNodes[0])
}


/**
 * Convert 'yyyy-mm-dd' to 'mm/dd/yy'
 * @param {string} date 
 * @returns {string} same date, but reformated
 */
function reformat_date(date) {
  let [yyyy, mm, dd] = date.split("-");
  return `${mm}/${dd}/${yyyy.substring(2,4)}`
}


/**
 * Convert GMT date to UTC
 * @returns {Date} current date, but converts GMT date to UTC date
 */
function newUTCDate() {
  let gmtDate = new Date()
  return new Date(gmtDate.toLocaleDateString())
}
