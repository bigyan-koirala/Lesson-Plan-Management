mobiscroll.setOptions({
    theme: 'ios',
    themeVariant: 'light'
});

var oldEvent;
var tempEvent = {};
var deleteEvent;
var restoreEvent;
var customDate;
var calendar;
var addEditPopup;
var eventDate;
var titleInput = document.getElementById('recurring-event-title');
var descriptionTextarea = document.getElementById('recurring-event-desc');
var allDaySwitch = document.getElementById('recurring-event-all-day');
var freeSegmented = document.getElementById('recurring-event-status-free');
var busySegmented = document.getElementById('recurring-event-status-busy');
var deleteButton = document.getElementById('recurring-event-delete');
var customRepeat = document.getElementById('demo-custom-repeat-cont');
var repeat = document.getElementById('recurring-event-repeat');
var until = document.getElementById('custom-repeat-until');
var repeatNr = document.getElementById('custom-repeat-nr');
var repeatData = [{
    value: 'norepeat',
    text: 'Does not repeat'
}, {
    value: 'daily',
    text: 'Daily'
}, {
    value: 'weekly',
    text: 'Weekly'
}, {
    value: 'monthly',
    text: 'Monthly'
}, {
    value: 'yearly',
    text: 'Yearly'
}, {
    value: 'weekday',
    text: 'Every weekday (Monday to Friday)'
}, {
    value: 'custom',
    text: 'Custom'
}];
var select;
var monthSelect;
var monthDaySelect;
var yearDaySelect;
var datePickerResponsive = {
    medium: {
        controls: ['calendar'],
        touchUi: false
    }
};
var selectResponsive = {
    xsmall: {
        touchUi: true
    },
    small: {
        touchUi: false
    }
};
var datetimePickerResponsive = {
    medium: {
        controls: ['calendar', 'time'],
        touchUi: false
    }
};
var myData = [{
    id: 1,
    start: '2021-08-08T13:00',
    end: '2021-08-08T13:30',
    title: '',
    color: '#26c57d'
}, {
    id: 2,
    start: '2021-08-08T15:00',
    end: '2021-08-08T16:00',
    title: '',
    color: '#fd966a'
}, {
    id: 3,
    start: '2021-08-07T18:00',
    end: '2021-08-07T22:00',
    title: '',
    color: '#37bbe4'
}, {
    id: 4,
    start: '2021-08-09T10:30',
    end: '2021-08-09T11:30',
    title: '',
    color: '#d00f0f'
}];
var days = [{
    name: 'Sunday',
    short: 'SU',
}, {
    name: 'Monday',
    short: 'MO',
}, {
    name: 'Tuesday',
    short: 'TU',
}, {
    name: 'Wednesday',
    short: 'WE',
}, {
    name: 'Thursday',
    short: 'TH',
}, {
    name: 'Friday',
    short: 'FR',
}, {
    name: 'Saturday',
    short: 'SA',
}];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var daySelect;
var repeatType = document.querySelectorAll('input[name=custom-repeat-type]');

// set dates by selected date
function updateOptionDates() {
    var d = new Date(tempEvent.start);
    var weekday = d.getDay();
    var monthday = d.getDate();
    var newData = repeatData.slice(0);

    for (var i = 0; i < newData.length; ++i) {
        var item = newData[i];
        switch (item.value) {
            case 'weekly':
                item.text = 'Weekly on ' + days[weekday].name;
                break;
            case 'monthly':
                item.text = 'Monthly on day ' + monthday;
                break;
            case 'yearly':
                item.text = 'Annually on ' + months[d.getMonth()] + ' ' + monthday;
                break;
        }
    }

    select.setOptions({ data: newData });
}

// popuplate data for months
function populateMonthDays(month, selectInst) {
    var options = '';
    var days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var newValues = [];

    for (var i = 1; i <= days[month - 1]; i++) {
        newValues.push(i.toString());
    }
    selectInst.setOptions({ data: newValues });
}

// change text depending on the chosen repeat type 
function updateContent(type) {
    document.querySelectorAll('.custom-repeat-text').forEach(function(elm) {
        if (elm.classList.contains('custom-repeat-' + type)) {
            elm.style.display = 'inline-block';
        } else {
            elm.style.display = 'none';
        }
    });
}

