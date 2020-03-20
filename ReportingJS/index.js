//import all needed modules from node_modules

const express = require('express')
const app = express();
var jsreport = require('jsreport');
var fs = require('fs');
var schedule = require('node-schedule');
var cors = require('cors')

/* var bodyParser = require('body-parser'); */
const puppeteer = require('puppeteer');
const {

  BigQuery

} = require('@google-cloud/bigquery');
const nodemailer = require("nodemailer");
var cron = require('node-cron');
var admin = require('firebase-admin');
var serviceAccount = require("./firebasecredentials.json");
var initJSReport = require('jsreport')().init();
var jsftp = require('jsftp');
var cron = require('node-cron');

//instruct js.report to look for assets in the local folder
(require('jsreport-assets')({
  searchOnDiskIfNotFoundInStore: true,
  allowedFiles: '**/*.*'
}))

var jobsTracking = '';
var CurrentDate;
// Run cron job to update Warehouse database (Bigquery)
cron.schedule('* * * * *', () => {
  //CurrentDate = new Date().getTime();
  if(jobsTracking === ''){
    //testing 
    CurrentDate = new Date().toISOString();
    console.log("Date is " + CurrentDate)
    UpdateTable();
  } else if(jobsTracking === 'yes') {
    console.log('Other Jobs its still running')
  }
});

// Method to insert all entries that are not in warehouse table
async function UpdateTable() {
  console.log('Cron job started, to find all entries that are not in warehouse table but in in_out_unique')
  const query =  `INSERT INTO \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\` ( entry_time, site_name, site_id, firebase_entry_insert_id, device_id, device_name, vehicle_registration, vehicle_color, vehicle_licence_no, vin_number, vehicle_description, vehicle_engine_no, vehicle_licence_disk_no, vehicle_model, vehicle_make, driver_name, driver_id_no, driver_card_gender, driver_card_photo_url,processed_exit )
  SELECT device_timestamp , site_name, site_id, firebase_insert_id, device_id, device_name, vehicle_reg, vehicle_color, vehicle_licence_no, vin, vehicle_description, vehicle_engine_no, vehicle_licence_disk_no, vehicle_model, vehicle_make, driver_name, driver_id_no, driver_card_gender, driver_card_photo_url , false as processed_exit
  FROM \`boomin-3f5a2.JustIN.IN_OUT_unique\` 
  where firebase_insert_id NOT IN (SELECT firebase_entry_insert_id from \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE_DEV\`)
  and device_timestamp >= '2020-02-22 00:00:00.000 UTC'
  and event_type = 'GateEnter'
  order by device_timestamp asc`;
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
  };
  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} starte .`);
    console.log(`Updating table ........`);
    // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  console.log(`Done Updating table ........`);
  processed_exit_update()  
}

// Processed exit update if entry_time is greater or equal to 30 days
async function processed_exit_update() {
  jobsTracking = 'yes';
  console.log('Cron job started, to update Processed exit to true if entry_time is greater or equal to 30 days ........')
  const query =  `update \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\`
  set processed_exit = true where DATE_DIFF(CURRENT_DATE(), Date(entry_time), Day) >= 30`;
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
  };
  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);
    console.log(`Updating Processed exit to true if entry_time is greater or equal to 30 days........`);
    // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  console.log(`Done Updating Processed exit to true if entry_time is greater or equal to 30 days ........`);
  GetExitTime();
}



