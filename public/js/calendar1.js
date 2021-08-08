var gregorian, jalali, hijri;

gregorian = mobiscroll.eventcalendar('#demo-gregorian', {
    theme: 'ios',
    themeVariant: 'light',
    clickToCreate: false,
    dragToCreate: false,
    dragToMove: false,
    dragToResize: false
});

jalali = mobiscroll.eventcalendar('#demo-jalali', {
    theme: 'ios',
    themeVariant: 'light',
    clickToCreate: false,
    dragToCreate: false,
    dragToMove: false,
    dragToResize: false,
    calendarSystem: mobiscroll.jalaliCalendar,
    locale: mobiscroll.locale.fa
});

hijri = mobiscroll.eventcalendar('#demo-hijri', {
    theme: 'ios',
    themeVariant: 'light',
    clickToCreate: false,
    dragToCreate: false,
    dragToMove: false,
    dragToResize: false,
    calendarSystem: mobiscroll.hijriCalendar,
    locale: mobiscroll.locale.ar
});

mobiscroll.util.http.getJson('https://trial.mobiscroll.com/events/?vers=5', function(events) {
    gregorian.setEvents(events);
    jalali.setEvents(events);
    hijri.setEvents(events);
}, 'jsonp');