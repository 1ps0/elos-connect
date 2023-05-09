const alarms = require("./lib/apis/alarms");

describe("alarms API", () => {
  beforeEach(() => {
    // clear all existing alarms before each test
    return browser.alarms.clearAll();
  });

  afterEach(() => {
    // clear all existing alarms after each test
    return browser.alarms.clearAll();
  });

  it("sets an alarm", () => {
    return alarms
      .set("test-alarm", { when: Date.now() + 1000 })
      .then((alarm) => {
        expect(alarm.name).toEqual("test-alarm");
      });
  });

  it("gets an alarm", () => {
    return alarms
      .set("test-alarm", { when: Date.now() + 1000 })
      .then(() => alarms.get("test-alarm"))
      .then((alarm) => {
        expect(alarm.name).toEqual("test-alarm");
      });
  });

  it("gets all alarms", () => {
    return Promise.all([
      alarms.set("test-alarm-1", { when: Date.now() + 1000 }),
      alarms.set("test-alarm-2", { when: Date.now() + 2000 }),
    ])
      .then(() => alarms.getAll())
      .then((alarms) => {
        expect(alarms.length).toEqual(2);
        expect(alarms[0].name).toEqual("test-alarm-1");
        expect(alarms[1].name).toEqual("test-alarm-2");
      });
  });

  it("deletes an alarm", () => {
    return alarms
      .set("test-alarm", { when: Date.now() + 1000 })
      .then(() => alarms.delete("test-alarm"))
      .then(() => alarms.get("test-alarm"))
      .then((alarm) => {
        expect(alarm).toBeUndefined();
      });
  });
});
