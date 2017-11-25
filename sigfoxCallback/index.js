/* eslint-disable max-len, camelcase, no-console, no-nested-ternary, import/no-dynamic-require, import/newline-after-import, import/no-unresolved, global-require, max-len */
//  sigfoxCallback Installation Instructions:
//  Copy and paste the entire contents of this file into a Lambda Function
//  Name: sigfoxCallback
//  Runtime: Node.js 6.10
//  Handler: index.main
//  Memory: 512 MB
//  Timeout: 1 min
//  Existing Role: lambda_iot Role, which has the LambdaExecuteIoTUpdate Policy
//    (defined in ../policy/LambdaExecuteIoTUpdate.json)
//  Debugging: Enable active tracing
//  Environment Variables: NODE_ENV=production

//  Create an API Gateway named sigfoxGateway (New API, Edge optimised)
//  In the sigfoxCallback configuration, add a trigger from sigfoxGateway
//  API Name: sigfoxGateway
//  Deployment Stage: prod
//  Security: Open
//  Method: ANY
//  Resource path: /sigfoxCallback
//  Authorization: NONE

//  Invoke URL should look like:
//  https://8xcb9t7mpj.execute-api.ap-southeast-1.amazonaws.com/prod/sigfoxCallback

/* eslint-disable no-unused-vars */
//  Use this test event for testing.  The "time" field should be set to number of seconds
//  since 1970 Jan 1 UTC (e.g. 1511614827).  Use Chrome console to compute: Date.now() / 1000
const testEvent = `{
  "body": "{\\"device\\":\\"1A2345\\",\\"data\\":\\"b0513801a421f0019405a500\\",\\"time\\":\\"1511714827\\",\\"duplicate\\":\\"false\\",\\"snr\\":\\"18.86\\",\\"station\\":\\"1D44\\",\\"avgSnr\\":\\"15.54\\",\\"lat\\":\\"1\\",\\"lng\\":\\"104\\",\\"rssi\\":\\"-123.00\\",\\"seqNumber\\":\\"1508\\",\\"ack\\":\\"false\\",\\"longPolling\\":\\"false\\"}",
  "resource": "/{proxy+}",
  "requestContext": {
    "resourceId": "123456",
    "apiId": "1234567890",
    "resourcePath": "/{proxy+}",
    "httpMethod": "POST",
    "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
    "accountId": "123456789012",
    "identity": {
      "apiKey": null,
      "userArn": null,
      "cognitoAuthenticationType": null,
      "caller": null,
      "userAgent": "Custom User Agent String",
      "user": null,
      "cognitoIdentityPoolId": null,
      "cognitoIdentityId": null,
      "cognitoAuthenticationProvider": null,
      "sourceIp": "127.0.0.1",
      "accountId": null
    },
    "stage": "prod"
  },
  "queryStringParameters": {
    "foo": "bar"
  },
  "headers": {
    "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
    "Accept-Language": "en-US,en;q=0.8",
    "CloudFront-Is-Desktop-Viewer": "true",
    "CloudFront-Is-SmartTV-Viewer": "false",
    "CloudFront-Is-Mobile-Viewer": "false",
    "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
    "CloudFront-Viewer-Country": "US",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Upgrade-Insecure-Requests": "1",
    "X-Forwarded-Port": "443",
    "Host": "1234567890.execute-api.us-east-1.amazonaws.com",
    "X-Forwarded-Proto": "https",
    "X-Amz-Cf-Id": "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
    "CloudFront-Is-Tablet-Viewer": "false",
    "Cache-Control": "max-age=0",
    "User-Agent": "Custom User Agent String",
    "CloudFront-Forwarded-Proto": "https",
    "Accept-Encoding": "gzip, deflate, sdch"
  },
  "pathParameters": {
    "proxy": "path/to/resource"
  },
  "httpMethod": "POST",
  "stageVariables": {
    "baz": "qux"
  },
  "path": "/path/to/resource"
}
`; /* eslint-enable no-unused-vars */

