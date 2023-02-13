const createAlarm = (alarmName, intervalInDays) => {
    chrome.alarms.create(alarmName, { periodInDays: intervalInDays });
}

const clearAlarm = (alarmName) => {
    chrome.alarms.clear(alarmName);
}

const isAlarmActive = (alarmName) => {
    chrome.alarms.get(alarmName, (alarm) => {
        if (alarm) {
            console.log(`${alarmName} is active`);
        } else {
            console.log(`${alarmName} is not active`);
        }
    });
}

const alarms = {
    "flashcard-review-alarm": () => createAlarm("flashcard-review-alarm", 1),
    "content-curation-alarm": () => createAlarm("content-curation-alarm", 7),
    "knowledge-map-generation": () => createAlarm("knowledge-map-generation", 30),
    "adaptive-learning-alarm": () => createAlarm("adaptive-learning-alarm", 7),
    "feedback-loop-alarm": () => createAlarm("feedback-loop-alarm", 1)
};

const cronJob = require('cron-job');

let cronJobs = [];

const registerCronEvent = (cronExpression, eventToFire) => {
  const job = new cronJob(cronExpression, () => {
    eventToFire();
  });
  cronJobs.push(job);
  job.start();
  return Promise.resolve(job);
};

const deleteCronEvent = (jobToDelete) => {
  jobToDelete.stop();
  cronJobs = cronJobs.filter(job => job !== jobToDelete);
  return Promise.resolve();
};

const getCronEvents = () => {
  return Promise.resolve(cronJobs);
};

