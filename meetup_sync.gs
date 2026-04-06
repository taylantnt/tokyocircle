function syncMeetupEvents() {
  const url = "https://www.meetup.com/circle/events/rss/";
  
  try {
    const response = UrlFetchApp.fetch(url);
    const xml = response.getContentText();
    const document = XmlService.parse(xml);
    const root = document.getRootElement();
    const channel = root.getChild('channel');
    
    if (!channel) {
      Logger.log("No RSS channel found.");
      return;
    }
    
    const items = channel.getChildren('item');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events");
    
    if (!sheet) {
      Logger.log("Error: A sheet named 'Events' was not found.");
      return;
    }
    
    // Get existing links to prevent duplicating events
    const existingData = sheet.getDataRange().getValues();
    const existingLinks = existingData.map(row => row[6]); // Assuming Meetup Link is in Column G (index 6)
    
    // Process only the latest 5 events
    const limit = Math.min(items.length, 5);
    
    // We iterate backwards to append the oldest "new" event first, preserving chronological order
    for (let i = limit - 1; i >= 0; i--) {
      const item = items[i];
      const title = item.getChildText('title') || 'Untitled Event';
      const link = item.getChildText('link') || '';
      
      // If we already have this event link in our sheet, skip it
      if (existingLinks.includes(link)) {
        continue;
      }
      
      let description = item.getChildText('description') || '';
      // Strip HTML tags from the description to keep the sheet clean
      description = description.replace(/<[^>]*>?/gm, '').trim();
      
      const pubDateStr = item.getChildText('pubDate');
      const eventDate = new Date(pubDateStr);
      
      let dateNum = "";
      let monthStr = "";
      let timeStr = "";
      
      if (!isNaN(eventDate)) {
        // Formats exactly like the manual entries: e.g. "24", "SEP"
        dateNum = eventDate.getDate().toString();
        
        // Month array to ensure it matches exactly the short, uppercase format
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        monthStr = months[eventDate.getMonth()];
        
        // Format time as HH:MM AM/PM
        timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      
      const location = "TBD"; // RSS often doesn't split location cleanly; you can update this manually in the sheet
      const isPast = "FALSE"; // New events are upcoming by default
      
      // Append row in the order: [Date, Month, Title, Location, Time, Description, MeetupLink, isPast]
      sheet.appendRow([dateNum, monthStr, title, location, timeStr, description, link, isPast]);
      Logger.log(`Added new event: ${title}`);
    }
    
  } catch (error) {
    Logger.log("Error fetching or parsing RSS feed: " + error.toString());
  }
}
