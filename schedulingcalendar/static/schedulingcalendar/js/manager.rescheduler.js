/*
 * JavaScript code for processing customized fullCalendar for ReScheduler
 * 
 * Author: Ryan Johnson
 */

$(document).ready(function() {
  /**
   * Selectors And Variables
   */
  // Constant variables
  var WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday",
                  "Friday", "Saturday", "Sunday"];
  var DATE_FORMAT = "YYYY-MM-DD";
  var EMPLOYEELESS_EVENT_ROW = 1000;  

  // General state variables
  var displaySettings = {};
  var dayNoteHeaders = {};
  var dayNoteBodies = {};
  var scheduleNotes = {};
  var employeeNameDict = {};
  var employeeSortedIdList = []; // Ids sorted by first name, then last
  var employeesAssigned = [];
  var troDates = {};
   
  // Jquery object variables
  var $fullCal = $("#calendar");
  var $scheduleInfo = $("#schedule-info");
  var $addScheduleDate = $("#add-date");
  var $addScheduleDep = $("#new-schedule-dep");
  var $conflictAssignBtn = $("#conflict-assign-btn");
  var $calendarLoaderForm = $("#load-calendar-form");
  var $cramRowsBtn = $("#cram-rows");
  $cramRowsBtn.click(cramRows);
  
  $fullCal.fullCalendar({
    fixedWeekCount: false,
    height: "auto",
    editable: false,
    events: [],
    eventBackgroundColor: "transparent",
    eventTextColor: "black",
    eventBorderColor: "transparent",
    eventOrder: "customSort,eventRowSort,title",
        
    header: {
      left: "",
      center: "title",
      right: ""
    },
    
    /**
     * Highlight the current clicked event, the day it belongs to, then fetch
     * the eligable list corresponding to this schedule. Also ensure the hidden
     * input add-date for adding schedules corresponds to potentially new 
     * highlighted day.
     */
    eventClick: function(calEvent, jsEvent, view) {
      // Remove any previous highlight class before highlighting this event
      $(".fc-event-clicked").removeClass("fc-event-clicked");
      $(this).find("div").addClass("fc-event-clicked");
      $(".fc-day-clicked").removeClass("fc-day-clicked");
      var date = calEvent.start.format("YYYY-MM-DD");
      $("td[data-date="+date+"]").addClass("fc-day-clicked");
      $addScheduleDate.val(date);
      
      // Make remove button active since an event is clicked
      $(".fc-swapSchedule-button").removeClass("fc-state-disabled");
      var pk = calEvent.id;
      // TODO Add get employee's to swap with
    },
        
    /** Highlight event when mouse hovers over event. */
    eventMouseover: function(calEvent, jsEvent, view) {
      var date = calEvent.start.format("YYYY-MM-DD");
      $("td[data-date="+date+"]").addClass("fc-days-event-mouseover");
    },
        
    /** De-highlight event when mouse stops hovering over event. */
    eventMouseout: function(calEvent, jsEvent, view) {
      var date = calEvent.start.format("YYYY-MM-DD");
      $("td[data-date="+date+"]").removeClass("fc-days-event-mouseover");
    },
        
    /** Mark the html elements of event with event id for later queries. */
    eventRender: function (event, element, view) {
      element.attr("id", "event-id-" + event.id);
      element.data("event-id", event.id);
    }, 
        
    /**
     * Highlight day when clicked, de-highlighted previous clicked day. Update
     * schedule adding form for date parameter to match date of the day that 
     * has just been clicked.
     */
    dayClick: function(date, jsEvent, view) {
      $curr_day_clicked = $("td[data-date="+date.format('YYYY-MM-DD')+"]");
      $prev_day_clicked = $(".fc-day-clicked");
          
      if (!$curr_day_clicked.is($prev_day_clicked)) {
        $prev_day_clicked.removeClass("fc-day-clicked");
        $curr_day_clicked.addClass("fc-day-clicked");
        
        $addScheduleDate.val(date.format("YYYY-MM-DD"));  
        $(".fc-event-clicked").removeClass("fc-event-clicked");
        // Disable remove schedule button, no schedule selected if new day clicked
        $(".fc-swapSchedule-button").addClass("fc-state-disabled");
      }
    }
  });
      
  // When calendar is first loaded no schedule is selected to be removed
  // so we disable the remove button.
  $(".fc-swapSchedule-button").addClass("fc-state-disabled");
    
  // Turn loadSchedules into a callback function for the load-calendar-form
  var options = {success: loadSchedules,
                 error: calendarNotFoundError}
  $("#load-calendar-form").ajaxForm(options); 
  
      
  /**
   * Callback for load-calendar-form which is a html get form that asks for a 
   * calendar. loadSchedules then uses the received HTTP response to update the
   * fullCalendar view, title, and events.
   */
  function loadSchedules(json_data) {
    var info = JSON.parse(json_data);
    console.log(info);
    employeesAssigned = [];
    // Save display settings for calendar events
    displaySettings = info["display_settings"];
    troDates = info['tro_dates'];
    
    // Get new calendar month view via date
    var format = "YYYY-MM-DDThh:mm:ss";
    var newCalDate = moment(info["date"], format);
    $fullCal.fullCalendar("gotoDate", newCalDate);
        
    // Change calendar title and schedule adding form title to new department
    var depName = $calendarLoaderForm.data("department-name");
    var cal_title = depName + ": " + newCalDate.format("MMMM, YYYY") + " Version " + info["version"];
    $(".fc-center").find("h2").text(cal_title);
        
    // Delete any previously loaded events before displaying new events
    $fullCal.fullCalendar("removeEvents");
        
    // Get schedules, employees, and notes for loading into calendar
    var schedules = info["schedules"];
    var employees = info["employees"];
    _createEmployeeSortedIdList(employees);
    employeeNameDict = _employeePkToName(employees);
    var dayHeaderNotes = info["day_note_header"];
    var dayBodyNotes = info["day_note_body"];

    // Create fullcalendar events corresponding to schedule
    if (displaySettings["unique_row_per_employee"]) {
      var events = _schedulesToUniqueRowEvents(schedules);
    } else {
      var events = _schedulesToEvents(schedules);
    }
    
    // Collection of day body notes to be rendered as fullcalendar events
    for (var i=0;i<dayBodyNotes.length;i++) { 
      dayNoteBodies[dayBodyNotes[i]["date"]] = dayBodyNotes[i];
      if (dayBodyNotes[i]["body_text"]) { // Don't Display blank notes
        var event = {
          id:"body-note-" + dayBodyNotes[i]["date"],
          title: dayBodyNotes[i]["body_text"],
          start: dayBodyNotes[i]["date"],
          allDay: true,
          isSchedule: false,
          customSort: 1,
          className: "blank-event bold note"
        }
        events.push(event);
      }
    }
    // Render event collection
    $fullCal.fullCalendar("renderEvents", events);
    
    // Collection of day header notes to be rendered manually
    for (var i=0;i<dayHeaderNotes.length;i++) { 
      dayNoteHeaders[dayHeaderNotes[i]["date"]] = dayHeaderNotes[i];
      _dayNoteHeaderRender(dayHeaderNotes[i]);
    }
    
    // Make other month days displayed not gray'd out
    $(".fc-other-month").removeClass("fc-other-month");
    
    // Ensure calendar is visible once fully loaded
    $fullCal.css("visibility", "visible");
  }
  
  
  /** Helper function to create fullcalendar events with unique rows */
  function _schedulesToUniqueRowEvents(schedules) {
    var scheduleEvents = [];
    visibleDates = visibleFullCalDates();
    
    // Append schedules to appropriate date and compile list of employee pks
    // assigned to any schedules
    for (var i=0;i<schedules.length;i++) {
      var startDateTime = moment(schedules[i]["start_datetime"]);
      var startDate = startDateTime.format(DATE_FORMAT);
      // Ensure only schedules that have visible date on fullCalendar are rendered
      if (visibleDates.hasOwnProperty(startDate)) {
        visibleDates[startDate].push(schedules[i]);
        // Create list of employees assigned to any schedules
        var employeePk = schedules[i].employee;
        if (employeePk && !employeesAssigned.includes(employeePk)) {
          employeesAssigned.push(employeePk);
        }
      }
    }
    // Iterate thru each date's schedules and create appropriate events
    for (var date in visibleDates) {
      if (visibleDates.hasOwnProperty(date)) {
        var employeesNotAssignedOnThisDate = employeesAssigned.slice(0);
        var schedules = visibleDates[date];
        var employelessSchedules = [];
        // Create events for schedules with employees
        for (var i=0;i<schedules.length;i++) {
          var schedulePk = schedules[i]["id"];
          var schEmployePk = schedules[i]["employee"];
          if (schEmployePk != null) {
            var eventRow = employeeSortedIdList.indexOf(schEmployePk);
            var employeeRowIndex = employeesNotAssignedOnThisDate.indexOf(schEmployePk);
            if (employeeRowIndex > -1) {
              employeesNotAssignedOnThisDate.splice(employeeRowIndex, 1);
            }
            var fullCalEvent = _scheduleToFullCalendarEvent(schedules[i], eventRow)                    
            scheduleEvents.push(fullCalEvent);
          } else { // Create events for employeeless schedules
            var fullCalEvent = _scheduleToFullCalendarEvent(schedules[i], EMPLOYEELESS_EVENT_ROW)                    
            scheduleEvents.push(fullCalEvent);
          }
        }
        // Create blank events for any empty employee rows for given date
        for (var i=0;i<employeesNotAssignedOnThisDate.length;i++) {
          var eventRowEmployeePk = employeesNotAssignedOnThisDate[i];
          eventRow = employeeSortedIdList.indexOf(eventRowEmployeePk);
          var fullCalEvent = _createBlankEvent(date, eventRowEmployeePk, eventRow);
          scheduleEvents.push(fullCalEvent);
        }  
      }
    }
    return scheduleEvents;
  }
  
  
  /** Helper function to create fullcalendar events given schedules */
  function _schedulesToEvents(schedules) {
    var scheduleEvents = [];
    // Create fullcalendar event corresponding to schedule
    for (var i=0;i<schedules.length;i++) {
      var fullCalEvent = _scheduleToFullCalendarEvent(schedules[i], 1);
      scheduleEvents.push(fullCalEvent);
    }
    return scheduleEvents;
  }
  
  
  /** Helper function to create a single full calendar event given schedule */
  function _scheduleToFullCalendarEvent(schedule, eventRow) {
    var schedulePk = schedule["id"];
    var startDateTime = schedule["start_datetime"]; 
    var endDateTime = schedule["end_datetime"];
    var hideStart = schedule["hide_start_time"]; 
    var hideEnd = schedule["hide_end_time"];
    var note = schedule["schedule_note"];
    scheduleNotes[schedulePk] = note; // For loading schedule note form field
       
    // Get employee name for event title string
    var firstName = "";
    var lastName = "";
    var isEmployeeAssigned = false;
    var schEmployePk = schedule["employee"];
    if (schEmployePk != null) {
      firstName = employeeNameDict[schEmployePk]["firstName"];
      lastName = employeeNameDict[schEmployePk]["lastName"];
      isEmployeeAssigned = true;
    }
    var str = getEventStr(startDateTime, endDateTime, hideStart, hideEnd,
                          firstName, lastName, note); 
                                             
    var fullCalEvent = {
      id: schedulePk,
      title: str,
      start: startDateTime,
      endDt: endDateTime, // cannot use normal end when allDay is true
      allDay: true,
      isSchedule: true,
      employeeAssigned: isEmployeeAssigned,
      customSort: 0,
      eventRowSort: eventRow,
      employeePk: schEmployePk
    } 
    return fullCalEvent;
  }
  
  
  /** Helper function to create a blank full calendar event */
  function _createBlankEvent(date, employeePk, eventRow) {
    var str = _getBlankEventStr(date, employeePk);
    var className = "blank-event";
    if (str) { className += " tro-event"}
    var fullCalEvent = {
      id: date + "-" + employeePk,
      title: str,
      start: date,
      allDay: true,
      isSchedule: false,
      employeeAssigned: false,
      customSort: 0,
      eventRowSort: eventRow,
      employeePk: -1,
      className: className
    }
    return fullCalEvent;
  }
  
  
  /** Helper function to create str for blank event */
  function _getBlankEventStr(date, employeePk) {
    var vacations = troDates['vacations'];
    var unavailabilities = troDates['unavailabilities'];
    var troObjects = vacations.concat(unavailabilities);
    for (var i=0;i<troObjects.length;i++) {
      var tro = troObjects[i];
      if (tro.employee == employeePk) {
          startDate = moment(tro.start_datetime, DATE_FORMAT);
          endDate = moment(tro.end_datetime, DATE_FORMAT);
          blankDate = moment(date);
          if(blankDate.isSameOrAfter(startDate) && blankDate.isSameOrBefore(endDate)) {
            // Construct employee name string based off of display settings
            var displayLastNames = displaySettings["display_last_names"]; 
            var displayLastNameFirstChar = displaySettings["display_first_char_last_name"]; 
            
            var lastName = "";
            var employeeLastName = employeeNameDict[employeePk].lastName;
            if (displayLastNameFirstChar) {
              lastName = employeeLastName.charAt(0);
            } else if (displayLastNames) {
              lastName = employeeLastName;
            }
            return "TOR: " + employeeNameDict[employeePk].firstName + " " + lastName;
          }
      }
    }
    return "";
  }
  
  
  /** Helper function that creates a sorted list of employee pks */
  function _createEmployeeSortedIdList(employees) {
    employeeSortedIdList = employees.map(function(e) { return e.id; })
  }
  
  
  /** Creates object string dates of visible fullcal dates mapping to empty arrays*/
  function visibleFullCalDates() {
    startDate = $fullCal.fullCalendar('getView').start.format('YYYY-MM-DD');
    endDate = $fullCal.fullCalendar('getView').end.format('YYYY-MM-DD');
    visibleDatesList = _enumerateDaysBetweenDates(startDate, endDate);
    
    var visibleDatesObj = {};
    
    for(var i=0; i<visibleDatesList.length; i++) {
      visibleDatesObj[visibleDatesList[i]] = [];
    }
    
    return visibleDatesObj;
  }
  
  
  /** Create a list of all dates between a start and end date */
  function _enumerateDaysBetweenDates(startDate, endDate) {
    var dates = [];
    
    var currDate = moment(startDate).startOf('day');
    var lastDate = moment(endDate).startOf('day');

    dates.push(currDate.format(DATE_FORMAT));
    while(currDate.add(1, 'days').diff(lastDate) < 0) {
        dates.push(currDate.format(DATE_FORMAT));
    }

    return dates;
  }
  
  
  /** Helper function for rendering day not headers for the full calendar */
  function _dayNoteHeaderRender(dayHeaderObj) {
    var date = dayHeaderObj["date"];
    var $dayHeader = $("thead td[data-date="+date+"]");
    var dayNumber = $dayHeader.children().first().text();
    var HTML = "<span class='fc-day-number fright'>" + dayNumber + "</span>" +
               "<span class='fc-day-number fleft'><b>" + dayHeaderObj["header_text"] + "</b></span>"
    $dayHeader.html(HTML);
  }
  
  
  /**
   * Callback where user queries for calendar that does not exist
   */
  function calendarNotFoundError(jqXHR, exception) {
    // Clear any events to indicate no calendar for this date
    $fullCal.fullCalendar("removeEvents");
    
    // Ensure calendar is visible
    $fullCal.css("visibility", "visible");
    
    // Set calendar title to indicate it does not exist
    var cal_title = jqXHR.responseText
    $(".fc-center").find("h2").text(cal_title);
    
    // Show no calendar alert modal
    $noCalendarModal = $("#noCalendarModal");
    $noCalendarModal.css("margin-top", Math.max(0, ($(window).height() - $noCalendarModal.height()) / 2));
    $noCalendarModal.modal('show');
  }
  
  
  // Load schedule upon loading page relative to current date
  var liveCalDate = new Date($calendarLoaderForm.data("date"));
  var m = liveCalDate.getMonth() + 1; //Moment uses January as 0, Python as 1
  var y = liveCalDate.getFullYear();
  var department = $calendarLoaderForm.data("department");
  var version = $calendarLoaderForm.data("live-cal-version");
  
  $("#id_month").val(m + 1);
  $("#id_year").val(y);
  $("#id_department").val(department);
  $("#id_version").val(version);
  $("#get-calendar-button").trigger("click"); 
    
  
  /**
   * Given an HTTP response of employee objects, create a mapping from employee
   * pk to employee name for quick access for employee names.
   */
  function _employeePkToName(employees) {
    var EmployeePkDict = {};
    for (var i=0; i < employees.length; i++) {
      var employeePk = employees[i]["id"];
      var firstName = employees[i]["first_name"];
      var lastName = employees[i]["last_name"];
      EmployeePkDict[employeePk] = {"firstName": firstName,
                                    "lastName": lastName};
    }
    return EmployeePkDict;
  }
  
  
  /**
   * Concatenate strings for start time, end time, and employee name (if the
   * the schedule has an employee assigned). start and end are javascript 
   * moment objects.
   */
  function getEventStr(start, end, hideStart, hideEnd, firstName, lastName, note) {
    // Construct time string based off of display settings
    var displayMinutes = displaySettings["display_minutes"];
    var displayNonzeroMinutes = displaySettings["display_nonzero_minutes"];
    var displayAMPM = displaySettings["display_am_pm"];
    
    timeFormat = "h"
    if (displayMinutes && !displayNonzeroMinutes) { timeFormat += ":mm"; }
    if (displayAMPM) { timeFormat += " a"; }
     
    // Construct time strings
    var startStr = "?";
    if (!hideStart) {
      var startDateTime = moment(start);
      if (displayNonzeroMinutes && startDateTime.minute() != 0) {
        onlyNonZeroTimeFormat = "h:mm";
        if (displayAMPM) { onlyNonZeroTimeFormat += " a"; }
        startStr = startDateTime.format(onlyNonZeroTimeFormat);
      } else {
        startStr = startDateTime.format(timeFormat);
      }
    }
    var endStr = "?";
    if (!hideEnd) {
       var endDateTime = moment(end);
       if (displayNonzeroMinutes && endDateTime.minute() != 0) {
          onlyNonZeroTimeFormat = "h:mm";
          if (displayAMPM) { onlyNonZeroTimeFormat += " a"; }
          endStr = endDateTime.format(onlyNonZeroTimeFormat);
       } else {
          endStr = endDateTime.format(timeFormat);
       }
    }
    
    // Construct employee name string based off of display settings
    var displayLastNames = displaySettings["display_last_names"]; 
    var displayLastNameFirstChar = displaySettings["display_first_char_last_name"]; 
    
    var employeeStr = "";
    if (firstName) {
      employeeStr = ": " + firstName;
      if (displayLastNameFirstChar && lastName) {
        employeeStr += " " + lastName.charAt(0);
      }
      if (displayLastNames && lastName && !displayLastNameFirstChar) {
        employeeStr += " " + lastName;
      }
    }
    
    // Combine time and name strings to full construct event string title
    var str = startStr + " - " + endStr + employeeStr;
    if (note) {
      str += " " + note;
    }
    return str;
  }
    
  
  /** Callback function for user to print calendar via print button on page */
  function cramRows(event) {
    var $cramRowsBtn = $("#cram-rows");
    var cramRowsTxt = $cramRowsBtn.text();
    console.log(cramRowsTxt);
    if (cramRowsTxt == "Cram Rows Off") {
      $(".fc-event-container a").addClass("cram-rows");
      $cramRowsBtn.text("Cram Rows On");
    } else {
      $(".fc-event-container a").removeClass("cram-rows");
      $cramRowsBtn.text("Cram Rows Off");
    }
  }
});

/** Validate request get a calendar and associated data */
function validateGetCalendarForm() {
  //TODO: Check valid years, etc.
}