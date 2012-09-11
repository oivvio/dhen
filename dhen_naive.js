var http = require('http');
var fs = require('fs');



//var util = require('util');
//var events = require('events');
//var StringDecoder = require('string_decoder').StringDecoder;
//var decoder = new StringDecoder('utf8');

//var proxyhost = "http://127.0.0.1:8080";
var proxyport = 8080; 
var target = "www.dn.se";
var projectfolder = "/home/oivvio/dhen";
//var target = "oivviosarkiv.polite.se";
//var target = "forskjutningar.se";

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

http.createServer(function(request, response) {


    var pattern = RegExp("\\.");

    if ( /om_dhen/.test(request.url) ) {


        if (request.url == "/om_dhen" || request.url == "/om_dhen/") {
            var fn = projectfolder +  "/om_dhen/index.html";


        } else {
            var fn = projectfolder + request.url; 
        }



        console.log("get me " + fn);

        fs.readFile(fn, function(error, content) {
            if (error) 
                {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    var contenttype = "text/html";
                    if (fn.endsWith(".css")) {
                        var contenttype = "text/css";
                    } 
                    else if (fn.endsWith(".js")) {
                        var contenttype = "text/javascript";
                    }

                    response.writeHead(200, { 'Content-Type': contenttype });
                    response.end(content, 'utf-8');
                }
        });
    }

    else if (pattern.test(request.url)) {

        response.writeHead(302, {'Location' :  "http://" + target  + request.url});
        response.end();
    }

    else {


        var proxy = http.createClient(80, target)

        // look at the incoming request. If it's not for our server redirect
        // if it's not html redirect
        console.log(new Date() + "," + new Date().getTime(), "," + request.connection.remoteAddress + "," + request.url);
        var proxy_request = proxy.request(request.method, request.url, {});


        //Adding a listner for event "response"
        proxy_request.addListener('response', function (proxy_response) {

            //var decoder = new StringDecoder('utf8');
            var data = "";   
            //Every time "data" happens add the chunk to our data

            proxy_response.addListener('data', function(chunk) {
                //response.write(chunk, 'binary');
                //var chunkstr = decoder.write(chunk);

                //util.log("len: " + chunkstr.length);
                //data += chunkstr;
                data += chunk;

            });

            //When "end" happens trigger "end" on response
            proxy_response.addListener('end', function() {

                //at the end write all our data out

                //Before that data goes on the wire let's do some replacements
                //

                //var t1 = new Date().getTime();
                data = data.replace(/\bhan\b/g, "hen");
                data = data.replace(/\bhon\b/g, "hen");

                data = data.replace(/\bhonom\b/g, "henom");
                data = data.replace(/\bhenne\b/g, "henom");

                data = data.replace(/\bhans\b/g, "hens");
                data = data.replace(/\bhennes\b/g, "hens");

                data = data.replace(/\bman\b/g, "en");

                data = data.replace(/\bHan\b/g, "Hen");
                data = data.replace(/\bHon\b/g, "Hen");

                data = data.replace(/\bHonom\b/g, "Henom");
                data = data.replace(/\bHenne\b/g, "Henom");

                data = data.replace(/\bHans\b/g, "Hens");
                data = data.replace(/\bHennes\b/g, "Hens");

                data = data.replace(/\bMan\b/g, "En");

                data = data.replace(/\bDN\b/g, "DHEN");


                response.write(data, 'utf8');


                response.end();
            });


            response.writeHead(proxy_response.statusCode, proxy_response.headers);
        });


        request.addListener('data', function(chunk) {
            //We can comment the next line out
            proxy_request.write(chunk, 'binary');
        });


        request.addListener('end', function() {
            //util.log("a request end evetn");
            proxy_request.end();
        });
    }


}).listen(proxyport);
