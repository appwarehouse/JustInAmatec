module.exports = function (site, start, end, bigquery) {
        try {

            async function query() {
                const query = "SELECT CAST((EntryDateTime) AS STRING),CAST((ExitDateTime) AS STRING), " +
                "driver_card_photo_url, exit_driver_card_photo_url, exit_driver_name, exit_driver_id_no, " +
                "entry_hour, entry_minute, exit_hour, exit_minute, device_name, exit_device_name, " +
                "VehicleDetails, exit_VehicleDetails, DriverDetails, exit_DriverDetails, site_name " +
                "FROM `boomin-3f5a2.JustIN.in_out_report` " +
                "WHERE site_id = '" + site + "' " +
                "AND (entry_time BETWEEN TIMESTAMP_SECONDS(" + Math.floor(start / 1000) + ") " +
                "AND TIMESTAMP_SECONDS(" + Math.floor(end / 1000) + ")) limit 1000";

                const query2 = "SELECT 'Missing Entry' as Exception_Type, CAST((Entry_Time) AS STRING) ,CAST((Exit_Time) AS STRING), driver_card_photo_url,exit_driver_card_photo_url,exit_driver_name,exit_driver_id_no,entry_time,exit_time,device_name, exit_device_name,vehicle_licence_no as VehicleDetails, exit_vehicle_licence_no as exit_VehicleDetails,	driver_name as DriverDetails, exit_device_name as exit_DriverDetails, site_name " +
                "FROM `boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE` " +
                "WHERE site_id = '" + site + "' " +
                "AND entry_time is null " +
                "AND (entry_time BETWEEN TIMESTAMP_SECONDS(" + Math.floor(start / 1000) + ") " +
                "AND TIMESTAMP_SECONDS(" + Math.floor(end / 1000) + ")) union all "+
                "SELECT 'Missing Exit' as Exception_Type, CAST((Entry_Time) AS STRING),CAST((Exit_Time) AS STRING), driver_card_photo_url,exit_driver_card_photo_url,exit_driver_name,exit_driver_id_no,entry_time,exit_time,device_name, exit_device_name,vehicle_licence_no as VehicleDetails, exit_vehicle_licence_no as exit_VehicleDetails,	driver_name as DriverDetails, exit_device_name as exit_DriverDetails, site_name  " +
                "FROM `boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE` " +
                "where site_id = '" + site + "' " +
                "AND exit_time is null " +
                "AND (entry_time BETWEEN TIMESTAMP_SECONDS(" + Math.floor(start / 1000) + ") " +
                "AND TIMESTAMP_SECONDS(" + Math.floor(end / 1000) + ")) " +
                "union all SELECT 'Driver doesnt match' as Exception_Type, CAST((entry_time) AS STRING),CAST((exit_time) AS STRING), driver_card_photo_url,exit_driver_card_photo_url,exit_driver_name,exit_driver_id_no,entry_time,exit_time,device_name, exit_device_name,vehicle_licence_no as VehicleDetails, exit_vehicle_licence_no as exit_VehicleDetails,	driver_name as DriverDetails, exit_device_name as exit_DriverDetails, site_name  " +
                "FROM `boomin-3f5a2.JustIN.IN_OUT_EVENT_WAREHOUSE` " +
                "where entry_time is not null " +
                "AND exit_time is not null " +
                "AND site_id = '" + site + "'" +
                "AND IFNULL(driver_id_no,'') != IFNULL(exit_driver_id_no,'') " +
                "AND (entry_time BETWEEN TIMESTAMP_SECONDS(" + Math.floor(start / 1000) + ") " +
                "AND TIMESTAMP_SECONDS(" + Math.floor(end / 1000) + ")) ";

                console.log(query2)
            // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
                console.log(query)
                const options = {
                    query: query2,
                    // Location must match that of the dataset(s) referenced in the query.
                    location: 'US',
                };
                // Run the query as a job
                let [job] = await bigquery.createQueryJob(options);
                const [rows] = await job.getQueryResults();
                // Print the results
                let results = [];
                rows.forEach(row => {
                    results.push(row);
                });
                return results;
            }
            return query();
        }
        catch (e) {
            console.log("Error in query execution");
            console.log(e.stack);
            return null;
    }
}
