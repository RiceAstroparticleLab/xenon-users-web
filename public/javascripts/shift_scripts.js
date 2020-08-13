/*
 * Scripts for the shift calendar page.
 */


// Fills in table in (tablediv) which displays the stats for number of shifts
// done by each institute while highlighting the institute of the user who is 
// logged in (myinstitute) and sets the header in the (headerdiv)
function FillAggregates(tablediv, headerdiv, myinstitute) {
  $.getJSON('shifts/total_shift_aggregates', function(data) {
    var countThisYear = 0;
    var html = '';
    var thisYear = (new Date()).getFullYear();
    var total = 0;
    var totalThisYear = 0;

    $(headerdiv).html('Shifts ' + thisYear.toString());
    for (let i = 0; i < data.length; i ++) {
      let institute = data[i];
      let instituteYears = institute["years"];
      html += '<tr';
      // highlight user's institute
      if (institute['_id'].includes(myinstitute)) {
        html += ' style="background-color:#cf6766;color:white"';
      }
      // set all time shift column
      html += '><td>' + institute['_id'] + '</td><td>' + 
              institute['total'].toString() + '</td>';
      total += institute['total'];

      // set current year column
      for (let j = 0; j < instituteYears.length; j++) {
        let instituteYear = instituteYears[j];
        if (instituteYear['year'] == thisYear) {
          countThisYear = instituteYear["count"];
        }
      }
      totalThisYear += countThisYear;
      html += '<td>' + countThisYear.toString() + '</td></tr>';
    }
    // column with total counts
    html += "<tr style='border-bottom:1px solid black'><td colspan='100%'>" + 
            "</td></tr>";
    html += "<tr><td></td><td><strong>" + total.toString() + "</strong></td>" +
            "<td><strong>" + totalThisYear.toString() + "</strong></td></tr>";
    $(tablediv).html(html);
  });
}

// Is meant to handle shift rules - owed shifts, etc. Currently not in use and
// will probably be updated later
function ShiftRules(tablediv) {
  $('#shift_rules_form').submit(function(e){
    e.preventDefault();
    $.ajax({
      url: 'shifts/get_rules',
      type: 'post',
      data: $('#shift_rules_form').serialize(),
      success: function(jsonData) {
        var data
        data = jsonData[0]
        html = ""
        if (typeof data != "undefined") {
          console.log(`JSON: ${JSON.stringify(data)}`)
          var institutes = Object.keys(data['shifts'])
          console.log(institutes)

          html+= "<tr><td>Institute</td>"
          for (const [key, value] of Object.entries(data['shifts']['Zurich'])) {
            html+= "<td>" + key + "</td>"
          }
          html += "</tr>"

          for (var i in institutes) {
            var institute = institutes[i]
            var shifts = Object.keys(data['shifts'][institute])
            html+="<tr>"
            html+="<td>" + institute + "</td>"
            for (var j in shifts) {
              var shift = shifts[j]
              html+="<td>" + data['shifts'][institute][shift] + "</td>"
            }
            html+="</tr>"
          }
        } else {
          html += "<h5 style='color:#d21404'>No data for the selected year.</h5>"
        }
        console.log(`HTML: ${html}`)
        $(tablediv).html(html)
      }
    });
  });
}

