Ensure that the service is named correctly in app.yaml file to prevent services from being overwritten

Also ensure that the exact pre-install scripts are kept in the package.json file, as jsreport requires headless chrome and puppeteer to function, but these have some dependencies that have to be installed first otherwise the reports will not generate.

A high timeout value for chrome has been set in the jsreport config file. This is to allow ample time for larger reports to be generated.