module.exports = function (cron, bigquery) {

    var jobsTracking = false;
    try {
        var CurrentDate;
        var CurrentTime;
        // Run cron job to update Warehouse database (Bigquery)
        cron.schedule('* * * * *', () => {
            //CurrentDate = new Date().getTime();
            if (jobsTracking === false) {
                //testing 
                CurrentDate = new Date().toISOString();
                CurrentTime =  Date.now()
                console.log("Date is " + CurrentDate)
                UpdateTable();
            } else if (jobsTracking === true) {
                console.log('Another job is still running.')
            }
        });
        // Method to insert all entries that are not in warehouse table
        async function UpdateTable() {
            jobsTracking = true
            console.log('Insert new gate entries that are missing from warehouse.')
            const query = `INSERT INTO \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\` ( entry_time, site_name, site_id, firebase_entry_insert_id, device_id, device_name, vehicle_registration, vehicle_color, vehicle_licence_no, vin_number, vehicle_description, vehicle_engine_no, vehicle_licence_disk_no, vehicle_model, vehicle_make, driver_name, driver_id_no, driver_card_gender, driver_card_photo_url,processed_exit )
    SELECT device_timestamp , site_name, site_id, firebase_insert_id, device_id, device_name, vehicle_reg, vehicle_color, vehicle_licence_no, vin, vehicle_description, vehicle_engine_no, vehicle_licence_disk_no, vehicle_model, vehicle_make, driver_name, driver_id_no, driver_card_gender, driver_card_photo_url , false as processed_exit
    FROM \`boomin-3f5a2.JustIN.IN_OUT_unique\` 
    where firebase_insert_id NOT IN (SELECT firebase_entry_insert_id from \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\`)
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
            // Wait for the query to finish
            const [rows] = await job.getQueryResults();
            console.log(`Done inserting new Gate Entry records`);
            processed_exit_update()
        }
        // Processed exit update if entry_time is greater or equal to 30 days
        async function processed_exit_update() {
            jobsTracking = true;
            console.log('Update Processed exit to true if entry_time is greater or equal to 30 days ........')
            const query = `update \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\`
    set processed_exit = true where DATE_DIFF(CURRENT_DATE(), Date(entry_time), Day) >= 30`;
            const options = {
                query: query,
                // Location must match that of the dataset(s) referenced in the query.
                location: 'US',
            };
            // Run the query as a job
            const [job] = await bigquery.createQueryJob(options);
            // Wait for the query to finish
            const [rows] = await job.getQueryResults();
            console.log(`Updating Processed exit done ........`);
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
            jobsTracking = true;
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
            console.log(`Job ${job.id} started.`);
            console.log(`Loading GateEnter Data for matching ........`);
            // Wait for the query to finish
            const [rows] = await job.getQueryResults();

            // Print the results
            rows.forEach(row => {
                GateEnter.push({
                    entry_time: row.entry_time,
                    site_id: row.site_id,
                    vehicle_licence_no: row.vehicle_licence_no,
                    firebase_entry_insert_id: row.firebase_entry_insert_id
                });
            });

            rows.forEach(row => {
                NextGateEnter(row.vehicle_licence_no, row.site_id, row.entry_time, row.firebase_entry_insert_id);
            });
            PushDataToWareHouse();

        }
        /* Getting the next GateEnter */
        async function NextGateEnter(licNum, siteId, entryTime, firebase_entry_insert_id) {
            jobsTracking = true
            var myEntries = [];
            // Filtering data to get next gate enter
            myEntries = GateEnter.filter(entry =>
                entry.vehicle_licence_no === licNum &&
                entry.site_id === siteId &&
                entry.entry_time > entryTime);
            if (myEntries.length > 0) {
                console.log("Entry " + entryTime + " matched for " + myEntries[0].vehicle_licence_no +
                    " count (of all entries) " + myEntries.length + " NextEntry " + myEntries[0].entry_time);
                GetMatchForGateExit(entryTime, myEntries[0].entry_time, licNum, siteId, firebase_entry_insert_id);
            } else {
                console.log("No next entry match for " + licNum + " using start time of job " + CurrentTime);
                GetMatchForGateExit(entryTime, CurrentTime, licNum, siteId, firebase_entry_insert_id);
            }

        }
        async function GetExitTime() {
            jobsTracking = true;
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
                    firebase_exit_insert_id: row.firebase_insert_id,
                    exit_device_id: row.device_id,
                    exit_device_name: row.device_name,
                    exit_vehicle_registration: row.vehicle_reg,
                    exit_vehicle_color: row.vehicle_color,
                    exit_vehicle_date_of_expiry: row.vehicle_date_of_expiry.value,
                    exit_vehicle_licence_no: row.vehicle_licence_no,
                    exit_vin_number: row.vin,
                    exit_vehicle_description: row.vehicle_description,
                    exit_vehicle_engine_no: row.vehicle_engine_no,
                    exit_vehicle_licence_disk_no: row.vehicle_licence_disk_no,
                    exit_vehicle_mode: row.vehicle_model,
                    exit_vehicle_make: row.vehicle_make,
                    exit_driver_name: row.driver_name,
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
        async function GetMatchForGateExit(EntryTime, NextEntryTime, vehicle_licence_no, SiteId, firebase_entry_insert_id) {
            jobsTracking = true
            var MatchGateExit = [];
            let count = 0;
            MatchGateExit = UpdateWarehouse.filter(getMatch => getMatch.exit_vehicle_licence_no === vehicle_licence_no &&
                getMatch.exit_Side_id === SiteId && getMatch.exit_time > EntryTime &&
                getMatch.exit_time < NextEntryTime);

            /* console.log(UpdateWarehouse); */
            if (MatchGateExit.length > 0) {
                console.log("Exit Gate Time: " + MatchGateExit[0].exit_time + " Entry Time: " + EntryTime + " count " + MatchGateExit.length)
                console.log("==================================================================")
                // Update Warehouse Table
                const query = 'UPDATE `boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE`' +
                    'SET exit_time = "' + MatchGateExit[0].exit_time_update + '" , ' +
                    'firebase_exit_insert_id = "' + MatchGateExit[0].firebase_exit_insert_id + '" , ' +
                    'exit_device_id = "' + MatchGateExit[0].exit_device_id + '" , ' +
                    'exit_device_name = "' + MatchGateExit[0].exit_device_name + '" , ' +
                    'exit_vehicle_registration = "' + MatchGateExit[0].exit_vehicle_registration + '" , ' +
                    'exit_vehicle_color = "' + MatchGateExit[0].exit_vehicle_color + '", ' +
                    'exit_vehicle_date_of_expiry = "' + MatchGateExit[0].exit_vehicle_date_of_expiry + '" , ' +
                    'exit_vehicle_licence_no = "' + MatchGateExit[0].exit_vehicle_licence_no + '" , ' +
                    'exit_vin_number = "' + MatchGateExit[0].exit_vin_number + '" , ' +
                    'exit_vehicle_description = "' + MatchGateExit[0].exit_vehicle_description + '" , ' +
                    'exit_vehicle_engine_no = "' + MatchGateExit[0].exit_vehicle_engine_no + '" , ' +
                    'exit_vehicle_licence_disk_no = "' + MatchGateExit[0].exit_vehicle_licence_disk_no + '" , ' +
                    'exit_vehicle_model = "' + MatchGateExit[0].exit_vehicle_mode + '" , ' +
                    'exit_vehicle_make = "' + MatchGateExit[0].exit_vehicle_make + '" , ' +
                    'exit_driver_name = "' + MatchGateExit[0].exit_driver_name + '" , ' +
                    'exit_driver_id_no = "' + MatchGateExit[0].exit_driver_id_no + '" , ' +
                    'exit_driver_card_gender = "' + MatchGateExit[0].exit_driver_card_gender + '" , ' +
                    'exit_driver_card_photo_url = "' + MatchGateExit[0].exit_driver_card_photo_url + '" ' +
                    'where firebase_entry_insert_id = "' + firebase_entry_insert_id + '";'

                //spit the queries into an array 

                updatequeries.push({
                    Query: query.split(";")
                })
            } else {
                console.log('No data')
                console.log(count)
                console.log("==================================================================")
                count++;
            }
        }
        // Pushing all data after storing to array
        async function PushDataToWareHouse() {
            jobsTracking = true;
            for (i in updatequeries) {
                try {
                    if (updatequeries.length > 0) {
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

                } catch (e) {
                    //if the length of the array is less than 20 then assign the array to the variable
                    limitedqueryarray = updatequeries
                }
            }
            GateExit_Insert();

        }

        // Inserting all GateExit that do not have Gate Entry to warehouse table 
        async function GateExit_Insert() {
            jobsTracking = true;
            console.log('Inserting all GateExit that doesnt have GateEnter');
            const query = `INSERT INTO \`boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE\` 
            ( exit_time, 
                site_id,
                firebase_exit_insert_id, 
                exit_device_id, 
                exit_device_name, 
                exit_vehicle_registration,
                exit_vehicle_color,
                exit_vehicle_date_of_expiry,
                exit_vehicle_licence_no,
                exit_vin_number,
                exit_vehicle_description,
                exit_vehicle_engine_no,
                exit_vehicle_licence_disk_no,
                exit_vehicle_model, 
                exit_vehicle_make,
                exit_driver_name,
                exit_driver_id_no,
                exit_driver_card_gender,
                exit_driver_card_photo_url, 
                processed_exit)
          select device_timestamp, 
          site_id,
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
          driver_name,
          driver_id_no, 
          driver_card_gender, 
          driver_card_photo_url,
          true as processed_exit
          from \`boomin-3f5a2.JustIN.IN_OUT_unique\` 
          where event_type = 'GateExit' 
          and device_timestamp BETWEEN '2020-02-22 00:00:00.000 UTC' AND '` + CurrentDate + `'
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
            jobsTracking = false;
        }

    } catch (e) {
        next(e)
    }
    finally
    {
        jobsTracking = false;
    }
}