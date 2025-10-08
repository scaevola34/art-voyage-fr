import { Event } from '@/domain/events';

/**
 * ICS (iCalendar) export utilities
 * Generates RFC 5545 compliant iCalendar files
 */

/**
 * Format date for ICS format (YYYYMMDD)
 */
const formatICSDate = (dateStr: string): string => {
  return dateStr.replace(/-/g, '');
};

/**
 * Format datetime for ICS format (YYYYMMDDTHHmmssZ)
 */
const formatICSDateTime = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

/**
 * Escape special characters for ICS format
 */
const escapeICSText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

/**
 * Fold long lines (ICS spec requires max 75 chars per line)
 */
const foldLine = (line: string): string => {
  if (line.length <= 75) {
    return line;
  }
  
  const folded: string[] = [];
  let remaining = line;
  
  // First line can be 75 chars
  folded.push(remaining.substring(0, 75));
  remaining = remaining.substring(75);
  
  // Subsequent lines should be 74 chars (space for leading space)
  while (remaining.length > 0) {
    folded.push(' ' + remaining.substring(0, 74));
    remaining = remaining.substring(74);
  }
  
  return folded.join('\r\n');
};

/**
 * Generate ICS content for a single event
 */
export const generateEventICS = (event: Event): string => {
  const now = formatICSDateTime(new Date());
  const uid = `${event.id}@streetart.fr`;
  
  // Build location string
  let location = `${event.city}, ${event.region}`;
  
  // Build description with additional details
  let description = escapeICSText(event.description);
  if (event.price) {
    description += `\\n\\nTarif: ${escapeICSText(event.price)}`;
  }
  if (event.website) {
    description += `\\n\\nPlus d'infos: ${event.website}`;
  }
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Street Art France//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${formatICSDate(event.startDate)}`,
    `DTEND;VALUE=DATE:${formatICSDate(event.endDate)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeICSText(location)}`,
    `STATUS:CONFIRMED`,
  ];
  
  // Add optional fields
  if (event.website) {
    lines.push(`URL:${event.website}`);
  }
  
  // Add categories
  const category = event.type === 'festival' ? 'FESTIVAL' :
                   event.type === 'vernissage' ? 'EXHIBITION' :
                   event.type === 'atelier' ? 'WORKSHOP' : 'EVENT';
  lines.push(`CATEGORIES:${category},STREET ART`);
  
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  
  // Fold long lines and join with CRLF
  return lines.map(foldLine).join('\r\n');
};

/**
 * Generate ICS content for multiple events
 */
export const generateMultipleEventsICS = (events: Event[]): string => {
  const now = formatICSDateTime(new Date());
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Street Art France//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Agenda Street Art`,
    `X-WR-CALDESC:Événements street art en France`,
  ];
  
  // Add each event
  events.forEach(event => {
    const uid = `${event.id}@streetart.fr`;
    let description = escapeICSText(event.description);
    
    if (event.price) {
      description += `\\n\\nTarif: ${escapeICSText(event.price)}`;
    }
    if (event.website) {
      description += `\\n\\nPlus d'infos: ${event.website}`;
    }
    
    const location = `${event.city}, ${event.region}`;
    const category = event.type === 'festival' ? 'FESTIVAL' :
                     event.type === 'vernissage' ? 'EXHIBITION' :
                     event.type === 'atelier' ? 'WORKSHOP' : 'EVENT';
    
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${formatICSDate(event.endDate)}`);
    lines.push(`SUMMARY:${escapeICSText(event.title)}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`LOCATION:${escapeICSText(location)}`);
    lines.push(`STATUS:CONFIRMED`);
    lines.push(`CATEGORIES:${category},STREET ART`);
    
    if (event.website) {
      lines.push(`URL:${event.website}`);
    }
    
    lines.push('END:VEVENT');
  });
  
  lines.push('END:VCALENDAR');
  
  return lines.map(foldLine).join('\r\n');
};

/**
 * Download ICS file for a single event
 */
export const downloadEventICS = (event: Event): void => {
  const icsContent = generateEventICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Download ICS file for multiple events
 */
export const downloadMultipleEventsICS = (events: Event[], filename: string = 'agenda-street-art'): void => {
  const icsContent = generateMultipleEventsICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Get ICS content as data URL (for mailto links, etc.)
 */
export const getEventICSDataURL = (event: Event): string => {
  const icsContent = generateEventICS(event);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
};
