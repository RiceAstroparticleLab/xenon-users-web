/*
 * Scripts for the shift calendar page.
 */
 
// Fills in table in (tablediv) which displays the stats for number of shifts
// done by each institute while highlighting the institute of the user who is 
// logged in (myinstitute) and sets the header in the (headerdiv)
function FillAggregates(tablediv, inputYear, myinstitute) {
  $.getJSON('shifts/total_shift_aggregates', function(data) {
    var html = '';
    var thisYear = parseInt(inputYear);
    var total = 0;
    var totalThisYear = 0;

    for (let i = 0; i < data.length; i++) {
      let countThisYear = 0;
      let institute = data[i];
      let instituteYears = institute["years"];
      if (institute['_id'] !== "none") {
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
          if (instituteYear['year'] === thisYear) {
            countThisYear = instituteYear["count"];
          }
        }
        totalThisYear += countThisYear;
        html += '<td>' + countThisYear.toString() + '</td></tr>';
      }
    }
    // column with total counts
    html += "<tr style='border-bottom:1px solid black'><td colspan='100%'>" + 
            "</td></tr>";
    html += "<tr><td></td><td><strong>" + total.toString() + "</strong></td>" +
            "<td><strong>" + totalThisYear.toString() + "</strong></td></tr>";
    $(tablediv).html(html);
  });
}

function FillTable(tablediv, myinstitute) {
  $('#tableForm').on('submit', function(e) {
    console.log("In submit");
    e.preventDefault();
    console.log("In FillTable");
    $.getJSON('shifts/total_shift_aggregates', function(data) {
      var html = '';
      var thisYear = document.getElementById("year").value;
      var total = 0;
      var totalThisYear = 0;
      console.log(thisYear);

      for (let i = 0; i < data.length; i ++) {
        let countThisYear = 0;
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
          if (instituteYear['year'] === thisYear) {
            countThisYear = instituteYear["count"];
          }
        }
        totalThisYear += countThisYear;
        html += '<td>' + countThisYear.toString() + '</td></tr>';
      }
      // column with total counts
      html += "<tr style='border-bottom:1px solid black'><td colspan='100%'>" +
              "</td></tr>";
      html += "<tr><td></td><td><strong>" + total.toString() + "</strong></td>"
              "<td><strong>" + totalThisYear.toString() + "</strong></td></tr>";
      $(tablediv).html(html);
    });
  });
}

// Calculates a stats object for filling the shift estimation
function CalcEstShifts(peopleArr) {
  p = new Promise(function(resolve, reject) {
    $.getJSON('shifts/total_shift_aggregates', function(shifts) {
      //  { 2016: { institute: [shiftsComp, shiftsEst] }  }
      var shiftStats = {};
      var users = JSON.parse(peopleArr);
      for (let yr = new Date().getFullYear() - 1; yr >= 2015; yr--) {
        // inner object has the following structure:
        // {instituteName: [shiftsCompleted, estimatedShifts]}
        var inner = {};
        // temp object has the following structure:
        // {instituteName: [numShiftsForYr, numPhdOrHigherForYr]}
        var stats = {};
        var thisYear = yr;
        var totalPhd = 0;
        var totalShifts = 0;
        var totalThisYear = 0;
  
        // iterate through the shift data first
        for (let i = 0; i < shifts.length; i++) {
          let institute = shifts[i];
          let id = institute['_id']
          let instituteYears = institute["years"];
          if (id !== "none") {
            let numShifts = 0;
            for (let j = 0; j < instituteYears.length; j++) {
              if (instituteYears[j]['year'] === thisYear + 1) {
                numShifts = instituteYears[j]["count"];
              }
            }
            totalThisYear += numShifts;
            stats[id] = [numShifts]
          } else {
            // add empty shifts from this year to totalShifts
            for (let j = 0; j < instituteYears.length; j++) {
              if (instituteYears[j]['year'] === thisYear + 1) {
                totalShifts += instituteYears[j]["count"];
              }
            }
          }
        }
  
        // add this years shifts to total
        totalShifts += totalThisYear;
  
        // iterate through the users array
        for (let i = 0; i < users.length; i++) {
          let institute  = users[i];
          let id = institute['_id'];
          if (stats.hasOwnProperty(id)) { // make sure the institute actually has shifts
            let instituteYears = institute["years"];
            for (let j = 0; j < instituteYears.length; j++) {
              if (instituteYears[j]['year'] === thisYear) {
                var phdcount = instituteYears[j]['phdcount'];
                var realShifts = instituteYears[j]['expected_shifts'];
                totalPhd += phdcount;
                stats[id].push(phdcount);
                stats[id].push(realShifts || 0)
              }
            }
          }
        }
  
        const keys = Object.keys(stats);
        console.log(`${yr + 1} has ${totalShifts} total shifts, ${totalPhd} total Phd`);
        for (const institute of keys) {
          let institutePhd = stats[institute][1];
          let estimateShifts = (totalShifts/totalPhd * institutePhd) || 0;
          estimateShifts = parseFloat(estimateShifts.toFixed(2));
          let shiftsDone = stats[institute][0];
          let realShiftsDue = stats[institute][2];
          inner[institute] = [shiftsDone, estimateShifts, (institutePhd || 0), (realShiftsDue || 0)];
        }
        shiftStats[yr + 1] = inner;
        console.log(stats);
      }
      var total = {}
      const years = Object.keys(shiftStats);
      for (const year of years) {
        const keys = Object.keys(shiftStats[year]);
        for (const institute of keys) {
          var vals = shiftStats[year][institute];
          if (institute in total) {
            total[institute][0] += vals[0]; // shifts done
            total[institute][1] += vals[1]; // est shifts
            total[institute][2] += vals[2]; // phd headcount
            total[institute][3] += vals[3]; // required shifts (manually inputted)
          } else {
            total[institute] = [vals[0], vals[1], vals[2], vals[3]];
          }
        }
      }
      shiftStats[0] = total;
      console.log(shiftStats);
      resolve(shiftStats);
    });
  });
  return p;
}

