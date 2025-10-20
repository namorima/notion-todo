import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const state = process.env.HOLIDAY_STATE || 'Kelantan';
const year = new Date().getFullYear();

async function fetchHolidays() {
  try {
    console.log(`Fetching holidays for ${state}, ${year}...`);

    const url = `http://www.officeholidays.com/countries/malaysia/regional.php?list_year=${year}&list_region=${state}`;
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    const holidays = [];

    $('.list-table tr').each((index, element) => {
      const dateText = $(element).find('td').eq(1).find('span').text().trim();
      const holidayName = $(element).find('td').eq(2).find('a').text().trim();

      if (dateText && holidayName) {
        // Parse date format "Friday 01 January" to "2025-01-01"
        const dateParts = dateText.split(' ');
        if (dateParts.length >= 3) {
          const day = dateParts[1].padStart(2, '0');
          const monthName = dateParts[2];
          const months = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
          };
          const month = months[monthName];

          if (month) {
            const date = `${year}-${month}-${day}`;
            holidays.push({
              date: date,
              name: holidayName
            });
          }
        }
      }
    });

    // Save to JSON file
    const filePath = path.join(__dirname, 'holidays.json');
    const data = {
      state: state,
      year: year,
      lastUpdated: new Date().toISOString(),
      holidays: holidays
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Successfully fetched ${holidays.length} holidays`);
    console.log(`📁 Saved to: ${filePath}`);

    return holidays;
  } catch (error) {
    console.error('❌ Error fetching holidays:', error);
    return [];
  }
}

fetchHolidays();
