describe('browser.webNavigation', () => {
  test('onCompleted listener', () => {
    expect(
      jest.isMockFunction(browser.webNavigation.onCompleted.addListener)
    ).toBe(true);

    const listener = () => {};
    browser.webNavigation.onCompleted.addListener(listener);

    expect(browser.webNavigation.onCompleted.addListener).toHaveBeenCalledWith(
      listener
    );
  });

  test('onHistoryStateUpdated listener', () => {
    expect(
      jest.isMockFunction(
        browser.webNavigation.onHistoryStateUpdated.addListener
      )
    ).toBe(true);

    const listener = () => {};
    browser.webNavigation.onHistoryStateUpdated.addListener(listener);

    expect(
      browser.webNavigation.onHistoryStateUpdated.addListener
    ).toHaveBeenCalledWith(listener);
  });
});
