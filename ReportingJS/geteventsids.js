module.exports = function (app, firebaseapp, fs, bigquery) {
    try{
        // Get all events keys from firebase database
        app.post('/geteventsid', (req, res) => {
            const datasetName = "JustIN";
            const DIMENSION_COUNT = 20; 
            getfirebaseeventkeys();
            const eventskeys = [];
            const UpdateWarehouse = [];

            let Base64 = {
                _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                encode: function (e) {
                    var t = "";
                    var n, r, i, s, o, u, a;
                    var f = 0;
                    e = Base64._utf8_encode(e);
                    while (f < e.length) {
                        n = e.charCodeAt(f++);
                        r = e.charCodeAt(f++);
                        i = e.charCodeAt(f++);
                        s = n >> 2;
                        o = (n & 3) << 4 | r >> 4;
                        u = (r & 15) << 2 | i >> 6;
                        a = i & 63;
                        if (isNaN(r)) {
                            u = a = 64
                        } else if (isNaN(i)) {
                            a = 64
                        }
                        t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                    }
                    return t
                },
                decode: function (e) {
                    var t = "";
                    var n, r, i;
                    var s, o, u, a;
                    var f = 0;
                    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
                    while (f < e.length) {
                        s = this._keyStr.indexOf(e.charAt(f++));
                        o = this._keyStr.indexOf(e.charAt(f++));
                        u = this._keyStr.indexOf(e.charAt(f++));
                        a = this._keyStr.indexOf(e.charAt(f++));
                        n = s << 2 | o >> 4;
                        r = (o & 15) << 4 | u >> 2;
                        i = (u & 3) << 6 | a;
                        t = t + String.fromCharCode(n);
                        if (u !== 64) {
                            t = t + String.fromCharCode(r)
                        }
                        if (a !== 64) {
                            t = t + String.fromCharCode(i)
                        }
                    }
                    t = Base64._utf8_decode(t);
                    return t
                },
                _utf8_encode: function (e) {
                    e = e.replace(/rn/g, "n");
                    var t = "";
                    for (var n = 0; n < e.length; n++) {
                        var r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r)
                        } else if (r > 127 && r < 2048) {
                            t += String.fromCharCode(r >> 6 | 192);
                            t += String.fromCharCode(r & 63 | 128)
                        } else {
                            t += String.fromCharCode(r >> 12 | 224);
                            t += String.fromCharCode(r >> 6 & 63 | 128);
                            t += String.fromCharCode(r & 63 | 128)
                        }
                    }
                    return t
                },
                _utf8_decode: function (e) {
                    var t = "";
                    var n = 0;
                    var r = c1 = c2 = 0;
                    while (n < e.length) {
                        r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r);
                            n++
                        } else if (r > 191 && r < 224) {
                            c2 = e.charCodeAt(n + 1);
                            t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                            n += 2
                        } else {
                            c2 = e.charCodeAt(n + 1);
                            c3 = e.charCodeAt(n + 2);
                            t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                            n += 3
                        }
                    }
                    return t
                }
            };
            

            // Get all data from bigquery (IN-OUT-Unique)
            async function geteventkeys() {
                console.log('Getting all data from in_out unique Bigquery.................');
                console.log('Loading data ........................................')
                    const query = `select firebase_insert_id FROM JustIN.IN_OUT_unique limit 2000`;
                    const options = {
                        query: query,
                        // Location must match that of the dataset(s) referenced in the query.
                        location: 'US',
                    };
                    // Run the query as a job
                    const [job] = await bigquery.createQueryJob(options);
                    console.log(`Job ${job.id} started.`);
                    // Wait for the query to finish
                    const [rows1] = await job.getQueryResults();

                    // Print the results
                    rows1.forEach(row => {
                       /*  console.log(row.driver_name) */
                            UpdateWarehouse.push({ 
                                BigQuerykey: row.firebase_insert_id
                            });
                        /*  console.log('GaterEnter: '+NextGateEnterData[i].GateEnterTime+" "+row.vehicle_licence_disk_no+" Exit: "+row.device_timestamp.value) */
                    });
                    rows1.forEach(row => {
                        /*  console.log(row.driver_name) */
                             UpdateWarehouse.push({ 
                                 BigQuerykey: row.firebase_insert_id
                             });  
                         /*  console.log('GaterEnter: '+NextGateEnterData[i].GateEnterTime+" "+row.vehicle_licence_disk_no+" Exit: "+row.device_timestamp.value) */
                    });
                    getmissingkeys()
            }
            // Get all missing keys from biquery
            async function getfirebaseeventkeys() {
                console.log('Events fired to get events keys from firebase')
                console.log('Loading data ........................................')
                // Reference for events table to get data
               
                        var ref = firebaseapp.database().ref("event_index").child('-LuEf0BxvnBG5R7jESsD').child('10f3ace557ecb0ad');
                        ref.once("value")
                          .then(function(snapshot) {
                            console.log(snapshot.val())
                            var key = snapshot.key; 
                            console.log('key is '+snapshot.key)
                            /* var childKey = snapshot.child(childNodes1.key).key;
                            console.log(childKey) */
                          });
                   

            }
            // Getting missing keys
            async function getmissingkeys() {
                var missingkeys = [];
                console.log('Loading Missing data ........................................')
                for(const i in UpdateWarehouse){
                    missingkeys = eventskeys.filter(getMissing => getMissing.Firebasekey !== UpdateWarehouse[i].BigQuerykey);
                  /*   if (missingkeys.length > 0){
                        console.log('Matching key :'+UpdateWarehouse[i].BigQuerykey)
                    } else {
                        console.log('Missing key :'+UpdateWarehouse[i].BigQuerykey)
                    } */
                }
                InOut(missingkeys);
            }
            // Manually Update Pedestrian testing table
            async function Pedestrian(Pedestrian){
                //production table
                let tableName = IN_OUT_PEDESTRIAN_TESTING;

            }

            // Manually Update In_Out testing table
            async function InOut(Intout){
                let tableName = 'IN_OUT_UNIQUE_UPDATE'
                // Checking dataset
                let dataset = bigquery.dataset(datasetName);
                dataset.exists().catch(err => {
                    console.error(
                        `dataset.exists: dataset ${datasetName} does not exist: ${JSON.stringify(
                            err
                        )}`
                    );
                    return err
                });

                // Checking tables
                let table = dataset.table(tableName);
                table.exists().catch(err => {
                    console.error(
                        `table.exists: table ${tableName} does not exist: ${JSON.stringify(
                            err
                        )}`
                    );
                    return err
                });

                //Stringify Array
                let stringifiedSnapshot = JSON.stringify(Intout);
                let parsedObject = JSON.parse(stringifiedSnapshot);

                //Convert to Json format
                let parsed = JSON.parse(stringifiedSnapshot);
                console.log('--------Missing data Loaded ready to be inserted to bigquery ----------------')
               
                var count;
                // Variables to collect driver details
                let driverName = null;
                let driverIdNumber = null;
                let driverGender = null;

                // variables to hold vehicle disk details
                let vin = null;
                let vehicle_reg = null;
                let date_of_expiry = null;
                let description = null;
                let engine_no = null;
                let licence_disk_no = null;
                let licence_no = null;
                let model = null;
                let make = null;
                let colour = null;
                let driverPhotoUrl = null;
                let site_summaryuid = null;
                let site_summarydisplay_name = null;

                let document = parsed;
                let dimensionValueArray = []; // This array holds the values that will be assigned to the dimension1, dimension2 etc feilds of the IN_OUT table
                dimensionValueArray.fill(0, 19, null);
                
                for(var i in parsed){
                    console.log('--------------------------------------------------------------------------')
                    console.log('Data Loaded for this key: '+parsed[i].Firebasekey);
                    if (!parsed[i].Update.evidence_items) {
                        console.log('no evidence items, ignoring.');
                       
                    } else {

                        // Checking if it the driver or Pedestrian
                        if (parsed[i].Update.evidence_items.id_card) {
                            console.log('ID card data is present. Pedestrian entry/exit event');
                        } else{

                            // Checking vehicle disk
                            if(!parsed[i].Update.evidence_items.vehicle_disk){
                                console.log('Cant not find Vehicle disk details, ignoring.');
                            }else{
                                console.log('This is a Driver.-------');  
                                vin = parsed[i].Update.evidence_items.vehicle_disk.vin;
                                vehicle_reg = parsed[i].Update.evidence_items.vehicle_disk.vehicle_reg;
                                date_of_expiry = parsed[i].Update.evidence_items.vehicle_disk.date_of_expiry;
                                description = parsed[i].Update.evidence_items.vehicle_disk.description;
                                colour = parsed[i].Update.evidence_items.vehicle_disk.colour;
                                engine_no = parsed[i].Update.evidence_items.vehicle_disk.engine_no;
                                licence_disk_no = parsed[i].Update.evidence_items.vehicle_disk.licence_disk_no;
                                licence_no = parsed[i].Update.evidence_items.vehicle_disk.licence_no;
                                model = parsed[i].Update.evidence_items.vehicle_disk.model;
                                make = parsed[i].Update.evidence_items.vehicle_disk.make;

                                //commented the return false out cause sometimes
                                if (!parsed[i].Update.evidence_items.driver_card) {
                                    console.log('no driver card, ignoring.');  
                                } else {
                                    driverName = parsed[i].Update.evidence_items.driver_card.initials + " " + parsed[i].Update.evidence_items.driver_card.lastname
                                    driverIdNumber = parsed[i].Update.evidence_items.driver_card.id_no;
                                    driverGender = parsed[i].Update.evidence_items.driver_card.gender;
                                    console.log('Driver Name: '+driverName)
                                    console.log('Driver IdName: '+driverIdNumber)
                                    console.log('Driver Gender: '+driverGender)
                                }

                                //this means that you are getting your id card scanned as a pedestrian
                                if (parsed[i].Update.evidence_items.id_card) {
                                    console.log('ID card data is present. Pedestrian entry/exit event');
                                }else{
                                    console.log('ID card for Driver : '+parsed[i].Update.evidence_items.id_card);
                                }
                                // Checking Driver Card Photo
                               
                                if (document[i].Update.evidence_items.driver_card_photo) {
                                    driverPhotoUrl = document[i].Update.evidence_items.driver_card_photo.payload;
                                }

                                // Checking if Driver Card Photo exist
                                if(!document[i].Update.evidence_items.driver_card_photo){
                                    if(document[i].Update.evidence_items.driver_photo){
                                    driverPhotoUrl = document[i].Update.evidence_items.driver_photo.payload;
                                    } else {
                                        driverPhotoUrl = null
                                    }
                                }
                                // Checking dimensions
                                if (document[i].Update.evidence_items.dimensions)
                                {
                                    let dimensionsArray = document[i].Update.evidence_items.dimensions;
                                    console.log('dimensions array length is ', dimensionsArray.length);
                                    let evidenceItems = document[i].Update.evidence_items;

                                    for(var i = 0; i < DIMENSION_COUNT; i++)
                                    {
                                        if(typeof dimensionsArray[i] === 'string' || dimensionsArray[i] instanceof String)
                                        {
                                            dimensionValueArray[i] = locate(evidenceItems, dimensionsArray[i]) ? locate(evidenceItems, dimensionsArray[i]) : null;
                                            if(typeof dimensionValueArray[i] === "boolean") {
                                                if(i > 1) // The first two dimensions feilds in IN_OUT are set as numbers, the rest are set as strings
                                                {
                                                    dimensionValueArray[i] = dimensionValueArray[i] ? "true":"false";
                                                    console.log("Dimensions : "+ dimensionValueArray[i])
                                                }
                                                else{
                                                    dimensionValueArray[i] = dimensionValueArray[i] ? 1:0;
                                                    console.log("Dimensions : "+ dimensionValueArray[i])
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    console.log("Dimensions not captured")
                                }
                            }
                        }

                    }

                    let jsonObject = JSON.stringify(document[i].Update);
                    let encodedJSON = Base64.encode(jsonObject);

                    let device = document[i].Update.device;

                    // If the site summary of this device is null or undefined then do not write log because something is wrong
                    if(!document[i].Update.device) {
                        console.error("could not find device");
                    } else{
                        if(!device.site_summary){
                            console.error("could not write event because site_summary for device not set", device);
                        }else{
                            console.log('Device stie summary it is found')
                            site_summaryuid = device.site_summary.uid;
                            site_summarydisplay_name = device.site_summary.display_name;
                        }
                    }
                    console.log('--------------------------------------------------------------------------')

                    //Inserting data to bigquery testing table
                     // variables to hold vehicle disk details
               
                    let row = {
                        insertId: document[i].Firebasekey,
                        json: {
                            firebase_insert_id: document[i].Firebasekey,
                            firebase_record_timestamp: new Date(document[i].Update.created_at) / 1000,
                            device_timestamp: new Date(document[i].Update.device_time) / 1000,
                            bigquery_insert_timestamp: new Date() / 1000,
                            event_type: document[i].Update.event_type,
                            vin: vin,
                            vehicle_reg:vehicle_reg,
                            vehicle_color: colour,
                            vehicle_date_of_expiry: date_of_expiry,
                            vehicle_description: description,
                            vehicle_engine_no: engine_no,
                            vehicle_licence_disk_no: licence_disk_no,
                            vehicle_licence_no: licence_no,
                            vehicle_model: model,
                            vehicle_make: make,
                            driver_name: driverName,
                            driver_id_no: driverIdNumber,
                            driver_card_photo_url: driverPhotoUrl,
                            driver_card_gender: driverGender,
                            site_id: site_summaryuid,
                            site_name: site_summarydisplay_name,
                            device_id: device.android_id,
                            device_name: device.display_name,
                            json_object: encodedJSON,
                            dimension1: dimensionValueArray[0],
                            dimension2: dimensionValueArray[1],
                            dimension3: dimensionValueArray[2],
                            dimension4: dimensionValueArray[3],
                            dimension5: dimensionValueArray[4],
                            dimension6: dimensionValueArray[5],
                            dimension7: dimensionValueArray[6],
                            dimension8: dimensionValueArray[7],
                            dimension9: dimensionValueArray[8],
                            dimension10: dimensionValueArray[9],
                            dimension11: dimensionValueArray[10],
                            dimension12: dimensionValueArray[11],
                            dimension13: dimensionValueArray[12],
                            dimension14: dimensionValueArray[13],
                            dimension15: dimensionValueArray[14],
                            dimension16: dimensionValueArray[15],
                            dimension17: dimensionValueArray[16],
                            dimension18: dimensionValueArray[17],
                            dimension19: dimensionValueArray[18],
                            dimension20: dimensionValueArray[19]
                        },
                    };
                    console.log('row json is ', JSON.stringify(row.json));
                    table.insert(row, {raw: true}).catch(err => {
                        console.error(`table.insert: ${JSON.stringify(err)}`);
                        return err
                    })
                }
            }

            function locate(obj, path) {
                path = path.split('.');
                var arrayPattern = /(.+)\[(\d+)\]/;
                for (var i = 0; i < path.length; i++) {
                    var match = arrayPattern.exec(path[i]);
                    if (match) {
                        obj = obj[match[1]][parseInt(match[2])];
                    } else {
                        if (typeof obj[path[i]] === 'undefined') {
                            return null
                        }
                        obj = obj[path[i]];
                    }
                }
                return obj;
            }
        })
    }catch(e){
        console.log(e)
    }
}