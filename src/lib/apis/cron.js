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


// ----

const getBookmarkAnnotations = (bookmarkId) => {
  return browser.bookmarks.get(bookmarkId)
    .then(([bookmark]) => {
      if (!bookmark || !bookmark.url) {
        throw new Error(`Bookmark ${bookmarkId} not found or doesn't have a URL`);
      }
      return browser.bookmark.getTree()
        .then(([tree]) => {
          const node = findBookmarkNodeById(tree, bookmarkId);
          if (!node) {
            throw new Error(`Bookmark ${bookmarkId} not found in tree`);
          }
          return node.annotations || {};
        })
        .catch((error) => {
          printError(error);
          return {};
        });
    })
    .catch(printError);
};

const setBookmarkAnnotations = (bookmarkId, annotations) => {
  return browser.bookmarks.get(bookmarkId)
    .then(([bookmark]) => {
      if (!bookmark || !bookmark.url) {
        throw new Error(`Bookmark ${bookmarkId} not found or doesn't have a URL`);
      }
      return browser.bookmark.getTree()
        .then(([tree]) => {
          const node = findBookmarkNodeById(tree, bookmarkId);
          if (!node) {
            throw new Error(`Bookmark ${bookmarkId} not found in tree`);
          }
          return browser.bookmarks.update(bookmarkId, {
            title: bookmark.title,
            url: bookmark.url,
            annotations: annotations
          });
        })
        .catch(printError);
    })
    .catch(printError);
};

const getCronConfig = (bookmarkId) => {
  return getBookmarkAnnotations(bookmarkId)
    .then((annotations) => {
      return annotations.cron || {};
    })
    .catch(printError);
};

const setCronConfig = (bookmarkId, config) => {
  return getBookmarkAnnotations(bookmarkId)
    .then((annotations) => {
      annotations.cron = config;
      return setBookmarkAnnotations(bookmarkId, annotations);
    })
    .catch(printError);
};

const scheduleCronJob = (bookmarkId, callback) => {
  return getCronConfig(bookmarkId)
    .then((config) => {
      const alarmConfig = cronToAlarmConfig(config);
      return browser.alarms.create(bookmarkId, alarmConfig)
        .then(() => {
          browser.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === bookmarkId) {
              callback();
            }
          });
        })
        .catch(proxy.print.failure_create_alarm);
    })
    .catch(proxy.print.failure_schedule_cron_job);
};

/**
 * Initializes the cron configuration by reading it from the bookmark annotation.
 *
 * @returns {Promise<string>} Promise that resolves with the cron configuration
 *                           or rejects with an error message
 */
function initCron() {
  return browser.bookmarks.search({title: "cron-config"})
    .then(bookmarkNodes => {
      if (bookmarkNodes.length === 0) {
        throw new Error("Cron config not found");
      }

      const annotations = bookmarkNodes[0].annotations;

      if (!annotations || !annotations[0]) {
        throw new Error("Cron config not found");
      }

      return annotations[0];
    })
    .catch(proxy.print.failure_init_cron);
}

/**
 * Clears the cron configuration by deleting the bookmark containing the
 * cron configuration annotation.
 *
 * @returns {Promise<void>} Promise that resolves if the cron config was
 *                          cleared or rejects with an error message
 */
function clearCronConfig() {
  return browser.bookmarks.search({title: "cron-config"})
    .then(bookmarkNodes => {
      if (bookmarkNodes.length === 0) {
        throw new Error("Cron config not found");
      }

      return browser.bookmarks.remove(bookmarkNodes[0].id);
    })
    .catch(error => {
      console.error(error);
      throw new Error("Failed to clear cron configuration");
    });
}

/**
 * Handles the onAlarm event by executing the specified function.
 *
 * @param {Alarm} alarm The alarm object that triggered the event
 */
function onAlarm(alarm) {
  if (alarm.name === "cron") {
    return Promise.resolve(alarm)
        .then(proxy.print.status_on_alarm)
        .then(_alarm => _alarm.name)
        .then(executeCronJob)
        .catch(proxy.print.failure_execute_cron);
  }
}

function createAlarm(name, delayInMinutes, periodInMinutes) {
  return browser.alarms.create(name, { delayInMinutes, periodInMinutes })
    .catch(proxy.print.failure_create_alarm);
}


function executeCronJob(job) {
  return Promise.resolve(job)
    .then(validateCronJob)
    .then(bookmarks.fetchById)
    .then(bookmarks.fetchAnnotations)
    .then(parseCronConfig)
    .then(runCronAction)
    .then(updateLastCronRun)
    .catch(proxy.print.failure_cron_execution);
}

function validateCronJob(job) {
  if (!job || typeof job !== 'object') {
    throw new Error('Invalid cron job object');
  }
  if (!job.id || typeof job.id !== 'string') {
    throw new Error('Cron job must have a valid bookmark ID');
  }
  if (!job.action || typeof job.action !== 'string') {
    throw new Error('Cron job must have a valid action');
  }
  if (!job.config || typeof job.config !== 'string') {
    throw new Error('Cron job must have a valid cron configuration');
  }
  return job;
}


function parseCronConfig(config) {
  const cron = new CronJob(config);
  if (!cron) {
    throw new Error('Invalid cron configuration');
  }
  return cron;
}

function runCronAction(cron) {
  return Promise.resolve()
    .then(() => {
      if (cron.running) {
        throw new Error('Cron job already running');
      }
      cron.start();
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        cron.addCallback(() => {
          try {
            const actionFn = eval(cron.action);
            if (typeof actionFn !== 'function') {
              throw new Error('Invalid action function');
            }
            actionFn();
          } catch (err) {
            reject(err);
          }
          resolve();
        });
      });
    });
}

function updateLastCronRun() {
  // Update the last cron run timestamp in the bookmark meta annotation
  // using the same approach as in the previous example
}

function handleCronError(err) {
  console.error(`Cron error: ${err.message}`);
}

/**
 * Retrieves the cron configuration from the bookmark annotation field.
 *
 * @returns {Promise} A promise that resolves with the cron configuration.
 */
function retrieveCronConfig() {
  return getBookmarkAnnotation("cron_config")
    .then((annotation) => {
      if (!annotation) {
        return Promise.reject("No cron config found.");
      }

      let cronConfig = null;
      try {
        cronConfig = JSON.parse(annotation);
      } catch (error) {
        return Promise.reject("Invalid cron config.");
      }

      return Promise.resolve(cronConfig);
    })
    .catch((error) => {
      return Promise.reject(`Failed to retrieve cron config: ${error}`);
    });
}
