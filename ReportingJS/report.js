//file imports express, jsreport
module.exports = function (app, initJSReport, jsreport, fs) {

    // url receives json in its body which contains the html
    app.post('/inout', (req, res) => {
        console.log(req.body)
        let receivedHtml = req.body
        // jsreport renders page using received html, making use of headless-chrome and puppeteer***
            jsreport.render({
                    template: {
                      content: ``+receivedHtml.html+``,
                      engine: 'handlebars',
                      recipe: 'chrome-pdf'
                    },
                    data: {
                      foo: "world"
                    }
                  }
            ).then((resp) => {
                // when complete, buffer is converted to base64 and returned to client
                let base64data = resp.content.toString('base64');
                let data = {
                    base64: base64data
                }
                res.send(JSON.stringify(data))
              });
           
    })
    
}