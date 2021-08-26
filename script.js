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
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };
  motions.forEach((motion) => {
    switch (motion.Week_Day) {
      case "Sun":
        week.sunday.push(motion);
        break;
      case "Mon":
        week.monday.push(motion);
        break;
      case "Tue":
        week.tuesday.push(motion);
        break;
      case "Wed":
        week.wednesday.push(motion);
        break;
      case "Thu":
        week.thursday.push(motion);
        break;
      case "Fri":
        week.friday.push(motion);
        break;
      case "Sat":
        week.saturday.push(motion);
        break;
      default:
        break;
    }
  });
  return week;
}

/*
Put motions into an obj for each month where
Month.june = [];
*/
function motionsToMonth() {}

/*
Put motions into an array for the year
Not sure what the best way to do this.
How would you programmatically add a new year as it occurs.
Having a sparse array is a bad idea
*/
function motionsToYear() {}

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
    const { sunday, monday, tuesday, wednesday, thursday, friday, saturday } =
      motionsToWeekday(motions);
    const data = {
      Sunday: sunday.length,
      Monday: monday.length,
      Tuesday: tuesday.length,
      Wednesday: wednesday.length,
      Thursday: thursday.length,
      Friday: friday.length,
      Saturday: saturday.length,
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
