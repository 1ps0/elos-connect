// https://github.com/mozilla/web-ext

// mocha test/test.js --ui tdd
// mocha test/test.js --ui bdd
// npm install --save-dev svelte-testing-library

// web-ext run -ci --firefox=/path/to/firefox --keep-profile-changes --start-url=http://localhost:3000
// web-ext test --firefox=/path/to/firefox

// BDD
describe("applyDarkMode", function () {
  it("should apply the dark mode to the page", function () {
    return applyDarkMode()
      .then(function () {
        // Assert that the dark mode was applied successfully
        assert.equal(document.body.style.backgroundColor, "#1a2028");
      })
      .catch(function (error) {
        // Assert that there was no error applying the dark mode
        assert.ifError(error);
      });
  });
});

// BDD

describe("fetching a tab", () => {
  it("should fetch a tab successfully", () => {
    // Given a tab with id 1 and url 'https://www.example.com'
    const tabId = 1;
    const expectedTab = { id: tabId, url: "https://www.example.com" };

    // When the fetchTab function is called with the tab id
    const actualTab = fetchTab(tabId);

    // Then the returned tab should match the expected tab
    expect(actualTab).toEqual(expectedTab);
  });

  it("should call the error callback if a tab cannot be fetched", () => {
    // Given a tab with id 1
    const tabId = 1;
    const expectedError = "Error fetching tab";
    const errorCallback = jest.fn();

    // When the fetchTab function is called with the tab id and error callback
    fetchTab(tabId, errorCallback);

    // Then the error callback should be called with the expected error message
    expect(errorCallback).toHaveBeenCalledWith(expectedError);
  });
});

// TDD
suite("applyDarkMode", function () {
  test("should apply the dark mode to the page", function () {
    return applyDarkMode()
      .then(function () {
        // Assert that the dark mode was applied successfully
        assert.equal(document.body.style.backgroundColor, "#1a2028");
      })
      .catch(function (error) {
        // Assert that there was no error applying the dark mode
        assert.ifError(error);
      });
  });
});

// TDD
// Test that a tab is successfully fetched
it("should fetch a tab", () => {
  // Arrange
  const tabId = 1;
  const expectedTab = { id: tabId, url: "https://www.example.com" };

  // Act
  const actualTab = fetchTab(tabId);

  // Assert
  expect(actualTab).toEqual(expectedTab);
});

// Test that an error callback is called when a tab cannot be fetched
it("should call the error callback if a tab cannot be fetched", () => {
  // Arrange
  const tabId = 1;
  const expectedError = "Error fetching tab";
  const errorCallback = jest.fn();

  // Act
  fetchTab(tabId, errorCallback);

  // Assert
  expect(errorCallback).toHaveBeenCalledWith(expectedError);
});
