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
            // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
                console.log(query)
                const options = {
                    query: query,
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