// Initializes calendar and all related forms
function InitializeCalendar(daq_id, position, groups, user_institute) {
  var colors = {"free": "#4f97a3",
                "run coordinator": "#23395d",
                "taken": "#23395d",
                "shifter": "#23395d",
                "training": "#cf6766",
                "credit": "#dc4139"};

  // handles shift sign up form
  $('#sign_up_form').submit(function(e) {
    e.preventDefault();
    $.ajax({
      url: 'shifts/modify_shift',
      type: 'post',
      data: $('#sign_up_form').serialize(),
      success: function() {
        $("#calendar").fullCalendar('refetchEvents');		
        $("#ttip").css('display', 'none');
        $("#signUpModal").modal('hide');
      }
    });
  });

  // handles form to a assign a shifter to an empty shift
  $('#assign_form').submit(function(e) {
    e.preventDefault();
    $.ajax({
      url: 'shifts/modify_shift',
      type:'post',
      data:$('#assign_form').serialize(),
      success: function() {
        $("#calendar").fullCalendar('refetchEvents');		
        $("#ttip").css('display', 'none');
        $("#assignModal").modal('hide');
      }
    });
  });

  // handles form to add an empty shift to the calendar          
  $('#add_shift_form').submit(function(e) {
    e.preventDefault();
    $.ajax({
      url: 'shifts/add_shifts',
      type: 'post',
      data: $('#add_shift_form').serialize(),
      success: function() {
        alert(
          "Added your shifts! Please refresh and check out the calendar page."
        );
      },
      error: function(e) {
        alert(
          "Error adding your shifts... sorry? Hey, could it be that you" + 
          " don't have permission?"
        );
      }
    });
  });

  // handles form that removes empty shifts from the calendar
  $('#remove_shift_form').submit(function(e) {
    e.preventDefault();
    $.ajax({
      url: 'shifts/remove_shifts',
      type: 'post',
      data: $('#remove_shift_form').serialize(),
      success: function() {
        alert(
          "Removed the specified shifts! Please refresh and check out the" + 
          " calendar page."
        );
      },
      error: function() {
        alert(
          "Error removing your shifts... sorry? Hey, could it be that you"+ 
          " don't have permission?"
        );
      }
    });
  });

  // rendering out the calendar using FullCalendar
  $('#calendar').fullCalendar({
    events: 'shifts/get_shifts',
    timezone: 'UTC',
    eventLimit: true,
    eventLimitClick: 'week',
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,basicWeek'
    },
    error: function() {
      alert('there was an error while fetching events!');
    },
    eventRender: function(event, element, view){
      element.find('.fc-time').html("");               
      type = 'free';
      if (event['available']) {
        type = 'free';
      } else {
        type = event.type;
      }
      if (event.type === 'credit') {
        type = 'credit';
      }
      element.css('background-color', colors[type]);
      element.css('border-color', colors[type]);
      event.color = colors[type];
    },
    eventClick: function(calEvent, jsEvent, view ) { 
      // update tooltip based on shift informtaion from the database
      document.getElementById("shift_modal_title").innerHTML = 
          "Week " + moment(calEvent.start, "MM-DD-YYYY").week() + 
            "<strong> " + calEvent.type + "</strong>";
      document.getElementById("shift_modal_start").innerHTML =
          moment(calEvent.start, "MM-DD-YYYY").format("MM-DD-YYYY");
      document.getElementById("shift_modal_end").innerHTML=
          moment(calEvent.end, "MM-DD-YYYY").format("MM-DD-YYYY");
      document.getElementById("shift_modal_institute").innerHTML = 
          calEvent.institute;
      document.getElementById("shift_modal_user").innerHTML = calEvent.shifter;
      
      if (calEvent.available) {
        document.getElementById("shift_modal_available").innerHTML =
            "<strong>Available</strong>";
        $('#btn_mark_available').attr("disabled", true);
        $('#btn_sign_up').attr("disabled", false);

        // set permissions for button to assign a shifter
        if (position === 'PI' || groups.includes('operations')) {
          $('#btn_assign_shftr').attr("disabled", false);
        } else {
          $('#btn_assign_shftr').attr("disabled", true);
        }
      } else {
        document.getElementById("shift_modal_available").innerHTML =
          "<strong>Unavailable</strong>";
        $('#btn_sign_up').attr("disabled", true);
        $('#btn_assign_shftr').attr("disabled", true)

        // Want to allow people to set as available only if allowed 
        if (daq_id === calEvent.shifter || position === 'PI' || 
            groups.includes('operations')) {
          $('#btn_mark_available').attr("disabled", false);
        } else {
          $('#btn_mark_available').attr("disabled", true);
        }
      }

      // Set on click events for three available buttons in tooltop
      $('#btn_sign_up').attr("onclick", 
                  "SignUp('" + calEvent.type + "', '" + calEvent.start + 
                  "', '" + calEvent.end + "')");
      $("#btn_mark_available").attr("onclick", 
                  'MarkAvailable("' + calEvent.type + '", "' + calEvent.start +
                  '", "' + calEvent.end + '", "' + calEvent.shifter + '", "' +
                  calEvent.institute + '", "' + daq_id + '", "' + 
                  user_institute + '")');
      $("#btn_assign_shftr").attr("onclick",
                  "Assign('" + calEvent.type + "', '" + calEvent.start + 
                  "', '" + calEvent.end + "')");

      // Put at proper location     
      var x = (jsEvent.clientX + 20) + 'px';
      var y = (jsEvent.clientY + 20) + 'px';
      if ((jsEvent.clientX + 20) + $("#ttip").width() > $(window).width()) {
        x = $(window).width()-$("#ttip").width() + 'px';
      }
      if ((jsEvent.clientY + 20) + $("#ttip").height() > $(window).height()) {
        y = $(window).height()-$("#ttip").height() + 'px';
      }
      $("#ttip").css('top', y);
      $("#ttip").css('left', x);
      $("#ttip").css('display', 'block');         
    }
  })
}