// Get all GateExit to match with Gate Entry
const GateEnter = [];
const NextGateEnterData = [];
const UpdateWarehouse = [];
const GetAllGateEnter = [];
const GetNextgateEnter = [];
let updatequeries = []
/* Gettting all data i will need to match GateEnter with GateExit */
            async function GettingEntryTimes() {
              jobsTracking = 'yes';
                const query = `SELECT UNIX_SECONDS(entry_time) as entry_time, site_id, vehicle_licence_no,firebase_entry_insert_id
                FROM \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\`
                where exit_time is null
                and processed_exit = false
                order by entry_time asc`;
                const options = {
                    query: query,
                    // Location must match that of the dataset(s) referenced in the query.
                    location: 'US',
                };
                // Run the query as a job
                const [job] = await bigquery.createQueryJob(options);
                console.log(`Job ${job.id} starte 
                .`);
                console.log(`Loading GateEnter Data ........`);
                // Wait for the query to finish
                const [rows] = await job.getQueryResults();

                // Print the results
                rows.forEach(row => {
                    GateEnter.push({entry_time: row.entry_time, site_id: row.site_id, vehicle_licence_no: row.vehicle_licence_no, firebase_entry_insert_id: row.firebase_entry_insert_id});
                });
                
                rows.forEach(row =>{
                    NextGateEnter(row.vehicle_licence_no, row.site_id, row.entry_time, row.firebase_entry_insert_id);
                });
                PushDataToWareHouse();
                
            }

            /* Getting the next GateEnter */
            async function NextGateEnter(licNum, siteId, entryTime, firebase_entry_insert_id) {
                //console.log('Getting NextEntry Data................');
                var myEntries = [];
                // Filtering data to get next gate enter
                myEntries = GateEnter.filter(entry => 
                    entry.vehicle_licence_no === licNum &&
                    entry.site_id === siteId && 
                    entry.entry_time > entryTime );
                if (myEntries.length > 0)
                {
                    console.log("Entry " + entryTime + " matched for " + myEntries[0].vehicle_licence_no + 
                    " count " + myEntries.length +" NextEntry "+myEntries[0].entry_time);
                    GetMatchForGateExit(entryTime, myEntries[0].entry_time, licNum, siteId, firebase_entry_insert_id);
                }
                else{
                    console.log("No match for " + licNum + " using Date.now " + Date.now());
                    GetMatchForGateExit(entryTime, Date.now(), licNum, siteId, firebase_entry_insert_id);
                }
                

                
                /*for (var i = 1 in GateEnter){
                        NextEntry_time: GateEnter[i].entry_time, 
                        vehicle_licence_no: GateEnter[i].vehicle_licence_no, 
                        firebase_entry_insert_id: GateEnter[i].firebase_entry_insert_id})
                }
                GetExitTime();*/
               
                
            }

            /* Get ExitTime */
            /* Get Exit Time */
            async function GetExitTime() {
              jobsTracking = 'yes';
              console.log('Process to get matching gateExit with GateEnter started.............');
                console.log('Getting all Exit time.................');
                    const query = `select  UNIX_SECONDS(device_timestamp) as device_timestamp, device_timestamp as device_timestamp_time,site_id, firebase_insert_id, device_id, device_name, vehicle_reg, vehicle_color,
                    vehicle_date_of_expiry,vehicle_licence_no, vin, vehicle_description, vehicle_engine_no, vehicle_licence_disk_no,
                    vehicle_model, vehicle_make, driver_name, driver_id_no, driver_card_gender, driver_card_photo_url FROM JustIN.IN_OUT_unique where device_timestamp >= '2020-02-22 00:00:00.000 UTC'
                    and event_type = 'GateExit'
                    and firebase_insert_id not in (select firebase_exit_insert_id from \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\` where firebase_exit_insert_id is not null)
                    order by device_timestamp asc`;
                    const options = {
                        query: query,
                        // Location must match that of the dataset(s) referenced in the query.
                        location: 'US',
                    };
                    // Run the query as a job
                    const [job] = await bigquery.createQueryJob(options);
                   /*  console.log(`Job ${job.id} started.`); */
                    // Wait for the query to finish
                    const [rows1] = await job.getQueryResults();
                    // Print the results
                    rows1.forEach(row => {
                       /*  console.log(row.driver_name) */
                            UpdateWarehouse.push({
                                exit_time: row.device_timestamp, 
                                exit_time_update: row.device_timestamp_time.value,
                                exit_Side_id: row.site_id, 
                                firebase_exit_insert_id: row.firebase_insert_id , 
                                exit_device_id: row.device_id , 
                                exit_device_name: row.device_name , 
                                exit_vehicle_registration : row.vehicle_reg, 
                                exit_vehicle_color: row.vehicle_color , 
                                exit_vehicle_date_of_expiry: row.vehicle_date_of_expiry.value, 
                                exit_vehicle_licence_no: row.vehicle_licence_no, 
                                exit_vin_number: row.vin, 
                                exit_vehicle_description: row.vehicle_description, 
                                exit_vehicle_engine_no: row.vehicle_engine_no, 
                                exit_vehicle_licence_disk_no: row.vehicle_licence_disk_no , 
                                exit_vehicle_mode: row.vehicle_model , 
                                exit_vehicle_make: row.vehicle_make, 
                                exit_driver_name: row.driver_name , 
                                exit_driver_id_no: row.driver_id_no, 
                                exit_driver_card_gender: row.driver_card_gender, 
                                exit_driver_card_photo_url: row.driver_card_photo_url
                            });
                           /*  console.log('GaterEnter: '+NextGateEnterData[i].GateEnterTime+" "+row.vehicle_licence_disk_no+" Exit: "+row.device_timestamp.value) */
                          /*  console.log(UpdateWarehouse) */
                          
                    });
                GettingEntryTimes();
              
            }

            // Getting Match for GateExit
            async function GetMatchForGateExit(EntryTime, NextEntryTime, vehicle_licence_no, SiteId, firebase_entry_insert_id ) {
                var MatchGateExit = [];
                let count = 0;
                MatchGateExit = UpdateWarehouse.filter(getMatch => getMatch.exit_vehicle_licence_no === vehicle_licence_no &&
                    getMatch.exit_Side_id === SiteId &&  getMatch.exit_time  > EntryTime && 
                    getMatch.exit_time < NextEntryTime );
                
                /* console.log(UpdateWarehouse); */
                if (MatchGateExit.length > 0){
                    console.log("Exit Gate Time: " + MatchGateExit[0].exit_time + " Entry Time: " +EntryTime+" count "+MatchGateExit.length)
                    console.log("==================================================================")
                    // Update Warehouse Table
                    const query = 'UPDATE `boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE`'+
                    'SET exit_time = "'+MatchGateExit[0].exit_time_update+'" , '+ 
                    'firebase_exit_insert_id = "'+MatchGateExit[0].firebase_exit_insert_id+'" , '+
                    'exit_device_id = "'+MatchGateExit[0].exit_device_id+'" , ' +
                    'exit_device_name = "'+MatchGateExit[0].exit_device_name+'" , ' +
                    'exit_vehicle_registration = "'+MatchGateExit[0].exit_vehicle_registration+'" , '+
                    'exit_vehicle_color = "'+MatchGateExit[0].exit_vehicle_color+'", ' +
                    'exit_vehicle_date_of_expiry = "'+MatchGateExit[0].exit_vehicle_date_of_expiry+'" , '+
                    'exit_vehicle_licence_no = "'+MatchGateExit[0].exit_vehicle_licence_no+'" , ' + 
                    'exit_vin_number = "'+MatchGateExit[0].exit_vin_number+'" , ' +
                    'exit_vehicle_description = "'+MatchGateExit[0].exit_vehicle_description+'" , ' +
                    'exit_vehicle_engine_no = "'+MatchGateExit[0].exit_vehicle_engine_no+'" , ' +
                    'exit_vehicle_licence_disk_no = "'+MatchGateExit[0].exit_vehicle_licence_disk_no+'" , '+  
                    'exit_vehicle_model = "'+MatchGateExit[0].exit_vehicle_mode+'" , ' + 
                    'exit_vehicle_make = "'+MatchGateExit[0].exit_vehicle_make+'" , ' + 
                    'exit_driver_name = "'+MatchGateExit[0].exit_driver_name+'" , ' + 
                    'exit_driver_id_no = "'+MatchGateExit[0].exit_driver_id_no+'" , ' + 
                    'exit_driver_card_gender = "'+MatchGateExit[0].exit_driver_card_gender+'" , ' + 
                    'exit_driver_card_photo_url = "'+MatchGateExit[0].exit_driver_card_photo_url+'" ' +
                    'where firebase_entry_insert_id = "'+firebase_entry_insert_id+'";'

                    //spit the queries into an array 
                    
                    updatequeries.push({Query: query.split(";")}) 
                } else {
                    console.log('No data')
                    console.log(count)
                    console.log("==================================================================")
                    count++;
                }
            }
            // Pushing all data after storing to array
            async function PushDataToWareHouse(){
              jobsTracking = 'yes';
                for(i in updatequeries)
                    {
                        try
                        {
                            if (updatequeries.length > 0)
                            {
                                //join the queries in the array to push to Big Qury in line with the linits
                                let limitedquery = updatequeries[i].Query.join(';');

                                const options = {
                                    query: limitedquery,
                                    // Location must match that of the dataset(s) referenced in the query.
                                    location: 'US',
                                };
                                // Run the query as a job
                                const [job] = await bigquery.createQueryJob(options);
                                 console.log(`Job ${job.id} started.`);
                                // Wait for the query to finish
                                const [rows] = await job.getQueryResults();
                            }
                            
                        }
                        catch(e)
                        {
                            //if the length of the array is less than 20 then assign the array to the variable
                            limitedqueryarray = updatequeries
                        }
              }   
              GateExit_Insert();

    }


    // Inserting all GateExit that do not have Gate Entry to warehouse table 
    async function GateExit_Insert(){
      jobsTracking = 'yes';
      console.log('Inserting all GateExit that doesnt have GateEnter');
      const query =`INSERT INTO \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\` ( exit_time, firebase_exit_insert_id, exit_device_id, exit_device_name, exit_vehicle_registration ,exit_vehicle_color,exit_vehicle_date_of_expiry,exit_vehicle_licence_no,exit_vin_number,
        exit_vehicle_description,
        exit_vehicle_engine_no,
        exit_vehicle_licence_disk_no,
        exit_vehicle_model, 
        exit_vehicle_make,
        exit_driver_name,
        exit_driver_id_no,
        exit_driver_card_gender,
        exit_driver_card_photo_url, processed_exit)
        select device_timestamp, 
        firebase_insert_id, 
        device_id, 
        device_name,
        vehicle_reg,  
        vehicle_color,
        vehicle_date_of_expiry, 
        vehicle_licence_no , 
        vin, 
        vehicle_description, 
        vehicle_engine_no, 
        vehicle_licence_disk_no, 
        vehicle_model, 
        vehicle_make, 
        device_name,
        driver_id_no, 
        driver_card_gender, 
        driver_card_photo_url,
        true as processed_exit
        from \`boomin-3f5a2.JustIN.IN_OUT_unique\` 
        where event_type = 'GateExit' 
        and device_timestamp BETWEEN '2020-02-22 00:00:00.000 UTC' AND '`+CurrentDate+`'
        and firebase_insert_id not in (select firebase_exit_insert_id from \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\` where firebase_exit_insert_id is not null)`;
        const options = {
          query: query,
          // Location must match that of the dataset(s) referenced in the query.
          location: 'US',
      };
      // Run the query as a job
      const [job] = await bigquery.createQueryJob(options);
     /*  console.log(`Job ${job.id} started.`); */
      // Wait for the query to finish
      const [rows1] = await job.getQueryResults();
      console.log('Done inserting all GateExit without GateEnter');
      jobsTracking = ''; 
    }



