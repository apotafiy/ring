("use strict");
// DON'T FORGET THIS ISNT IN NODE.JS
async function getCSV() {
  const response = await fetch("/data-collection/camera_data.csv");
  const csv = await response.text();
  return csv;
}

/*
Each row will be an motion object
*/
function csvToArray(csv) {
  // last line is just an empty line so need to ignore
  //first line is header so also ignore
  const table = csv.split("\n").splice(1);
  table.pop();
  const motions = [];

  table.forEach((element) => {
    const motion = element.split(",");
    let ring_ID,
      Week_Day,
      Month_Date,
      Month,
      Year,
      Time,
      Doorbot_Description,
      Kind,
      Detection_Type;

    ring_ID = motion[0];
    Week_Day = motion[1];
    Month_Date = motion[2];
    Month = motion[3];
    Year = motion[4];
    Time = motion[5];
    Doorbot_Description = motion[6];
    Kind = motion[7];
    Detection_Type = motion[8];

    motions.push({
      ring_ID,
      Week_Day,
      Month_Date,
      Month,
      Year,
      Time,
      Doorbot_Description,
      Kind,
      Detection_Type,
    });
  });
  return motions;
}

/*
Put motions into an 2d array of length 24
*/
function motionsToHourly(motions) {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push([]);
  }
  motions.forEach((motion) => {
    hours[parseInt(motion.Time.substring(0, 2))].push(motion);
  });
  return hours;
}

/*
Put motions into an obj for each week day where
Week.monday = [];
*/
function motionsToWeekday(motions) {
  const week = {
    Sun: [],
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
  };
  motions.forEach((motion) => {
    week[motion.Week_Day].push(motion);
  });
  return week;
}

function motionsToMonth(motions) {
  const months = {
    Jan: [], // some of these month abreviations may be wrong. double check them.
    Feb: [],
    Mar: [],
    Apr: [],
    May: [],
    Jun: [],
    Jul: [],
    Aug: [],
    Sep: [],
    Oct: [],
    Nov: [],
    Dec: [],
  };
  motions.forEach((motion) => {
    months[motion.Month].push(motion);
  });
  return months;
}

function motionsToYear(motions) {
  const years = {};
  motions.forEach((motion) => {
    if (years[motion.Year]) {
      years[motion.Year].push(motion);
    } else {
      years[motion.Year] = [motion];
    }
  });
  return years;
}

/*
Divide motions into seperate days.
Each day will be with an associated key in an object.
The key will be some sort of string created from year,day,month.
May need to divide into years first and do them seperately so it doenst get confused.
new Date().toDateString() returns "Thu Aug 26 2021" format. Use this.

Maybe serpate year into months. Then sort each month by date. Then rejoin arrays after sort.
*/

async function createHourly(motions) {
  try {
    const hours = motionsToHourly(motions);
    const labels = [];
    for (let i = 0; i < 24; i++) {
      labels[i] = i;
    }
    const data = [];
    hours.forEach((hour, i) => {
      // optionaly do average rather than total
      // will need to find the total amount of days that have passes
      // then divide hour.length by that value
      // data[i] = hour.length/totalDays;
      data[i] = hour.length;
    });

    const ctx = document.getElementById("hourlyChart").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Hourly Home Activity",
            data: data,
            fill: true,
            backgroundColor: ["rgba(255, 99, 132, 0.2)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
            borderWidth: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
}
async function createWeekly(motions) {
  try {
    const { Sun, Mon, Tue, Wed, Thu, Fri, Sat } = motionsToWeekday(motions);
    const data = {
      Sunday: Sun.length,
      Monday: Mon.length,
      Tuesday: Tue.length,
      Wednesday: Wed.length,
      Thursday: Thu.length,
      Friday: Fri.length,
      Saturday: Sat.length,
    };

    const ctx = document.getElementById("weeklyChart").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Hourly Home Activity",
            data: data,
            backgroundColor: ["rgba(255, 99, 132, 0.5)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
            borderWidth: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
}

async function createCharts() {
  try {
    const csv = await getCSV();
    const motions = csvToArray(csv);
    createHourly(motions);
    createWeekly(motions);
  } catch (err) {
    console.error(err);
  }
}

createCharts();
