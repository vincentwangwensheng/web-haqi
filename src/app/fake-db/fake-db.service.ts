import { InMemoryDbService } from 'angular-in-memory-web-api';
import {CalendarFakeDb} from './calendar';
import {AppCalendarDB} from './appCalendar';


export class FakeDbService implements InMemoryDbService
{
    createDb(): any
    {
        return {
            // Calendar
            'calendar': CalendarFakeDb.data,

            'app-calendar': AppCalendarDB.data,
        };
    }
}
