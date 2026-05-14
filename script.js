document.addEventListener("DOMContentLoaded", function () {
  var date = moment().format("YYYYMMDD");	//today's date
  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [FullCalendarTimeGrid.default, FullCalendarGoogleCalendar.default],
    defaultView: "timeGridDay",
    googleCalendarApiKey: "AIzaSyBIYA-CNdqobdYgfGhnDHw6lDy4PS0tLz4",
    nowIndicator: true,
    contentHeight: "auto",
    minTime: "08:00:00",
    maxTime: "15:30:00",
    slotLabelFormat: {
      hour: "numeric",
      omitZeroMinute: true,
      meridiem: false
    },
    header: {
      left: "title",
      center: "",
      // right:  'prev,next'
      right: ""
    },
    titleFormat: { month: "short", day: "numeric", year: "numeric" },
    resourceAreaWidth: "50px",
    //slotLabelInterval: {hours:1},
    //scrollTime: '08:00:00',
    allDaySlot: false,
    //now: '2020-01-16', // just for demo
    eventSources: [
      { googleCalendarId: "nfenger@pps.net" }, //Personal
      {
        googleCalendarId:
          "apps4pps.net_ladh6rs01p7ug5p59aig48ov5s@group.calendar.google.com"
      }, //Bells
      {
        googleCalendarId:
          "apps4pps.net_fk4rj748ds84ie7i3kera5menk@group.calendar.google.com"
      } //, //Task List
      //  {googleCalendarId: 'ghsrobotics3636@gmail.com' } //Robotics
    ],

    eventClick: function (arg) {
      // opens events in a popup window
      window.open(arg.event.url, "_blank", "width=700,height=600");
      // prevents current tab from navigating
      arg.jsEvent.preventDefault();
    },

    eventRender: function (info) {
      var timeStart = FullCalendar.formatDate(info.event.start, {
        hour: "numeric",
        minute: "numeric",
        meridiem: false
      });

      var timeEnd = FullCalendar.formatDate(info.event.end, {
        hour: "numeric",
        minute: "numeric",
        meridiem: false
      });
      //Decrease Font of End Time
      info.el.querySelector(".fc-time").innerHTML =
        "<font size=4em>" + timeStart + "-" + timeEnd + "</font>"; //move end font tag and br after timeStart for larger time End (default is larger)
    }
  }); //end of calendar setup

  var midnight = "00:00:00";
  var now = null;

  
  setInterval(function () {
    var refresh = "08:24:00";
    now = moment();
    var firstRun = true;
    $("#time").text(now.format("h:mm:ss"));
    
    if (now.format("HH:mm:ss") === refresh) {                       // refresh the browser when we hit the refresh time to catch a schedule change
 	    //alert('reset() function here');
      const url = new URL(window.location.href);
      url.searchParams.set('reloadTime', Date.now().toString());
      window.location.href = url.toString();
    }
    // if (now.format("HH:mm:ss") === midnight) {
    //   refreshCountdown = refreshIntervalSeconds; // Reset interval counter at midnight
    //   //alert('reset() function here');
    //   calendar.today();      
    //   calendar.refetchEvents();
    // }

if (moment().format("YYYYMMDD") != date){ // refresh browser window if saved date isn't same as current date (we've passed midnight)
		//const onlineCheck = await checkOnlineStatus();          // checks to see if we're online
		//console.log("DIFFERENT DAY - Online status: " + onlineCheck);
		if (true){				// only refresh page if we're online
			const url = new URL(window.location.href);
			url.searchParams.set('reloadTime', Date.now().toString());
			window.location.href = url.toString();
		}
	}
    

    
    if (true /*now.minutes() == 0 || firstRun */) {
      firstRun = false;
      var scrollTime = moment();
      var startScrolltime = scrollTime.subtract({ hours: 0, minutes: 30 });
      calendar.setOption("minTime", startScrolltime.format("HH:mm:ss"));
      calendar.setOption(
        "maxTime",
        scrollTime.add({ hours: 4, minutes: 0 }).format("HH:mm:ss")
      );
      //var rangeStart = calendar.state.dateProfile.renderRange.start;
      calendar.setOption("scrollTime", startScrolltime);
      //console.log(now.format("h:mm:ss"));
      //console.log(now.seconds() + "--------------");

      var currEvent = null;
      var minElapsed = 0;
      var minToGo = 0;

      var eventsUnsorted = calendar.getEvents();
      var numEvents = eventsUnsorted.length;
      //https://stackoverflow.com/questions/1069666/sorting-object-property-by-values/1069840#1069840
      var events = eventsUnsorted.slice();
      events.sort((a, b) => a.start - b.start);
      //console.log(events.length);

      for (let i = 0; i < numEvents; i++) {
        currEvent = events[i];

        //skip events without start or end
        if (events[i].end && events[i].start) {
          currEventStartMin =
            currEvent.start.getHours() * 60 + currEvent.start.getMinutes();
          currEventEndMin =
            currEvent.end.getHours() * 60 + currEvent.end.getMinutes();

          var nowMinOfDay = now.hour() * 60 + now.minutes();

          if (
            nowMinOfDay >= currEventStartMin &&
            nowMinOfDay < currEventEndMin
          ) {
            //check in event
            minToGo = currEventEndMin - nowMinOfDay;
            minElapsed = nowMinOfDay - currEventStartMin;
          } else {
            if (i < numEvents - 1) {
              //check between events (passing times)
              nextEventStartMin =
                events[i + 1].start.getHours() * 60 +
                events[i + 1].start.getMinutes();
              if (
                nowMinOfDay >= currEventEndMin &&
                nowMinOfDay <= nextEventStartMin
              ) {
                //i+1 is next event
                minToGo = nextEventStartMin - nowMinOfDay;
                minElapsed = nowMinOfDay - currEventEndMin; //i+1 is previous event
              }
            } else if (i == 0 && nowMinOfDay <= currEventStartMin) {
              //check before first event

              minToGo = currEventStartMin - nowMinOfDay;
              minElapsed = 0;
            } else if (i == numEvents - 1 && nowMinOfDay >= currEventEndMin) {
              //check after last event
              minToGo = 0;
              minElapsed = nowMinOfDay - currEventEndMin;
            }
          }
        }
      } // next

      $("#stats").text(" -" + minToGo + "/+" + minElapsed);
    }
  }, 1000);

  calendar.render();
});