//  Lambda Function sigfoxCallback is exposed as a HTTPS service
//  that Sigfox Cloud will callback when delivering a Sigfox message.
//  We insert the Sigfox message into AWS IoT MQTT and AWS SQS message queue sigfox.received.
//  SQS is only used for debug display.  MQTT queues are used for the actual message routing.
//  We will return the HTTPS response immediately to Sigfox Cloud while
//  the processing of the Sigfox continues with other Lambda Functions.

//  This code is critical, all changes must be reviewed.  It must be
//  kept as simple as possible to reduce the chance of failure.

//  Helper constants to detect if we are running on Google Cloud or AWS.
const isGoogleCloud = !!process.env.FUNCTION_NAME || !!process.env.GAE_SERVICE;
const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
// const isProduction = (process.env.NODE_ENV === 'production');  //  True on production server.

process.on('uncaughtException', err => console.error('uncaughtException', err.message, err.stack));  //  Display uncaught exceptions.
process.on('unhandledRejection', (reason, p) => console.error('unhandledRejection', reason, p));
if (isGoogleCloud) {  //  Start agents for Google Cloud.
  require('dnscache')({ enable: true });  //  Enable DNS cache in case we hit the DNS quota for Google Cloud Functions.
  require('@google-cloud/trace-agent').start();  //  Must enable Google Cloud Tracing before other require()
  require('@google-cloud/debug-agent').start();  //  Must enable Google Cloud Debug before other require()
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AWS AutoInstall: List all dependencies here, or just paste the contents of package.json. Autoinstall will install these dependencies.

const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */
//  PASTE PACKAGE.JSON BELOW  //////////////////////////////////////////////////////////
  {
    "name": "sigfoxCallback",
    "version": "1.0.0",
    "author": {
      "name": "Lee Lup Yuen",
      "email": "ly.lee@unabiz.com",
      "url": "http://github.com/unabiz/"
    },
    "license": "MIT",
    "engines": {
      "node": ">=7.8.0"
    },
    "dependencies": {
      "dnscache": "^1.0.1",
      "sigfox-aws": ">=1.0.2",
      "uuid": "^3.1.0"
    }
  }
//  PASTE PACKAGE.JSON ABOVE  //////////////////////////////////////////////////////////
; /* eslint-enable quote-props,quotes,comma-dangle,indent */

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Portable Code for Google Cloud and AWS

function wrap(/* package_json */) {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.
  const scloud =
    isGoogleCloud ? require('sigfox-gcloud') :  //  sigfox-gcloud Framework
    isAWS ? require('sigfox-aws') :  //  sigfox-aws Framework
    null;
  const uuid = require('uuid');
  let wrapCount = 0;

  function getResponse(req, device0, body /* , msg */) {
    //  Compose the callback response to Sigfox Cloud and return as a promise.
    //  If body.ack is true, then we must wait for the result and return to Sigfox as the downlink data.
    //  Else tell Sigfox we will not be returning any downlink data.
    //  This lets us route the Sigfox message to another Cloud Function
    //  for processing, without Sigfox Cloud waiting for us.
    const device = device0 || 'missing_device';
    const response = {};
    if (body.ack === false || body.ack === 'false') {
      //  No downlink needed.
      response[device] = { noData: true };
      return Promise.resolve(response);
    }
    //  Wait for the result.  Must be 8 bytes hex.
    //  TODO: We hardcode the result for now.
    const result = '0123456789abcdef';
    if (result.length !== 16) throw new Error(`Result must be 8 bytes: ${result}`);
    Array.from(result.toLowerCase()).forEach((s) => {
      if (s[0] < '0' || s[0] > 'f' || (s[0] > '9' && s[0] < 'a')) {
        throw new Error(`Invalid hex digit in result: ${s[0]}`);
      }
    });
    response[device] = { downlinkData: result };
    return Promise.resolve(response);
  }

  function saveMessage(req, device, type, body, rootTraceId) {
    //  Save the received message for processing by other modules.
    //  TODO: The message saving logic is currently different for AWS and Google Cloud:
    //
    //  For AWS: Save the received message to sigfox.received queue.
    //
    //  For Google Cloud: Save the message to Google PubSub in 3 message queues:
    //  (1) sigfox.devices.all (the queue for all devices)
    //  (2) sigfox.devices.<deviceID> (the device specific queue)
    //  (3) sigfox.types.<deviceType> (the specific device type e.g. gps)
    //
    //  There may be another Cloud Function waiting on sigfox.received or sigfox.devices.all
    //  to process this message e.g. routeMessage.
    //  Where does device type come from?  It's specified in the callback URL
    //  e.g. https://myproject.appspot.com?type=gps
    scloud.log(req, 'saveMessage', { device, type, body, rootTraceId });
    const queues = [];
    const query = req.query;
    //  Compose the message and record the history.
    const message0 = { device, type, body, query, rootTraceId };
    const message = scloud.updateMessageHistory(req, message0, device);
    if (isGoogleCloud) {
      //  For Google Cloud: Send to 3 queues...
      queues.push({ device: 'all' });  //  sigfox.devices.all (the queue for all devices)
      if (type) queues.push({ type });  //  sigfox.types.<deviceType>
      //  This queue may not exist and cause errors, so we send last.
      if (device) queues.push({ device });  //  sigfox.devices.<deviceID> (the device specific queue)
    } else if (isAWS) {
      //  For AWS: Send to 1 queues - sigfox.received.
      //  We will deliver to the above 3 queues after all the routes have run.
      queues.push({ device: null, type: null });  //  (null,null) means "sigfox.received"
    }
    //  Get a list of promises, one for each publish operation to each queue.
    const promises = [];
    for (const queue of queues) {
      //  Send message to each queue, either the device ID or message type queue.
      const promise = scloud.publishMessage(req, message, queue.device, queue.type)
        .catch((error) => {
          scloud.log(req, 'saveMessage', { error, device, type, body, rootTraceId });
          return error;  //  Suppress the error so other sends can proceed.
        });
      promises.push(promise);
    }
    //  Wait for the messages to be published to the queues.
    return Promise.all(promises)
    //  Return the message with dispatch flag set so we don't resend.
      .then(() => scloud.log(req, 'saveMessage', { result: message, device, type, body, rootTraceId }))
      .then(() => Object.assign({}, message, { isDispatched: true }))
      .catch((error) => { throw error; });
  }

  function parseBool(s) {
    //  Parse a string to boolean.
    return s === 'true';
  }

  function parseSIGFOXMessage(req, body0) {  /* eslint-disable no-param-reassign */
    //  Convert Sigfox body from string to native types.
    /* body contains (Callbacks -> Body):  Example:
     {                                      {
     "device" : "{device}",               "device":"1CB0B8",
     "data" : "{data}",                   "data":"81543795",
     "time" : "{time}",                   "time":"1476980426",
     "duplicate": "{duplicate}",          "duplicate":"false",
     "snr": "{snr}",                      "snr":"18.86",
     "station": "{station}",              "station":"1D44",
     "avgSnr": "{avgSnr}",                "avgSnr":"15.54",
     "lat": "{lat}",                      "lat":"1",
     "lng": "{lng}",                      "lng":"104",
     "rssi": "{rssi}",                    "rssi":"-123.00",
     "seqNumber": "{seqNumber}",          "seqNumber":"1492",
     "ack": "{ack}",                      "ack":"false",
     "longPolling": "{longPolling}"       "longPolling":"false"
     }                                      }
     */
    const body = Object.assign({}, body0);  //  Clone the body.
    if (body.time) {
      body.time = parseInt(body.time, 10);  //  Milliseconds.
      body.timestamp = `${body.time * 1000}`;
      //  Delete "time" field because it's a special field in InfluxDB.
      body.baseStationTime = body.time;
      delete body.time;
    }
    //  Convert the text fields to boolean, int, float.
    if (body.duplicate) body.duplicate = parseBool(body.duplicate);
    if (body.snr) body.snr = parseFloat(body.snr);
    if (body.avgSnr) body.avgSnr = parseFloat(body.avgSnr);
    if (body.lat) body.lat = parseInt(body.lat, 10);
    if (body.lng) body.lng = parseInt(body.lng, 10);
    if (body.rssi) body.rssi = parseFloat(body.rssi);
    if (body.seqNumber) body.seqNumber = parseInt(body.seqNumber, 10);
    if (body.ack) body.ack = parseBool(body.ack);
    if (body.longPolling) body.longPolling = parseBool(body.longPolling);
    return body;
  } /* eslint-enable no-param-reassign */

  function task(req, device, body0, msg) {
    //  Parse the Sigfox fields and send to the queues for device ID and device type.
    //  Then send the HTTP response back to Sigfox cloud.  If there is downlink data, wait for the response.
    const res = req.res;
    const type = msg.type;
    const rootTraceId = msg.rootTraceId;
    //  Convert the text fields into number and boolean values.
    const body = parseSIGFOXMessage(req, body0);
    if (isAWS && body.baseStationTime) {
      const baseStationTime = parseInt(body.baseStationTime, 10);
      const age = Date.now() - (baseStationTime * 1000);
      console.log({ baseStationTime });
      if (age > 5 * 60 * 1000) {
        //  If older than 5 mins, reject.
        throw new Error(`too_old: ${age}`);
      }
    }
    let result = null;
    //  Send the Sigfox message to the queues.
    return saveMessage(req, device, type, body, rootTraceId)
      .then((newMessage) => { result = newMessage; return newMessage; })
      //  Wait for the downlink data if any.
      .then(() => getResponse(req, device, body0, msg))
      .catch(scloud.dumpError)
      //  Log the final result.
      .then(() => scloud.log(req, 'result', { result, device, body }))
      //  Flush the log and wait for it to be completed.
      //  After this point, don't use common.log since the log has been flushed.
      .then(() => scloud.endTask(req).catch(scloud.dumpError))
      //  Return the response to Sigfox Cloud and terminate the Cloud Function.
      //  Sigfox needs HTTP code 204 to indicate downlink.
      .then(response => res.status(204).json(response).end())
      .then(() => result);
  }

  function main(para1, para2, para3) {
    //  This function is exposed as a HTTP request to handle callbacks from
    //  Sigfox Cloud.  The Sigfox message is contained in the request.body.
    //  Get the type from URL e.g. https://myproject.appspot.com?type=gps
    console.log({ wrapCount }); wrapCount += 1;  //  Count how many times the wrapper was reused.
    //  Google Cloud and AWS pass parameters differently.
    //  We send to the respective modules to decode.
    const para = scloud.init(para1, para2, para3);
    const req = para.req;  //  HTTP Request Interface
    // const res = para.res;  //  HTTP Response Interface
    req.starttime = Date.now();
    //  Start a root-level span to trace the request across Cloud Functions.
    const rootTrace = scloud.startRootSpan(req).rootTrace;
    const rootTraceId = rootTrace.traceId;  //  Pass to other Cloud Functions.
    req.rootTraceId = rootTraceId;

    const event = null;
    const type = (req.query && req.query.type) || null;
    const uuid0 = uuid.v4();  //  Assign a UUID for message tracking.
    const callbackTimestamp = Date.now();  //  Timestamp for callback.
    const datetime = new Date(callbackTimestamp)
      .toISOString().replace('T', ' ')
      .substr(0, 19); //  For logging to Google Sheets.
    const localdatetime = new Date(callbackTimestamp + (8 * 60 * 60 * 1000))
      .toISOString().replace('T', ' ')
      .substr(0, 19); //  For convenience in writing AWS IoT Rules.
    //  Save the UUID, datetime and callback timestamp into the message.
    const body = Object.assign({ uuid: uuid0, datetime, localdatetime, callbackTimestamp },
      req.body);
    //  Get the device ID.
    const device = (body.device && typeof body.device === 'string')
      ? body.device.toUpperCase()
      : req.query.device
        ? req.query.device.toUpperCase()
        : null;
    const oldMessage = { device, body, type, rootTraceId };
    let updatedMessage = oldMessage;
    scloud.log(req, 'start', { device, body, event, rootTraceId });

    //  Now we run the task to publish the message to the queues.
    //  Wait for the publish task to complete.
    return task(req, device, body, oldMessage)
      //  At the point, don't use common.log since the log has been flushed.
      //  The response has been closed so the Cloud Function will terminate soon.
      //  Don't do any more processing here.
      .then((result) => { updatedMessage = result; })
      .catch(scloud.dumpError)
      //  Return the updated message.
      .then(() => updatedMessage);
  }

  return {
    //  Expose these functions outside of the wrapper.
    //  "main" is called to execute the wrapped function when the dependencies and wrapper have been loaded.
    main,
  };
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Standard Code for AutoInstall Startup Function.  Do not change.  https://github.com/UnaBiz/sigfox-aws/blob/master/autoinstall.js

/* eslint-disable curly, brace-style, import/no-absolute-path, no-use-before-define */
exports.main = isAWS ? ((event0, context0, callback0) => {
  //  exports.main is the AWS Lambda and Google Cloud Function startup function.
  //  When called by AWS, it loads the autoinstall script from GitHub to install any NPM dependencies.
  //  For first run, install the dependencies specified in package_json and proceed to next step.
  //  For future runs, just execute the wrapper function with the event, context, callback parameters.
  //  Returns a promise.
  if (event0.unittest || __filename.indexOf('/tmp') === 0) {
    if (!wrapper.main) wrapper = wrap(package_json);  //  Already installed or in unit test.
    return wrapper.main.bind(wrapper)(event0, context0, callback0); }  //  Run the wrapper.
  const sourceCode = require('fs').readFileSync(__filename);
  if (!autoinstallPromise) autoinstallPromise = new Promise((resolve, reject) => {
    //  Copy autoinstall.js from GitHub to /tmp and load the module.
    //  TODO: If script already in /tmp, use it.  Else download from GitHub.
    require('https').get(`https://raw.githubusercontent.com/UnaBiz/sigfox-aws/master/autoinstall.js?random=${Date.now()}`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; }); // Accumulate the data chunks.
      res.on('end', () => { //  After downloading from GitHub, save to /tmp amd load the module.
        require('fs').writeFileSync('/tmp/autoinstall.js', body);
        return resolve(require('/tmp/autoinstall')); }); })
      .on('error', (err) => { autoinstallPromise = null; console.error('setupAutoInstall failed', err.message, err.stack); return reject(err); }); });
  return autoinstallPromise
    .then(mod => mod.install(package_json, event0, context0, callback0, sourceCode))
    .catch((error) => { throw error; });
})// When exports.main is called by Google Cloud, we create
  //  a wrapper and pass 1 or 2 parameters depending on the
  //  launch mode: HTTP Mode or PubSub Queue Mode.
  //  Google Cloud handles the callback differently when we ask for different number of parameters.
  : ((process.env.FUNCTION_TRIGGER_TYPE === 'HTTP_TRIGGER')
  ? ((req0, res0) => //  HTTP request. Create a new wrapper if empty.
    Object.assign(wrapper, wrapper.main ? null : wrap())
      .main.bind(wrapper)(req0, res0))  //  Run the HTTP wrapper.
  : (event0 =>  //  PubSub or File request. Create a new wrapper if empty.
    Object.assign(wrapper, wrapper.main ? null : wrap())
      .main.bind(wrapper)(event0))  //  Run the PubSub wrapper.
); /* eslint-enable curly, brace-style, import/no-absolute-path, no-use-before-define */
let wrapper = {};  //  The single reused wrapper instance (initially empty) for invoking the module functions.
let autoinstallPromise = null;  //  Holds a cached autoinstall module for reuse.

//  //////////////////////////////////////////////////////////////////////////////////// endregion