//initialize firebase with admin credentials
var firebaseapp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://boomin-3f5a2.firebaseio.com"
});

//set bigquery options object
const bqoptions = {
  keyFilename: './cloudcredentials.json',
  projectId: 'boomin-3f5a2',
};

 
//initialize bigquery with options from above
const bigquery = new BigQuery(bqoptions);
let exitCount = 0;
let enterCount = 0;

//initialize a list that is going to store all references to the cron schedules being run in the project
let cronList = [];

// configure express to accept JSON formatted data, and also allow CORS from all domains

app.use(express.json({

  limit: '256MB'

  /* limit: '756MB' */

}));

 

// set options for date formatting using tolocale

let options = {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: '2-digit'/*,
  hour: '2-digit',

  minute: '2-digit',

  second: '2-digit'*/

};
// BodyParse to exposes various factories to create middlewares
/* app.use(bodyParser());
app.use(bodyParser({limit: '750mb'}));
app.use(bodyParser.urlencoded({limit: '750mb'})); */

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(cors({
  credentials: true
}));


const Ftp = new jsftp({
  host: "ftp.just-in.co.za",
  port: 21, // defaults to 21
  user: "codecronie@just-in.co.za", // defaults to "anonymous"
  pass: "theappwarehouserocks" // defaults to "@anonymous"
});