// set text for custom option
function setCustomText(recurring) {
    setTimeout(function() {
        var type = document.querySelector('input[name=custom-repeat-type]:checked').value;
        var condition = document.querySelector('input[name=custom-repeat-condition]:checked').value;
        var interval = +repeatNr.value;
        var weekDayNames = [];
        var rec;
        var customText;

        document.querySelectorAll('.custom-repeat-weekdays:checked').forEach(function(elm) {
            weekDayNames.push(elm.name);
        });

        switch (type) {
            case 'daily':
                customText = interval > 1 ? ('Every ' + interval + ' days') : 'Daily';
                break;
            case 'weekly':
                customText = interval > 1 ? ('Every ' + interval + ' weeks') : 'Weekly';
                customText += ' on ' + weekDayNames.join(', ');
                break;
            case 'monthly':
                customText = interval > 1 ? ('Every ' + interval + ' months') : 'Monthly';
                customText += ' on day ' + monthDaySelect.getVal();
                break;
            case 'yearly':
                customText = interval > 1 ? ('Every ' + interval + ' years') : 'Annualy';
                customText += ' on ' + document.querySelector('.custom-repeat-month option:selected').textContent + ' ' + yearDaySelect.getVal();
                break;
        }

        switch (condition) {
            case 'until':
                customText += ' until ' + mobiscroll.util.datetime.formatDate('MMMM D, YYYY', new Date(customDate.getVal()));
                break;
            case 'count':
                customText += ', ' + until.value + ' times';
                break;
        }

        if (recurring && recurring.interval) {
            var newData = repeatData.slice(0);
            newData.push({ value: 'custom-value', text: customText })
            select.setOptions({ data: newData });
            select.setVal('custom-value');
        }
    });
}

// set custom values to default
function resetCustomValues() {
    mobiscroll.getInst(document.querySelector('input[name=custom-repeat-type][value="daily"]')).checked = true;
    repeatNr.value = 1;
    mobiscroll.getInst(document.querySelector('input[name=custom-repeat-condition][value="never"]')).checked = true;
    until.value = 1;
    monthSelect.setVal(1);
    monthDaySelect.setVal(1)
    yearDaySelect.setVal(1);
    document.querySelectorAll('.custom-repeat-weekdays').forEach(function(elm) {
        mobiscroll.getInst(elm).checked = elm.value === 'SU';
    });
    select.setVal('norepeat');
    showHideCustom();
}

function getRecurringRule() {
    var rec;
    var selected = select.getVal();

    if (selected === 'custom' || selected === 'custom-value') {
        // save custom recurring option when the popup is closed
        var type = document.querySelector('input[name=custom-repeat-type]:checked').value;
        var condition = document.querySelector('input[name=custom-repeat-condition]:checked').value;
        var weekDays = [];
        var customText;

        document.querySelectorAll('.custom-repeat-weekdays:checked').forEach(function(elm) {
            weekDays.push(elm.value);
        });

        rec = {
            repeat: type,
            interval: +repeatNr.value
        };

        switch (type) {
            case 'weekly':
                rec.weekDays = weekDays.join(',');
                break;
            case 'monthly':
                rec.day = monthDaySelect.getVal();
                break;
            case 'yearly':
                rec.day = yearDaySelect.getVal();
                rec.month = monthSelect.getVal();
                break;
        }

        switch (condition) {
            case 'until':
                rec.until = customDate.getVal();
                break;
            case 'count':
                rec.count = until.value;
                break;
        }
    }
    return rec;
}

function showHideCustom() {
    setTimeout(function() {
        if (select.getVal() !== 'custom' && select.getVal() !== 'custom-value') {
            customRepeat.style.display = 'none';
        } else {
            customRepeat.style.display = 'block';
        }
    });
}

function navigateTo(date) {
    var rec = tempEvent.recurring;
    var stDate = new Date(tempEvent.start);
    var d = date || stDate;
    var nextYear = 0;

    // navigate the calendar to the correct view
    if (rec && rec.repeat === 'yearly') {
        if (d.getMonth() + 1 > +rec.month && d.getDay() > +rec.day) {
            nextYear = 1;
        }
        calendar.navigate(new Date(stDate.getFullYear() + nextYear, rec.month - 1, rec.day));
    } else {
        calendar.navigate(stDate);
    }
}

function createAddPopup(elm) {
    // hide delete button inside add popup
    deleteButton.style.display = 'none';

    deleteEvent = true;
    restoreEvent = false;

    // set popup header text and buttons for adding
    popup.setOptions({
        headerText: 'New event',
        buttons: ['cancel', {
            text: 'Add',
            keyCode: 'enter',
            handler: function() {
                calendar.updateEvent({
                    id: tempEvent.id,
                    title: tempEvent.title,
                    description: tempEvent.description,
                    allDay: tempEvent.allDay,
                    start: tempEvent.start,
                    end: tempEvent.end,
                    color: tempEvent.color,
                    recurring: getRecurringRule()
                });

                // navigate the calendar to the correct view
                navigateTo();

                deleteEvent = false;
                popup.close();
            },
            cssClass: 'mbsc-popup-button-primary'
        }]
    });

    // fill popup with a new event data
    mobiscroll.getInst(titleInput).value = tempEvent.title;
    mobiscroll.getInst(descriptionTextarea).value = '';
    mobiscroll.getInst(allDaySwitch).checked = true;
    range.setVal([tempEvent.start, tempEvent.end]);
    mobiscroll.getInst(busySegmented).checked = true;
    range.setOptions({ controls: ['date'], responsive: datePickerResponsive });

    // set anchor for the popup
    popup.setOptions({ anchor: elm });

    updateOptionDates();
    resetCustomValues();

    popup.open();
}

