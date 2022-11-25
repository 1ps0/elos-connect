test('browser.omnibox.setDefaultSuggestion', () => {
  expect(jest.isMockFunction(browser.omnibox.setDefaultSuggestion)).toBe(true);
  browser.omnibox.setDefaultSuggestion({ description: 'mocking things' });
  expect(browser.omnibox.setDefaultSuggestion).toBeCalled();
});

test('browser.omnibox.onInputStarted.addListener', () => {
  expect(jest.isMockFunction(browser.omnibox.onInputStarted.addListener)).toBe(
    true
  );
  browser.omnibox.onInputStarted.addListener(() => {});
  expect(browser.omnibox.onInputStarted.addListener).toBeCalled();
});

test('browser.omnibox.onInputChanged.addListener', () => {
  expect(jest.isMockFunction(browser.omnibox.onInputChanged.addListener)).toBe(
    true
  );
  browser.omnibox.onInputChanged.addListener(() => {});
  expect(browser.omnibox.onInputStarted.addListener).toBeCalled();
});

test('browser.omnibox.onInputEntered.addListener', () => {
  expect(jest.isMockFunction(browser.omnibox.onInputEntered.addListener)).toBe(
    true
  );
  browser.omnibox.onInputEntered.addListener(() => {});
  expect(browser.omnibox.onInputEntered.addListener).toBeCalled();
});
