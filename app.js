"use strict";
const api = require("ring-client-api");
const { RingApi, RingDeviceType } = api;
const ringApi = new RingApi({
  refreshToken:
    "eyJhbGciOiJIUzUxMiIsImprdSI6Ii9vYXV0aC9pbnRlcm5hbC9qd2tzIiwia2lkIjoiYzEyODEwMGIiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE2MjQ0ODcyMTcsInJlZnJlc2hfY2lkIjoicmluZ19vZmZpY2lhbF9hbmRyb2lkIiwicmVmcmVzaF9zY29wZXMiOlsiY2xpZW50Il0sInJlZnJlc2hfdXNlcl9pZCI6MzYxOTIxMTksInJuZCI6InpIbF9DSVlqT2ZfM1NRIiwic2Vzc2lvbl9pZCI6ImY3NTk0NjY4LWZlNGYtNDUzMi04YmMyLTM3ZmUzYjY3YWI1ZiIsInR5cGUiOiJyZWZyZXNoLXRva2VuIn0.wnE5VnKCBRYncliNq7plCCFZRf6dH33me0TImUhgXI0kvYLIT4aG94rH-vq3TsFt22zVJSV4KNZTMouhYteZPQ",

  // The following are all optional. See below for details
  cameraStatusPollingSeconds: 20,
  cameraDingsPollingSeconds: 2,
  //locationIds: ['488e4800-fcde-4493-969b-d1a06f683102', '4bbed7a7-06df-4f18-b3af-291c89854d60']
});

async function idk() {
  try {
    const locations = await ringApi.getLocations();
    console.log(`~~~There are ${locations.length} locations`);
    const locaOne = locations[0];
    console.log(`~~~Location 0:\n\t${locaOne}`);
    const devices = await locaOne.getDevices();
    console.log(`~~~Locations 0 has ${devices.length} devices`);
    const cameras = await ringApi.getCameras();
    console.log(`~~~There are ${cameras.length} cameras`);
    //const frontEvents = await locaOne.getCameraEvents({ limit: 10 });

    const backCam = cameras[0];
    const frontCam = cameras[1];
    //console.log(frontCam.onNewDing);
    //console.log(`\n\tBack Camera`);

    const backCamEvents = await backCam.getEvents({ limit: 3 });
    //backCamEvents.events.forEach((element) => console.log(element.created_at));

    console.log(`\n\tFront Camera`);

    const frontCamEvents = await frontCam.getEvents({ limit: 1 });
    frontCamEvents.events.forEach((element) => console.log(element.created_at));

    frontCam.onNewDing.subscribe((ding) => {
      const event =
        ding.kind === "motion"
          ? "Motion detected"
          : ding.kind === "ding"
          ? "Doorbell pressed"
          : `Video started (${ding.kind})`;

      console.log(
        `${event} on ${frontCam.name} camera. Ding id ${
          ding.id_str
        }.  Received at ${new Date()}`
      );
      console.log(ding);
    });
  } catch (error) {
    console.error(error);
  }
}
idk();
