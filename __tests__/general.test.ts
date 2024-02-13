// Import necessary modules and functions
const {
  addTag,
  copySelectedTabs,
  renderAsReader,
  savePageAsPDF,
  sendLocationData,
} = require('./src');

describe('eLOS Connect', () => {
  let consoleLogSpy;

  // Mock the console log method to capture output
  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe('copySelectedTabs()', () => {
    test('should copy the titles and URLs of selected tabs to clipboard', async () => {
      // Simulate selecting multiple tabs
      document.body.innerHTML = '<div><input type="checkbox" checked></div>';
      window.getSelection().selectAllChildren(document.querySelector('input'));

      await copySelectedTabs();

      // Verify that the correct data was copied to clipboard
      const clipboardData = await navigator.clipboard.readText();
      expect(clipboardData).toEqual('Title1,URL1\nTitle2,URL2');
    });
  });

  describe('renderAsReader()', () => {
    test('should render the active tab as Firefox Reader view', async () => {
      // Simulate having an active tab with a title and URL
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'https://example.com' },
      });
      document.title = 'Example Title';

      await renderAsReader();

      // Verify that the active tab has been rendered as Firefox Reader view
      expect(document.querySelector('.moz-text-scroller')).not.toBeNull();
    });
  });

  describe('savePageAsPDF()', () => {
    test('should save the rendered page as a PDF', async () => {
      // Simulate rendering the active tab as Firefox Reader view
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'https://example.com' },
      });
      document.title = 'Example Title';
      await renderAsReader();

      // Simulate clicking the "Save Page As PDF" button
      const pdfButton = document.createElement('button');
      pdfButton.innerText = 'Save Page As PDF';
      pdfButton.addEventListener('click', savePageAsPDF);
      document.body.appendChild(pdfButton);
      pdfButton.dispatchEvent(new Event('click'));

      // Verify that the page was saved as a PDF
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Page successfully saved as PDF.'
      );
    });
  });

  describe('sendLocationData()', () => {
    test('should send location data to the specified API endpoint', async () => {
      // Simulate sending location data to the API endpoint
      const mockResponse = { success: true };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));

      const locationData = {
        title: 'Example Title',
        url: 'https://example.com',
        tag: 'example-tag',
      };
      await sendLocationData(locationData);

      // Verify that the request was sent to the correct API endpoint
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/location/add', {
        body: JSON.stringify(locationData),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      // Verify that the response was handled appropriately
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Location data successfully sent to the API.'
      );
    });
  });

  describe('addTag()', () => {
    test('should add a new tag to the list of available tags', async () => {
      // Simulate adding a new tag to the list of available tags
      const newTag = 'New Tag';
      await addTag(newTag);

      // Verify that the new tag was added to the list of available tags
      expect(consoleLogSpy).toHaveBeenCalledWith(`Added new tag: ${newTag}`);
    });
  });
});