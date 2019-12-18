
//file imports express and bigquery to query from Google BigQuery
module.exports = function (app, bigquery) {

    //root uri returns simple string
    app.get('/', (req, res) => {
            res.send('You have arrived at your destination and the service is running')
    });

    //url bring in parameter in a string, which is then converted into an object and used as the paramenters in the bigquery request
    app.get('/query/:allparams', (req, res) => {
        let allparams = JSON.parse(req.params.allparams);
        let site = allparams.site;
        let start = allparams.start;
        let end = allparams.end;
        let devices = allparams.devices
        //runQuery method fired
        runQuery(site,start,end,devices).then((results)=>{
            //when complete, return the results from bigquery
            res.send(results)
        })
      
    });

    // asynchronous funtion to retrieve data from google
    async function runQuery(site, start, end, devices) {
        // empty string declared to later concatenate with device information to include in the main query
        let devicesString = '';
        devices.forEach((item, pos)=>{
            if(pos === 0){
                if(devices.length === 1){
                    devicesString = devicesString.concat('and (device_id ="'+item+'")')

                }else{
                    devicesString = devicesString.concat('and (device_id ="'+item+'"')
                }
            }
            if(pos > 0){ 
                if(pos === devices.length - 1){
                    devicesString = devicesString.concat(' or device_id ="'+item+'")')
                }
                else{
                    devicesString = devicesString.concat(' or device_id ="'+item+'"')
                }      
            }

            if(pos === devices.length - 1){
               
            }
            
        })
        const query = "SELECT CAST((EntryDateTime) AS STRING),CAST((ExitDateTime) AS STRING),driver_card_photo_url,exit_driver_card_photo_url,exit_driver_name,exit_driver_id_no,entry_hour,entry_minute,exit_hour,exit_minute,device_name,VehicleDetails,DriverDetails,site_name  FROM `boomin-3f5a2.JustIN.in_out_report` where site_id = '" + site + "' "+devicesString+" and (entry_time between TIMESTAMP_SECONDS(" + Math.floor(start / 1000) + ") and TIMESTAMP_SECONDS(" + Math.floor(end / 1000) + ")) limit 1000"
        // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
        // Set options for query
        const options = {
          query: query,
          // Location must match that of the dataset(s) referenced in the query.
          location: 'US',
        };

        console.log(query)
      
        // Run the query as a job
        let [job] = await bigquery.createQueryJob(options);
      
        const [rows] = await job.getQueryResults();
      
        // Print the results
        let results = []
        rows.forEach(row => {
          results.push(row);
        });
      
        //return string of all results 
        return JSON.stringify(results);
      }
}