/* 
Fills the table where one column is the number of shifts that an institute has
done in the selected year. The second column is the number of shifts that an institute
is expected to complete for that selected year. 

The number of shifts used are calculated using the following equation:
 (total # shifts) / (num phd or higher at institute) * (num phd+ people across all institutes) 
*/
function FillCalculator(tablediv, inputYear, myinstitute, stats) {
  var thisYear;
  if (inputYear === "Shifts All Time") {
    thisYear = 0;
  } else {
    thisYear = parseInt(inputYear);
  }
  stats = JSON.parse(stats);
  console.log(stats);
  var totalThisYear = 0;
  var totalShifts = 0;

  var html = '';
  // iterate through the stats object
  const keys = Object.keys(stats[thisYear]);
  for (const institute of keys) {
    let estimateShifts = stats[thisYear][institute][1];
    let shiftsDone = stats[thisYear][institute][0];
    let percentageDone = shiftsDone/estimateShifts;
    let phdHeadCount = stats[thisYear][institute][2];
    let realShiftsDue = stats[thisYear][institute][3];
    totalThisYear += shiftsDone;
    totalShifts += estimateShifts;
    html += '<tr';
    if (institute.includes(myinstitute)) {
      html += ' style="background-color:#e5e5ea;"';
    }

    // set column to institute name
    html += `><td>${institute}</td>`; 
    // set first column
    html += `<td>${shiftsDone}</td>`;
    // set second column
    html += `<td><input type="text" placeholder="${phdHeadCount}" value="${phdHeadCount}"></td>`;
    // set third column
    if (realShiftsDue === 0) {
      html += `<td><input type="text" placeholder=${estimateShifts.toFixed(2)}></td>`;
    } else {
      html += `<td><input type="text" placeholder=${estimateShifts.toFixed(2)} value="${realShiftsDue}"></td>`;
    }
    // set fourth column
    html += `<td>${Math.round(percentageDone * 100)}%</td>`;
    // set fifth column
    let color = "";
    let diff = estimateShifts - shiftsDone;
    if (diff > 0) {
      color = "red";
    } else {
      color = "green";
    }
    html += `<td style="color:${color}">${diff.toFixed(2)}</td></tr>`;
  }

  // column with total counts
  html += "<tr style='border-bottom:1px solid black'><td colspan='100%'>" + 
          "</td></tr>";
  html += `<tr><td></td><td><strong>${totalThisYear}</strong></td>` +
          `<td></td><td><input type="submit" value="Save"></td></tr>`;
  $(tablediv).html(html);
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
  $.get('shifts/get_lngsids', function(data) {
    var arr = data;
    console.log(arr)
    $(div).autocomplete({
      source: arr
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