function createEditPopup(args) {
    var ev = args.event;

    // show delete button inside edit popup
    deleteButton.style.display = 'block';

    deleteEvent = false;
    restoreEvent = true;

    // set popup header text and buttons for editing
    popup.setOptions({
        headerText: 'Edit event',
        buttons: ['cancel', {
            text: 'Save',
            keyCode: 'enter',
            handler: function() {
                var date = range.getVal();

                // update event with the new properties on save button click
                calendar.updateEvent({
                    id: ev.id,
                    title: titleInput.value,
                    description: descriptionTextarea.value,
                    allDay: mobiscroll.getInst(allDaySwitch).checked,
                    start: date[0],
                    end: date[1],
                    free: mobiscroll.getInst(freeSegmented).checked,
                    color: ev.color,
                    recurring: getRecurringRule()
                });

                // navigate the calendar to the correct view
                calendar.navigate(date[0]);;

                restoreEvent = false;
                popup.close();
            },
            cssClass: 'mbsc-popup-button-primary'
        }]
    });

    // fill popup with the selected event data
    mobiscroll.getInst(titleInput).value = ev.title || '';
    mobiscroll.getInst(descriptionTextarea).value = ev.description || '';
    mobiscroll.getInst(allDaySwitch).checked = ev.allDay || false;
    range.setVal([ev.start, ev.end]);

    if (ev.free) {
        mobiscroll.getInst(freeSegmented).checked = true;
    } else {
        mobiscroll.getInst(busySegmented).checked = true;
    }

    // change range settings based on the allDay
    range.setOptions({
        controls: ev.allDay ? ['date'] : ['datetime'],
        responsive: ev.allDay ? datePickerResponsive : datetimePickerResponsive
    });

    // set anchor for the popup
    popup.setOptions({ anchor: args.domEvent.currentTarget });

    // set repeat type from recurring rule
    var repeatType,
        rec = ev.recurring;

    if (rec) {
        if (rec.interval) {
            var condition;

            repeatType = 'custom-value';

            mobiscroll.getInst(document.querySelector('input[name=custom-repeat-type][value=' + rec.repeat + ']')).checked = true;

            repeatNr.value = rec.interval;

            if (rec.until) {
                condition = 'until';
            } else if (rec.count) {
                condition = 'count';
            } else {
                condition = 'never';
            }

            mobiscroll.getInst(document.querySelector('input[name=custom-repeat-condition][value=' + condition + ']')).checked = true;

            if (rec.weekDays) {
                var weekD = rec.weekDays.split(',')
                document.querySelectorAll('.custom-repeat-weekdays').forEach(function(elm) {
                    if (weekD.indexOf(elm.value) > 0) {
                        mobiscroll.getInst(elm).checked = true;
                    }
                });
            }

            if (rec.day) {
                if (rec.repeat === 'yearly') {
                    yearDaySelect.setVal(rec.day);
                    if (rec.month) {
                        monthSelect.setVal(rec.month);
                    }
                } else {
                    monthDaySelect.setVal(rec.day)
                }
            }
            updateContent(rec.repeat);
        } else if (rec.weekDays === 'MO,TU,WE,TH,FR') {
            repeatType = 'weekday';
        } else {
            repeatType = rec.repeat;
        }
    } else {
        repeatType = 'norepeat';
        resetCustomValues();
    }

    select.setVal(repeatType);
    updateOptionDates();
    showHideCustom();

    popup.open();
}

updateContent('daily');

var calendar = mobiscroll.eventcalendar('#demo-add-delete-event', {
    clickToCreate: 'double',
    dragToCreate: true,
    dragToMove: true,
    dragToResize: true,
    view: {
        calendar: { labels: true }
    },
    data: myData,
    onEventClick: function(args) {
        var event = args.event.original ? args.event.original : args.event;

        oldEvent = {...event };
        tempEvent = event;

        setCustomText(event.recurring);

        if (!popup.isVisible()) {
            createEditPopup(args);
        }
    },
    onEventCreated: function(args) {
        popup.close();
        // store temporary event
        tempEvent = args.event;
        createAddPopup(args.target);
    }
});

