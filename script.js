("use strict");
const RING_BLUE_SOLID = "rgb(25,152,213,1)";
const RING_BLUE_TRAN = "rgb(25,152,213,0.5)";
const DAYS = 50;
const WEEK_MULT = 7 / DAYS;
const HOUR_MULT = 1 / DAYS;

function monthToInt(month) {
  let val = 1; // Jan will be default month
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  months.forEach((elem, i) => {
    if (elem == month) {
      val = i + 1;
    }
  });
  return val;
}

async function getCSV() {
  const response = await fetch("./data-collection/camera_data.csv");
  const csv = await response.text();
  return csv;
}

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

function motionsToDay(motions) {
  const days = {};
  motions.forEach((motion) => {
    const key = `${motion.Year} ${monthToInt(motion.Month)} ${
      motion.Month_Date
    }`;
    if (!days[key]) {
      days[key] = [motion];
    } else {
      days[key].push(motion);
    }
  });
  return days;
}

async function createHourly(motions) {
  try {
    const hours = motionsToHourly(motions);
    // const labels = [];
    // for (let i = 0; i < 24; i++) {
    //   labels[i] = i;
    // }
    const labels = [
      "12am",
      "1am",
      "2am",
      "3am",
      "4am",
      "5am",
      "6am",
      "7am",
      "8am",
      "9am",
      "10am",
      "11am",
      "12pm",
      "1pm",
      "2pm",
      "3pm",
      "4pm",
      "5pm",
      "6pm",
      "7pm",
      "8pm",
      "9pm",
      "10pm",
      "11pm",
    ];
    const data = [];
    hours.forEach((hour, i) => {
      // optionaly do average rather than total
      // will need to find the total amount of days that have passes
      // then divide hour.length by that value
      // data[i] = hour.length/totalDays;
      data[i] = hour.length * HOUR_MULT;
    });

    const ctx = document.getElementById("hourlyChart").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Average Hourly Motion Detections",
            data: data,
            fill: true,
            backgroundColor: [RING_BLUE_TRAN],
            borderColor: [RING_BLUE_SOLID],
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
      Sunday: Sun.length * WEEK_MULT,
      Monday: Mon.length * WEEK_MULT,
      Tuesday: Tue.length * WEEK_MULT,
      Wednesday: Wed.length * WEEK_MULT,
      Thursday: Thu.length * WEEK_MULT,
      Friday: Fri.length * WEEK_MULT,
      Saturday: Sat.length * WEEK_MULT,
    };

    const ctx = document.getElementById("weeklyChart").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Average Weekly Motion Detections",
            data: data,
            backgroundColor: [RING_BLUE_TRAN],
            borderColor: [RING_BLUE_SOLID],
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
async function createDaily(motions) {
  try {
    const days = motionsToDay(motions);
    const data = {};
    for (const prop in days) {
      const day = days[prop];
      const motion = day[0];
      const key = `${motion.Year} ${monthToInt(motion.Month)} ${
        motion.Month_Date
      }`;
      if (!data[key]) {
        const displayDate = `${motion.Month} ${motion.Month_Date} ${motion.Year}`;
        data[displayDate] = day.length;
      }
    }
    console.log(data);
    const ctx = document.getElementById("dailyChart").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Daily Total Motion Detections",
            data: data,
            backgroundColor: [RING_BLUE_TRAN],
            borderColor: [RING_BLUE_SOLID],
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
    createDaily(motions);
  } catch (err) {
    console.error(err);
  }
}

createCharts();

// add section for average motions per, hour, per day, per week, and per month
// total motions. what portion of motions had human detection
// maybe have a seperate chart just for human detected motion or make a button that changes from all motion to
// just human motion. accompanied by a color change
