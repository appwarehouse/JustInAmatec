module.exports = function (data) {
    async function  report_processData() {
            var exitCount;
            var enterCount;
            let masterString = ""
            data.forEach((result) => {
                if (result.exit_device_name) {
                    exitCount++;
                }
                if (result.device_name) {
                    enterCount++;
                }
                // construct data and and time information
                let entrydate = new Date(result.f0_).getDate() + '/' + (new Date(result.f0_).getMonth() + 1) + '/' + new Date(result.f0_).getFullYear();
                let entryTime = new Date(result.f0_).toLocaleTimeString();
                let exitdate;
                let minsOnSite;
                let exitTime;
                //split vehicle details to show on page line by line
                let VehicleDetailsSplit = result.VehicleDetails.split("/");
                result.VehicleDetailsSplit = VehicleDetailsSplit;
                //if there is no exit date/time
                if (!result.f1_) {
                    exitdate = "No Data";
                    minsOnSite = "No Data";
                    exitTime = "No Data";
                }
                //if the exit time is present
                else {
                    exitdate = new Date(result.f1_).getDate() + '/' + (new Date(result.f1_).getMonth() + 1) + '/' + new Date(result.f1_).getFullYear();
                    minsOnSite = Math.floor(((new Date(result.f1_) - new Date(result.f0_)) / 1000) / 60);
                    exitTime = new Date(result.f1_).toLocaleTimeString('en-GB');
                }
                if (!result.device_name) {
                    result.DriverDetails = "No Device Data";
                }
                //if there are no exit device details
                if (!result.exit_device_name) {
                    result.exit_device_name = "No Device Data";
                }
                //if there are no driver details
                if (!result.DriverDetails) {
                    result.DriverDetails = "No Driver Data";
                }
                //if there are no exit driver details
                if (!result.exit_DriverDetails) {
                    result.exit_DriverDetails = "No Driver Data";
                }
                //if there are no exit vehicle details
                if (!result.exit_VehicleDetails) {
                    result.exit_VehicleDetails = "No Vehicle Data";
                }
                //if there is no exit driver card url, replace with placeholder image
                if (!result.exit_driver_card_photo_url) {
                    result.exit_driver_card_photo_url = "https://via.placeholder.com/150";
                }
                if (!result.driver_card_photo_url) {
                    result.driver_card_photo_url = "https://via.placeholder.com/150";
                }


                if(result.Exception_Type === "Missing Entry"){
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
                    ` + entrydate + `
                    </td> 
                    <td style="vertical-align: top; text-align: left">
                    ` + entryTime + `
                    </td>
                    <td rowspan="2" style="vertical-align: top; text-align: left">
                    ` + minsOnSite + `
                    </td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.VehicleDetails + `</td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.DriverDetails + `</td>
                    <td><img src=` + result.driver_card_photo_url + ` style="width: 80px"></td>
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_VehicleDetails + `</td>                    
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_DriverDetails + `</td>
                    <td><img src=` + result.exit_driver_card_photo_url + ` style="width: 80px"></td>
                </tr>`);
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.VehicleDetails + `</td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.DriverDetails + `</td>
                    <td><img src=` + result.driver_card_photo_url + ` style="width: 80px"></td>
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_VehicleDetails + `</td>            
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_DriverDetails + `</td>
                    <td><img src=` + result.exit_driver_card_photo_url + ` style="width: 80px"></td>
                </tr>`);
                    }
                } else if(result.Exception_Type === "Missing Exit"){
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
                    ` + entrydate + `
                    </td> 
                    <td style="vertical-align: top; text-align: left">
                    ` + entryTime + `
                    </td>
                    <td rowspan="2" style="vertical-align: top; text-align: left">
                    ` + minsOnSite + `
                    </td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.VehicleDetails + `</td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.DriverDetails + `</td>
                    <td><img src=` + result.driver_card_photo_url + ` style="width: 80px"></td>
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_VehicleDetails + `</td>                    
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_DriverDetails + `</td>
                    <td><img src=` + result.exit_driver_card_photo_url + ` style="width: 80px"></td>
                </tr>`);
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.VehicleDetails + `</td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.DriverDetails + `</td>
                    <td><img src=` + result.driver_card_photo_url + ` style="width: 80px"></td>
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_VehicleDetails + `</td>            
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_DriverDetails + `</td>
                    <td><img src=` + result.exit_driver_card_photo_url + ` style="width: 80px"></td>
                </tr>`);
                    }
                }else{
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
                    ` + entrydate + `
                    </td> 
                    <td style="vertical-align: top; text-align: left">
                    ` + entryTime + `
                    </td>
                    <td rowspan="2" style="vertical-align: top; text-align: left">
                    ` + minsOnSite + `
                    </td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.VehicleDetails + `</td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.DriverDetails + `</td>
                    <td><img src=` + result.driver_card_photo_url + ` style="width: 80px"></td>
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_VehicleDetails + `</td>                    
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_DriverDetails + `</td>
                    <td><img src=` + result.exit_driver_card_photo_url + ` style="width: 80px"></td>
                </tr>`);
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.VehicleDetails + `</td>
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.DriverDetails + `</td>
                    <td><img src=` + result.driver_card_photo_url + ` style="width: 80px"></td>
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
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_VehicleDetails + `</td>            
                    <td style="vertical-align: top; text-align: left" class="format-multiline">` + result.exit_DriverDetails + `</td>
                    <td><img src=` + result.exit_driver_card_photo_url + ` style="width: 80px"></td>
                </tr>`);
                    }
                }
            });
            
            return masterString;
        }
        return report_processData();
    }
    
    
    