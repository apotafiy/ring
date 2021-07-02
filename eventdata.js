"use strict";
//const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("dotenv").config();
const fs = require("fs");

const api = require("ring-client-api");
const { RingApi, RingDeviceType } = api;
const ringApi = new RingApi({
  refreshToken: process.env.RING_REFRESH_TOKEN,

  cameraStatusPollingSeconds: 20,
  cameraDingsPollingSeconds: 2,
});
const CSV_NAME = "camera_data";

const CSV_HEADER =
  "ring_ID,Week_Day,Month_Date,Month,Year,Time,Doorbot_Description,Kind,Detection_Type";

function parseDing(ding) {
  const id = ding.id;
  const doorbotDescription = ding.doorbot_description;
  const kind = ding.kind;
  const detectionType = ding.detection_type;
  return { id, doorbotDescription, kind, detectionType };
}

function DingData(ding) {
  const parsedDing = parseDing(ding);
  // TODO: may need to use dependancy injection to make testing easier
  const { id, doorbotDescription, kind, detectionType } = parsedDing;
  const ring_ID = id;

  const date = new Date();
  // ['Thu', 'Jul', '01', '2021', '15:25:59', 'GMT-0700', '(Pacific', 'Daylight', 'Time)']
  const dateArr = date.toString().split(" ");

  const Week_Day = dateArr[0];
  const Month_Date = dateArr[2];
  const Month = dateArr[1];
  const Year = dateArr[3];
  const Time = dateArr[4];
  const Doorbot_Description = doorbotDescription;
  const Kind = kind;
  const Detection_Type = detectionType;
  return {
    ring_ID,
    Week_Day,
    Month_Date,
    Month,
    Year,
    Time,
    Doorbot_Description,
    Kind,
    Detection_Type,
  };
}

// async function addToCSV() {
//   try {
//     const cameras = await ringApi.getCameras();
//     const frontCam = cameras[1];

//     const csvWriter = createCsvWriter({
//       path: "./file.csv",
//       header: [
//         { id: "ring_ID", title: "ring_ID" },
//         { id: "Week_Day", title: "Week_Day" },
//         { id: "Month_Date", title: "Month_Date" },
//         { id: "Month", title: "Month" },
//         { id: "Year", title: "Year" },
//         { id: "Time", title: "Time" },
//         { id: "Doorbot_Description", title: "Doorbot_Description" },
//         { id: "Kind", title: "Kind" },
//         { id: "Detection_Type", title: "Detection_Type" },
//       ],
//     });
//     frontCam.onNewDing.subscribe(async (ding) => {
//       const data = DingData(ding);
//       try {
//         await csvWriter.writeRecords([data]);
//       } catch (e) {
//         console.error(e);
//       }
//       console.log(data);
//     });
//     console.log("...Running");
//   } catch (error) {
//     console.error(error);
//   }
// }

async function addToCSV() {
  try {
    const cameras = await ringApi.getCameras();
    const frontCam = cameras[1];

    let needsHeader = false;
    if (!fs.existsSync(`./${CSV_NAME}.csv`)) {
      console.log(`The file ${CSV_NAME}.cvs does not exist.`);
      needsHeader = true;
    }
    const stream = fs.createWriteStream(`${CSV_NAME}.csv`, { flags: "a" });

    if (needsHeader) {
      stream.write(CSV_HEADER + "\n");
    }

    frontCam.onNewDing.subscribe((ding) => {
      const newData = dingDataToCVS(DingData(ding));
      stream.write(newData + "\n");
      console.log(newData);
    });
    console.log("...Running");
  } catch (error) {
    console.error(error);
  }
}

function dingDataToCVS(dd) {
  return `${dd.ring_ID},${dd.Week_Day},${dd.Month_Date},${dd.Month},${dd.Year},${dd.Time},${dd.Doorbot_Description},${dd.Kind},${dd.Detection_Type}`;
}

addToCSV();

module.exports = { DingData };