function CloseTooltip(){
  $(".ttip").css('display', 'none');
}

// fills in values for the sign up form using inputted information from the
// calendar (shiftType, shiftStart, shiftEnd)
function SignUp(shiftType, shiftStart, shiftEnd){
  var ret = '';
  $('#id_start_date').val(moment(parseInt(shiftStart)).format("YYYY-MM-DD"));
  $("#id_start_date").prop("readonly", true);
  $('#id_end_date').val(moment(parseInt(shiftEnd)).format("YYYY-MM-DD"));
  $("#id_end_date").prop("readonly", true);
  $('#signUpModal').modal('show');

  ret += "<option value='" + shiftType + "'>" + shiftType + "</option>" + 
    "<option value='training'>training</option>";
  document.getElementById("id_shift_type").innerHTML = ret;
  document.getElementById("id_remove").checked = false;
  $("#id_remove").val(false);
}

// fills in values for assign shifter form using inputted information from the
// calendar (shiftType, shiftStart, shiftEnd). Similar to signup form but 
// has restricted access
function Assign(shiftType, shiftStart, shiftEnd){
  var ret = ''
  // allows for daq_id suggestions when typing in a shifter
  DAQAutocomplete('#assign_shifter');
  $('#assign_start_date')
    .val(moment(parseInt(shiftStart))
    .tz('Atlantic/St_Helena')
    .format("YYYY-MM-DD"));
  $("#assign_start_date").prop("readonly", true);
  $('#assign_end_date')
    .val(moment(parseInt(shiftEnd))
    .tz('Atlantic/St_Helena')
    .format("YYYY-MM-DD"));
  $("#assign_end_date").prop("readonly", true);
  $('#assignModal').modal('show');

  ret += "<option value='" + shiftType + "'>" + shiftType + "</option>" + 
    "<option value='training'>training</option>";
  document.getElementById("assign_shift_type").innerHTML = ret;
  document.getElementById("assign_remove").checked = false;
  $("#assign_remove").val(false);
}

// uses list of DAQ ids to suggest shifters to the user that is inputting 
// information. Applies to inputted textbox div (div).
function DAQAutocomplete(div){
  $.get('shifts/get_daqids', function(data) {
    var arr = data.split(',');
    $(div).autocomplete({
      source: function(request, response) {
        var matches = $.map(arr, function(item) {
          if (item.toUpperCase().indexOf(request.term.toUpperCase()) !== -1 ) {
            return item;
          }
        });
        response(matches);
      }
    });
  });
}   

// marks a shift available
function MarkAvailable(shiftType, shiftStart, shiftEnd, shifter, institute, 
  daq_id, user_institute){
  $('#markAvailableModal').modal('show')
  $('#submit_m_avail').click(function() {
    $('#id_start_date').val(moment(parseInt(shiftStart)).format("YYYY-MM-DD"));
    $("#id_start_date").prop("readonly", true);
    $('#id_end_date').val(moment(parseInt(shiftEnd)).format("YYYY-MM-DD"));
    $("#id_end_date").prop("readonly", true);
    $("#id_institute").val(institute);

    $("#id_shifter").val(shifter);
    console.log($("#id_institute").val());
    console.log($("#id_shifter").val());
    console.log(shifter);

    ret = "";
    ret += "<option value='" + shiftType + "'>" + shiftType + "</option>" + 
      "<option value='training'>training</option>";
    document.getElementById("id_shift_type").innerHTML = ret;
    document.getElementById("id_remove").checked = true;
    $("#id_remove").val(true);
    $("#sign_up_form").submit();
    $('#markAvailableModal').on('hidden.bs.modal', function(e) {
        $("#id_institute").val(user_institute);
        $("#id_shifter").val(daq_id);
    })
    $('#markAvailableModal').modal('hide')
  })
}
