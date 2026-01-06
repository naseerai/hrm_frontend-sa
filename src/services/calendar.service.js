import { apiService } from './api.service';

class CalendarService {
  // 1. Get Holidays (URL: /calendar/holidays/2025)
  async getHolidays(year) {
    return await apiService.request('getHolidays', {
      method: 'GET',
      urlOverride: `/calendar/holidays/${year}`
    });
  }

  // 2. Add Holidays (POST: /calendar/holidays)
  // Expects: [ { name, holiday_date, ... } ]
  async addHolidays(holidaysList) {
    return await apiService.request('addHolidays', {
      method: 'POST',
      body: JSON.stringify(holidaysList) 
    });
  }

  // 3. Update Holidays (PATCH: /calendar/update/holidays)
  // Expects: [ { id, description, holiday_type } ]
  async updateHolidays(holidaysList) {
    return await apiService.request('updateHolidays', {
      method: 'PATCH',
      body: JSON.stringify(holidaysList)
    });
  }

  // 4. Delete Holidays (DELETE: /calendar/holidays?ids=ID1,ID2)
  async deleteHolidays(idsArray) {
    // Convert array to comma separated string
    const idsString = idsArray.join(',');
    return await apiService.request('deleteHolidays', {
      method: 'DELETE',
      urlOverride: `/calendar/holidays?ids=${idsString}`
    });
  }
}

export const calendarService = new CalendarService();