describe('browser.notifications', () => {
  // test('create', (done) => {
  //   const options = { type: 'basic' };
    // const callback = jest.fn(() => done());

    // expect(jest.isMockFunction(browser.notifications.create)).toBe(true);

    // browser.notifications.create(options, callback);
    // expect(browser.notifications.create).toHaveBeenCalledTimes(1);
    // expect(browser.notifications.create).toHaveBeenLastCalledWith(
    //   options,
    //   callback
    // );
    // expect(callback).toHaveBeenLastCalledWith('generated-id');

    // browser.notifications.create('id', options, callback);
    // expect(browser.notifications.create).toHaveBeenCalledTimes(2);
    // expect(browser.notifications.create).toHaveBeenLastCalledWith(
    //   'id',
    //   options,
    //   callback
    // );
    // expect(callback).toHaveBeenLastCalledWith('id');
  // });

  test('create promise', () => {
    const options = { type: 'basic' };

    return expect(browser.notifications.create(options)).resolves.toBe(
      'generated-id'
    );
  });

  test('update', (done) => {
    const options = { type: 'basic' };
    const callback = jest.fn(() => done());

    expect(jest.isMockFunction(browser.notifications.update)).toBe(true);
    browser.notifications.update('id', options, callback);
    expect(browser.notifications.update).toHaveBeenCalledTimes(1);
    expect(browser.notifications.update).toHaveBeenLastCalledWith(
      'id',
      options,
      callback
    );
    expect(callback).toHaveBeenLastCalledWith(true);
  });

  test('update promise', () => {
    const options = { type: 'basic' };

    return expect(browser.notifications.update(options)).resolves.toBe(true);
  });

  test('clear', (done) => {
    const callback = jest.fn(() => done());

    expect(jest.isMockFunction(browser.notifications.clear)).toBe(true);
    browser.notifications.clear('id', callback);
    expect(browser.notifications.clear).toHaveBeenCalledTimes(1);
    expect(browser.notifications.clear).toHaveBeenLastCalledWith('id', callback);
    expect(callback).toHaveBeenLastCalledWith(true);
  });

  test('clear - promise', () => {
    return expect(browser.notifications.clear('id')).resolves.toBe(true);
  });

  test('getAll', (done) => {
    const callback = jest.fn(() => done());

    expect(jest.isMockFunction(browser.notifications.getAll)).toBe(true);
    browser.notifications.getAll(callback);
    expect(browser.notifications.getAll).toHaveBeenCalledTimes(1);
    expect(browser.notifications.getAll).toHaveBeenLastCalledWith(callback);
    expect(callback).toHaveBeenLastCalledWith([]);
  });

  test('getAll - promise', () => {
    return expect(browser.notifications.getAll()).resolves.toEqual([]);
  });

  test('getPermissionLevel', (done) => {
    const callback = jest.fn(() => done());

    expect(jest.isMockFunction(browser.notifications.getPermissionLevel)).toBe(
      true
    );
    browser.notifications.getPermissionLevel(callback);
    expect(browser.notifications.getPermissionLevel).toHaveBeenCalledTimes(1);
    expect(browser.notifications.getPermissionLevel).toHaveBeenLastCalledWith(
      callback
    );
    expect(callback).toHaveBeenLastCalledWith('granted');
  });

  test('getPermissionLevel - promise', () => {
    return expect(browser.notifications.getPermissionLevel()).resolves.toEqual(
      'granted'
    );
  });

  test('onClosed.addListener', () => {
    expect(jest.isMockFunction(browser.notifications.onClosed.addListener)).toBe(
      true
    );

    browser.notifications.onClosed.addListener(() => {});
    expect(browser.notifications.onClosed.addListener).toHaveBeenCalledTimes(1);
  });

  test('onClicked.addListener', () => {
    expect(
      jest.isMockFunction(browser.notifications.onClicked.addListener)
    ).toBe(true);

    browser.notifications.onClicked.addListener(() => {});
    expect(browser.notifications.onClicked.addListener).toHaveBeenCalledTimes(1);
  });

  test('onButtonClicked.addListener', () => {
    expect(
      jest.isMockFunction(browser.notifications.onButtonClicked.addListener)
    ).toBe(true);

    browser.notifications.onButtonClicked.addListener(() => {});
    expect(
      browser.notifications.onButtonClicked.addListener
    ).toHaveBeenCalledTimes(1);
  });

  test('onPermissionLevelChanged.addListener', () => {
    expect(
      jest.isMockFunction(
        browser.notifications.onPermissionLevelChanged.addListener
      )
    ).toBe(true);

    browser.notifications.onPermissionLevelChanged.addListener(() => {});
    expect(
      browser.notifications.onPermissionLevelChanged.addListener
    ).toHaveBeenCalledTimes(1);
  });

  test('onShowSettings.addListener', () => {
    expect(
      jest.isMockFunction(browser.notifications.onShowSettings.addListener)
    ).toBe(true);

    browser.notifications.onShowSettings.addListener(() => {});
    expect(
      browser.notifications.onShowSettings.addListener
    ).toHaveBeenCalledTimes(1);
  });
});