var popup = mobiscroll.popup('#demo-add-popup', {
    display: 'bottom',
    contentPadding: false,
    fullScreen: true,
    scrollLock: false,
    height: 500,
    onClose: function() {
        var newData = repeatData.slice(0);
        select.setOptions({ data: newData.filter(function(item) { return item.value !== 'custom-value'; }) });
        if (deleteEvent) {
            calendar.removeEvent(tempEvent);
        } else if (restoreEvent) {
            calendar.updateEvent(oldEvent);
        }
    },
    responsive: {
        medium: {
            display: 'anchored',
            width: 510,
            fullScreen: false,
            touchUi: false
        }
    }
});

titleInput.addEventListener('input', function(ev) {
    // update current event's title
    tempEvent.title = ev.target.value;
});

descriptionTextarea.addEventListener('change', function(ev) {
    // update current event's title
    tempEvent.description = ev.target.value;
});

allDaySwitch.addEventListener('change', function() {
    var checked = this.checked
        // change range settings based on the allDay
    range.setOptions({
        controls: checked ? ['calendar'] : ['calendar', 'time'],
        responsive: checked ? datePickerResponsive : datetimePickerResponsive
    });

    // update current event's allDay property
    tempEvent.allDay = checked;
});

var range = mobiscroll.datepicker('#recurring-event-date', {
    controls: ['calendar'],
    select: 'range',
    startInput: '#start-input',
    endInput: '#end-input',
    showRangeLabels: false,
    touchUi: true,
    responsive: datePickerResponsive,
    onChange: function(args) {
        var date = args.value;

        // update event's start date
        tempEvent.start = date[0];
        tempEvent.end = date[1];
        updateOptionDates();
    }
});

document.querySelectorAll('input[name=event-status]').forEach(function(elm) {
    elm.addEventListener('change', function() {
        // update current event's free property
        tempEvent.free = mobiscroll.getInst(freeSegmented).checked;
    });
});

deleteButton.addEventListener('click', function() {
    // delete current event on button click
    calendar.removeEvent(oldEvent);
    popup.close();
});

repeatType.forEach(function(elm) {
    elm.addEventListener('change', function(ev) {
        updateContent(ev.target.value);
    });
});

select = mobiscroll.select('#recurring-event-repeat', {
    data: repeatData,
    responsive: selectResponsive,
    onChange: function(event, inst) {
        var d = new Date(tempEvent.start)
        var weekday = d.getDay();
        var monthday = d.getDate();

        // set recurring option
        switch (event.value) {
            case 'daily':
                tempEvent.recurring = {
                    repeat: 'daily'
                };
                break;
            case 'weekly':
                tempEvent.recurring = {
                    repeat: 'weekly',
                    weekDays: days[weekday].short
                };
                break;
            case 'monthly':
                tempEvent.recurring = {
                    repeat: 'monthly',
                    day: monthday
                };
                break;
            case 'yearly':
                tempEvent.recurring = {
                    repeat: 'yearly',
                    day: monthday,
                    month: d.getMonth() + 1
                };
                break;
            case 'weekday':
                tempEvent.recurring = {
                    repeat: 'weekly',
                    weekDays: 'MO,TU,WE,TH,FR'
                };
                break;
            case 'custom':
            case 'custom-value':
                updateContent(document.querySelector('input[name=custom-repeat-type]:checked').value);
                customDate.setVal(d);
                customRepeat.style.display = 'block';
                break;
            default:
                tempEvent.recurring = null;
        }

        showHideCustom();
    }
});

monthSelect = mobiscroll.select('#custom-repeat-month', {
    responsive: selectResponsive,
    inputElement: document.getElementById('custom-repeat-month-input'),
    onChange: function(event, inst) {
        populateMonthDays(+event.value, yearDaySelect)
    }
});

monthDaySelect = mobiscroll.select('#custom-repeat-month-day', {
    responsive: selectResponsive,
    maxWidth: 80
});

yearDaySelect = mobiscroll.select('#custom-repeat-year-day', {
    responsive: selectResponsive,
    maxWidth: 80
});

populateMonthDays(1, monthDaySelect);
populateMonthDays(1, yearDaySelect);
monthDaySelect.setVal('1');
yearDaySelect.setVal('1');

customDate = mobiscroll.datepicker('#custom-repeat-date', {
    controls: ['calendar'],
    display: 'anchored',
    touchUi: false,
    dateFormat: 'YYYY-MM-DD',
    returnFormat: 'iso8601',
    onOpen: function() {
        document.querySelector('input[name=custom-repeat-condition][value=until]').click();
    }
});

until.addEventListener('click', function() {
    document.querySelector('input[name=custom-repeat-condition][value=count]').click();
});