// configure express to listen on the environemnt port, or if not available on port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  // After beginning to listen on port, fire the main method
  main();
})
// Schedule
// simultaneaously, pass all required modules to the other javascript files that need them
require('./query')(app, bigquery);
require('./report')(app, initJSReport, jsreport, fs);
require('./insertdata')(app, bigquery);

// Get events id from firebase into array and also save to a JSON file
require('./geteventsids')(app,firebaseapp, fs, bigquery);
firebaseapp.database().ref('events').on('value', (Snapshot) => {
  console.log(JSON.stringify(Snapshot))
})



function main() {
  try {
    // reference the schedule node and listen for any changes continously
    firebaseapp.database().ref('schedule').on('value', (Snapshot) => {
      // if cron schedules exist loop through and stop each before starting new schedules to avoid overlap
      if (cronList.length > 0) {
        cronList.forEach((item, pos) => {
          item.destroy();
          console.log("destroy cron")
          if (pos === cronList.length - 1) {
            cronList = [];
            sitesList = [];
            intervalList = [];
            recipientsList = [];
            Snapshot.forEach((item) => {
              let obj = item.val();
              // start cron using Johannesburg timezone
              this["marker_" + obj.siteUID] = cron.schedule(obj.interval, () => {
                console.log('running cron job for ' + obj.display_name + '.');
                run(obj.siteUID, obj.display_name, obj.recipients, obj.report_length)
              }, {
                timezone: "Africa/Johannesburg"
              });
              this["marker_" + obj.siteUID].start();
              console.log('start cron');
              cronList.push(this["marker_" + obj.siteUID])
            })
          }
        })
      } else {
        sitesList = [];
        intervalList = [];
        recipientsList = [];
        Snapshot.forEach((item) => {
          let obj = item.val();
          // start cron using Johannesburg timezone
          this["marker_" + obj.siteUID] = cron.schedule(obj.interval, () => {
            console.log('running cron job for ' + obj.display_name + '.');
            run(obj.siteUID, obj.display_name, obj.recipients, obj.report_length)

          }, {
            timezone: "Africa/Johannesburg"
          });
          this["marker_" + obj.siteUID].start();
          console.log('start cron');
          cronList.push(this["marker_" + obj.siteUID])
        })
      }
    })
  } catch (e) {
    console.log("Error in main");
    console.log(e.stack);
    console.log(e);

  }
}
function run(site, sitename, recipients, length) {
  try {
    exitCount = 0;
    enterCount = 0;
    let start;
    let end;
    // check and set timeframe for query to bigquery
    if (length === 'Today') {
      //set date to CAT to ensure that wherever the service is hosted you query using local (SA) time
      let startdate = new Date() //.toLocaleString("en-ZA", {timeZone:"Africa/Johannesburg"})
      let enddate = new Date()
      startdate.setHours(00)
      startdate.setMinutes(00)
      startdate.setSeconds(00)
      enddate.setHours(23)
      enddate.setMinutes(59)
      enddate.setSeconds(59)
      start = startdate;
      end = enddate
    }
    if (length === 'Previous Day') {
      //set date to CAT to ensure that wherever the service is hosted you query using local (SA) time
      let initialDate = new Date().setDate(new Date().getDate() - 1)//.toLocaleString("en-ZA", {timeZone:"Africa/Johannesburg"})
      let startdate = new Date(initialDate)
      let enddate = new Date(initialDate)
      startdate.setHours(00)
      startdate.setMinutes(00)
      startdate.setSeconds(00)
      enddate.setHours(23)
      enddate.setMinutes(59)
      enddate.setSeconds(59)
      start = startdate;
      end = enddate
    }
    if (length === 'Weekly Report') {
      //set date to CAT to ensure that wherever the service is hosted you query using local (SA) time
      let initialDate = new Date().setDate(new Date().getDate() - 7)//.toLocaleString("en-ZA", {timeZone:"Africa/Johannesburg"});
      let startdate = new Date(initialDate)
      let enddate = new Date()
      startdate.setHours(00)
      startdate.setMinutes(00)
      startdate.setSeconds(00)
      enddate.setHours(23)
      enddate.setMinutes(59)
      enddate.setSeconds(59)
      start = startdate;
      end = enddate
    }

    //run query and wait for results
    runQuery(site, start, end).then((data) => {
      // declare string to later concatenate to the html to produce a table of results
      let masterString = ""
      data.sort(function (a, b) {
        return new Date(a.f0_).getTime() - new Date(b.f0_).getTime()
      });
      if (data.length === 0) {
        //no data in report send email to recipients
        try {
          let message = "<h2>In Out Report</h2><p>" +
            "Your report for " + sitename + ", date range <strong>" + start + "</strong> to <strong>" + end +
            "</strong> had no records.</p>" +
            "<p><strong>Kind Regards<br>Just-In Reporting</strong></p>" // html body
          sendMail(recipients, sitename, start, end, '', message);
          console.log(site + "has no data for " + start + " to " + end);
        }
        catch (e) {
          console.log("Error sending no records email")
          console.log(e.stack)
        }
      }
      data.forEach((result, pos) => {
        if (result.exit_device_name) {
          exitCount++;
        }
        if (result.device_name) {
          enterCount++;
        }
        // construct data and and time information
        let entrydate = new Date(result.f0_).getDate() + '/' + (new Date(result.f0_).getMonth() + 1) + '/' + new Date(result.f0_).getFullYear()
        let entryTime = new Date(result.f0_).toLocaleTimeString();
        let exitdate;
        let minsOnSite;
        let exitTime;
        //split vehicle details to show on page line by line
        let VehicleDetailsSplit = result.VehicleDetails.split("/")
        result.VehicleDetailsSplit = VehicleDetailsSplit
        //if there is no exit date/time
        if (!result.f1_) {
          exitdate = "No Data"
          minsOnSite = "No Data"
          exitTime = "No Data"
        }
        //if the exit time is present
        else {
          exitdate = new Date(result.f1_).getDate() + '/' + (new Date(result.f1_).getMonth() + 1) + '/' + new Date(result.f1_).getFullYear()
          minsOnSite = Math.floor(((new Date(result.f1_) - new Date(result.f0_)) / 1000) / 60)
          exitTime = new Date(result.f1_).toLocaleTimeString('en-GB');
        }
        if (!result.device_name) {
          result.DriverDetails = "No Device Data"
        }
        //if there are no exit device details
        if (!result.exit_device_name) {
          result.exit_device_name = "No Device Data"
        }
        //if there are no driver details
        if (!result.DriverDetails) {
          result.DriverDetails = "No Driver Data"
        }
        //if there are no exit driver details
        if (!result.exit_DriverDetails) {
          result.exit_DriverDetails = "No Driver Data"
        }
        //if there are no exit vehicle details
        if (!result.exit_VehicleDetails) {
          result.exit_VehicleDetails = "No Vehicle Data"
        }
        //if there is no exit driver card url, replace with placeholder image
        if (!result.exit_driver_card_photo_url) {
          result.exit_driver_card_photo_url = "https://via.placeholder.com/150"
        }
        if (!result.driver_card_photo_url) {
          result.driver_card_photo_url = "https://via.placeholder.com/150"
        }
        //concatenate results
        //if there is no driver data, use driver details object, else use the split list to show line by line
        if (result.DriverDetails === "No Driver Data") {
          masterString = masterString.concat(`
          <tr>
            <td style="vertical-align: top; text-align: left">
                <strong>` + result.device_name + `</strong>
            </td>
            <td style="vertical-align: top; text-align: left">
                Entry
            </td>
            <td style="vertical-align: top; text-align: left">
            `   + entrydate + `
            </td> 
            <td style="vertical-align: top; text-align: left">
            `   + entryTime + `
            </td>
            <td rowspan="2" style="vertical-align: top; text-align: left">
            `   + minsOnSite + `
            </td>
            <td style="vertical-align: top; text-align: left" class="format-multiline">`+ result.VehicleDetails + `</td>
            <td style="vertical-align: top; text-align: left" class="format-multiline">`+ result.DriverDetails + `</td>
            <td><img src=`+ result.driver_card_photo_url + ` style="width: 80px"></td>
          </tr>
          <tr>

            <td style="vertical-align: top; text-align: left">
              <strong>` + result.exit_device_name + `</strong>
            </td>
            <td style="vertical-align: top; text-align: left">
              Exit
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + exitdate + `
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + exitTime + `
            </td>
            <td style="vertical-align: top; text-align: left" class="format-multiline">`+ result.exit_VehicleDetails + `</td>                    
            <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_DriverDetails + `</td>
            <td><img src=`+ result.exit_driver_card_photo_url + ` style="width: 80px"></td>
          </tr>`)
        }
        else {
          //not sure if this else bloc serves a purpose might need to remove this 
          //Ishe
          //29 Jan 2020
          masterString = masterString.concat(`
          <tr>
            <td style="vertical-align: top; text-align: left">
                <strong>` + result.device_name + `</strong>
            </td>
            <td style="vertical-align: top; text-align: left">
                Entry
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + entrydate + `
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + entryTime + `
            </td>
            <td rowspan="2" style="vertical-align: top; text-align: left">
            ` + minsOnSite + `
            </td>
            <td style="vertical-align: top; text-align: left" class="format-multiline">`+ result.VehicleDetails + `</td>
            <td style="vertical-align: top; text-align: left" class="format-multiline">`+ result.DriverDetails + `</td>
            <td><img src=`+ result.driver_card_photo_url + ` style="width: 80px"></td>
          </tr>
          <tr>
            <td style="vertical-align: top; text-align: left">
              <strong>` + result.device_name + `</strong>
            </td>
            <td style="vertical-align: top; text-align: left">
                Exit
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + exitdate + `
            </td>
            <td style="vertical-align: top; text-align: left">
            ` + exitTime + `
            </td>
            <td style="vertical-align: top; text-align: left" class="format-multiline">`+ result.exit_VehicleDetails + `</td>            
            <td style="vertical-align: top; text-align: left" class="format-multiline">`+ result.exit_DriverDetails + `</td>
            <td><img src=`+ result.exit_driver_card_photo_url + ` style="width: 80px"></td>
          </tr>`)
        }
        if (pos === data.length - 1) {
          //when complete, generate report
          generateReport(masterString, sitename, site, recipients, start, end);
        }
      })
    })
  } catch (e) {
    console.log("Error in run");
    console.log(e.stack);
  }
}
async function runQuery(site, start, end) {
  try {
    const query = "SELECT CAST((EntryDateTime) AS STRING),CAST((ExitDateTime) AS STRING), " +
      "driver_card_photo_url, exit_driver_card_photo_url, exit_driver_name, exit_driver_id_no, " +
      "entry_hour, entry_minute, exit_hour, exit_minute, device_name, exit_device_name, " +
      "VehicleDetails, exit_VehicleDetails, DriverDetails, exit_DriverDetails, site_name " +
      "FROM `boomin-3f5a2.JustIN.in_out_report` " +
      "WHERE site_id = '" + site + "' " +
      "AND (entry_time BETWEEN TIMESTAMP_SECONDS(" + Math.floor(start / 1000) + ") " +
      "AND TIMESTAMP_SECONDS(" + Math.floor(end / 1000) + ")) limit 1000"
    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    };
    // Run the query as a job
    let [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    // Print the results
    let results = []
    rows.forEach(row => {
      results.push(row);
    });
    return results;
  }
  catch (e) {
    console.log("Error in query execution");
    console.log(e.stack);
    return null
  }
}
function generateReport(masterString, sitename, site, recipients, start, end) {
  try {
    console.log('Report Generation for ' + sitename + 'fired... here');
    // jsreport renders page, making use of headless-chrome and puppeteer***
    jsreport.render({
      template: {
        content: `<html>
            <head>
              <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/metro/4.1.5/css/metro.min.css">
              <script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js'></script>
              <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" 
              integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            <style>
            @font-face {
              font-family: 'OpenSans-Regular';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0b.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            .format-multiline{
              white-space: pre-line;
            }
            th{
              vertical-align:top
            }
            </style>
            </head>
            <body>
                    <div style="margin:20px">
                            <div class="row">
                              <div class="col-9">
                                <h1>` + sitename + ` Report</h1>
                                <h4>Date Range: ` + new Date(start).toLocaleDateString('en-GB', options) + ` - ` +
          new Date(end).toLocaleDateString('en-GB', options) + `</h4>
                              </div>
                              <div class="col-3" style="text-align: right;">
                                <img src="{#asset JustInByAmatec.png @encoding=dataURI}" style="width: 100px;">
                              </div>
                            </div>
                          </div>
                        <div style="margin: 20px">
                                <table class='table striped'>
                                        <thead>
                                            <tr>
                                                <th>Device</th>
                                                <th>Event Type</th>
                                                <th>Event Date</th>
                                                <th>Event Time</th>
                                                <th>Minutes On Site</th>
                                                <th>Vehicle Details</th>
                                                <th>Driver Details</th>
                                                <th>Driver Photo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ` + masterString + `
                                        </tbody>
                                    </table>
                        </div>
                        <div style="margin: 20px">
                            <table class='table striped'>
                            <tr>
                              <td>
                                <h1>
                                  Total Entries
                                </h1>
                              </td>
                              <td>
                                <h1>
                                  ` + enterCount + `
                                </h1>
                              </td>
                              <td>
                                <h1>
                                  Total Exits
                                </h1>
                              </td>
                              <td>
                                <h1>
                                  ` + exitCount + `
                                </h1>
                              </td>
                            <tr>
                            </table>
                          </div>
            </body>
          </html>`,
        engine: 'handlebars',
        recipe: 'chrome-pdf'
      },data: {
        foo: "world"
      }
    }).then((resp) => {
      // write report buffer to a file stored in the folder
      let reportDate = new Date();
      let timestamp = reportDate.getTime()
      let reportname = "" + sitename + "_Report_" + timestamp + ".pdf"
      // save the file
      /*try {
        fs.writeFileSync("c:/projects/" + reportname, resp.content);
      } catch (error) {
        console.log(error);
      }*/
      Ftp.put(resp.content, "/public_html/pdfreports/" + reportname, err => {
        if (!err) {
          // send the saved file to all recipients
          sendMail(recipients, sitename, new Date(start).toLocaleDateString('en-GB', options),
          new Date(end).toLocaleDateString('en-GB', options), reportname, null);
          console.log("File transferred successfully!");
        }else {
          console.log("FTP error for report " + reportname);
          console.log(err)
        }
      });
    }
    );
  }
  catch (e) {
    console.log(e.stack)
  }
}
async function sendMail(recipients, sitename, start, end, remotefile, message) {
  try {
    if (message === null) {
      let remotelink = "http://www.just-in.co.za/pdfreports/" + remotefile
      message = "<h2>In Out Report</h2><p>" +
        "Your report for " + sitename + ", date range <strong>" + start + "</strong> to <strong>" + end +
        "</strong> has been created and is ready for you to download. <a href='" + remotelink +
        "'>Click here</a> to download, if the like does not work copy and poast the " +
        "text below into your browser<br>" + remotelink + "</p>" +
        "<p>Please note that your report will be deleted after 7 days</p>" +
        "<p><strong>Kind Regards<br>Just-In Reporting</strong></p>" // html body
    }
    // create reusable transporter object using the default SMTP transport
    console.log('Mail sending fired for site: ' + sitename + '')
    let transporter = nodemailer.createTransport({
      host: "mail.just-in.co.za",
      port: 587,
      secure: false, // true for 465, false for other port
      auth: {
        user: 'reporting@just-in.co.za', // generated ethereal user
        pass: 'u1AWNcNVgXlHIWsDzR' // generated ethereal password
      },
      tls: {
        secure: false,
        ignoreTLS: true,
        rejectUnauthorized: false
        }
    });

    let info = await transporter.sendMail({
      from: 'reporting@just-in.co.za', // sender address
      to: recipients, // list of receivers
      subject: sitename + " | In And Out Report", // Subject line
      html: message
    });
    console.log("Message sent: %s", info.messageId);
  }
  catch (e) {
    console.log("Error sending email")
    console.log(e.stack)
  }
}