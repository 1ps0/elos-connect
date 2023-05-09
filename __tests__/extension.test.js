describe("browser.extension", () => {
  test("getURL", () => {
    expect(jest.isMockFunction(browser.extension.getURL)).toBe(true);
  });
});
