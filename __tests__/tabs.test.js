describe("browser.tabs", () => {
  test("get", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.get)).toBe(true);
    browser.tabs.get(1, callback);
    expect(browser.tabs.get).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
  test("getCurrent", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.getCurrent)).toBe(true);
    browser.tabs.getCurrent(callback);
    expect(browser.tabs.getCurrent).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
  test("connect", () => {
    const name = "CONNECT_NAME";
    expect(jest.isMockFunction(browser.tabs.connect)).toBe(true);
    const connection = browser.tabs.connect(1, { name });
    expect(connection.name).toEqual(name);
    expect(jest.isMockFunction(connection.disconnect)).toBe(true);
    expect(jest.isMockFunction(connection.postMessage)).toBe(true);
    expect(jest.isMockFunction(connection.onDisconnect.addListener)).toBe(true);
    expect(jest.isMockFunction(connection.onMessage.addListener)).toBe(true);
    expect(browser.tabs.connect).toHaveBeenCalledTimes(1);
  });
  test("create", (done) => {
    const callback = jest.fn(() => done());
    const props = { pinned: true };
    expect(jest.isMockFunction(browser.tabs.create)).toBe(true);
    browser.tabs.create(props, callback);
    expect(browser.tabs.create).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(props);
  });
  test("create promise", () => {
    const props = { pinned: true };
    return expect(browser.tabs.create(props)).resolves.toBe(props);
  });
  test("duplicate", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.duplicate)).toBe(true);
    browser.tabs.duplicate(1, callback);
    expect(browser.tabs.duplicate).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ id: 1 });
  });
  test("remove", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.remove)).toBe(true);
    browser.tabs.remove([1], callback);
    expect(browser.tabs.remove).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
  test("remove promise", () => {
    expect(browser.tabs.remove([1])).resolves.toBeUndefined();
  });
  test("query", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.query)).toBe(true);
    browser.tabs.query({ pinned: true }, callback);
    expect(browser.tabs.query).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([{}]);
  });
  test("highlight", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.highlight)).toBe(true);
    browser.tabs.highlight({}, callback);
    expect(browser.tabs.highlight).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
  test("update", (done) => {
    const callback = jest.fn(() => done());
    const props = { pinned: true };
    expect(jest.isMockFunction(browser.tabs.update)).toBe(true);
    browser.tabs.update(1, props, callback);
    expect(browser.tabs.update).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ id: 1, pinned: true });
    browser.tabs.update(props);
    expect(browser.tabs.update).toHaveBeenCalledTimes(2);
  });
  test("move", (done) => {
    const callback = jest.fn(() => done());
    const props = { pinned: true };
    expect(jest.isMockFunction(browser.tabs.move)).toBe(true);
    browser.tabs.move([1, 2, 3], props, callback);
    expect(browser.tabs.move).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([
      { id: 1, pinned: true },
      { id: 2, pinned: true },
      { id: 3, pinned: true },
    ]);
  });
  ["addListener", "removeListener", "hasListener"].forEach((method) => {
    test(`onUpdated.${method}`, () => {
      const callback = jest.fn();
      expect(jest.isMockFunction(browser.tabs.onUpdated[method])).toBe(true);
      browser.tabs.onUpdated[method](callback);
      expect(browser.tabs.onUpdated[method]).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });
  test("reload", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.reload)).toBe(true);

    browser.tabs.reload(1, {}, callback);

    expect(browser.tabs.reload).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
  test("sendMessage", (done) => {
    const callback = jest.fn(() => done());
    expect(jest.isMockFunction(browser.tabs.sendMessage)).toBe(true);
    browser.tabs.sendMessage(1, { test: "message" }, callback);
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    browser.tabs.sendMessage(1, { test: "message" });
    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
  });
  test("sendMessage listener", (done) => {
    const listener = jest.fn();
    browser.runtime.onMessage.addListener(listener);
    browser.tabs.sendMessage(1, { test: "message" }, done);
    expect(listener).toHaveBeenCalledWith(1, { test: "message" });
  });
  test("sendMessage promise", () => {
    return expect(browser.tabs.sendMessage({})).resolves.toBeUndefined();
  });
});
