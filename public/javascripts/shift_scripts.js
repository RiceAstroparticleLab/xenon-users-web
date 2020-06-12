function FillAggregates(tablediv, headerdiv, myinstitute){
    $.getJSON('shifts/total_shift_aggregates', function(data){
	    html = "";
	    console.log(data);
	    console.log(myinstitute);
	    var yr = (new Date()).getFullYear();
	    var total = 0;
	    var totalyr = 0;
	    $(headerdiv).html("Shifts " + yr.toString());
        for(var i=0; i<data.length; i+=1){
            html += "<tr";
            if(i==0)
                html+= " title='winner winner chicken dinner'";
            if(data[i]['_id'].includes(myinstitute))
                html+= " style='background-color:#ef476f;color:white'";
            html+= "><td>" + data[i]['_id'] + "</td><td>" + data[i]['total'].toString() + "</td>";
            total+=data[i]['total'];
            var this_year = 0;
            for(var j = 0; j<data[i]["years"].length; j++)
                if(data[i]["years"][j]["year"] == yr)
                    this_year = data[i]["years"][j]["count"];
            totalyr+=this_year;
            html += "<td>" + this_year.toString() + "</td></tr>";
        }
        html+= "<tr style='border-bottom:1px solid black'><td colspan='100%'></td></tr>";
        html+="<tr><td></td><td><strong>"+total.toString()+"</strong></td><td><strong>"+totalyr.toString()+"</strong></td></tr>";
        $(tablediv).html(html);

    });
}

/* Initializes calendar and all related forms */
function InitializeCalendar(){
    var colors = {"free": "#06d6a0",
                  "run coordinator": "#0c1178",
                  "taken": "#0c1178",
                  "shifter": "#0c1178",
                  "training": "#ef476f",
                  "credit": "#ff3300"};

    // script to sign up for a shift
    $('#sign_up_form').submit(function(e){
        e.preventDefault();
        $.ajax({
            url:'shifts/modify_shift',
            type:'post',
            data:$('#sign_up_form').serialize(),
            success:function(){
                $("#calendarview").fullCalendar('refetchEvents');		
                $("#ttip").css('display', 'none');
                $("[data-dismiss=modal]").trigger({ type: "click" });
            }
        });
    });

    // script to add a shift             
    $('#add_shift_form').submit(function(e){
        e.preventDefault();
        $.ajax({
            url: 'shifts/add_shifts',
            type: 'post',
            data: $('#add_shift_form').serialize(),
            success: function(){
                alert("Added your shifts! Check out the calendar page.");
            },
            error: function(){
                alert("Error adding your shifts... sorry? Hey, could it be that you don't have permission?");
            }
        });
    });

    // script to remove a shift
    $('#remove_shift_form').submit(function(e){
        e.preventDefault();
        $.ajax({
            url: 'shifts/remove_shifts',
            type: 'post',
            data: $('#remove_shift_form').serialize(),
            success: function(){
                alert("Removed the specified shifts! Check out the calendar page.");
            },
            error: function(){
                alert("Error removing your shifts... sorry? Hey, could it be that you don't have permission?");
            }
        });
    });

    // rendering out the calendar
    $('#calendar').fullCalendar({
        // defaultView: 'month',
        events: 'shifts/get_shifts',
        eventLimit: true,
        eventLimitClick: 'day',
        header: {
            left: '',
            center: 'title',
        },
        error: function() {
            alert('there was an error while fetching events!');
        },
        eventRender: function(event, element, view){
            element.find('.fc-time').html("");               
            type = 'free';
            if(event['available']) type='free';
            else type=event.type;
            if(event.type=='credit') type='credit';
            element.css('background-color', colors[type]);
            event.color = colors[type];
        },
        eventClick: function(calEvent, jsEvent, view ) { 
            document.getElementById("shift_modal_title").innerHTML = "Week " + moment(calEvent.start, "MM-DD-YYYY").week() + "<strong> "+calEvent.type+"</strong>";
            document.getElementById("shift_modal_start").innerHTML =
                    moment(calEvent.start, "MM-DD-YYYY").format("MM-DD-YYYY");
            document.getElementById("shift_modal_end").innerHTML=
                    moment(calEvent.end, "MM-DD-YYYY").format("MM-DD-YYYY");
            document.getElementById("shift_modal_institute").innerHTML=calEvent.institute;
            document.getElementById("shift_modal_user").innerHTML=calEvent.shifter;
            if(calEvent.available)
                document.getElementById("shift_modal_available").innerHTML =
                "<strong>Available</strong>";
            else
                document.getElementById("shift_modal_available").innerHTML =
                "<strong>Unavailable</strong>";
            if(calEvent.available){
                $('#btn_mark_available').attr("disabled", true);
                $('#btn_sign_up').attr("disabled", false);
            }
            else{
		        $('#btn_sign_up').attr("disabled", true);
		    
                // Want to allow people to set as available only if allowed 
                console.log(calEvent);
		        // console.log(calling_user);
                // if( calling_user == calEvent.shifter )
                //     $('#btn_mark_available').attr("disabled", false);
                // else
                $('#btn_mark_available').attr("disabled", true);
            }

            // Put at proper location     
            var x = (jsEvent.clientX + 20) + 'px',
                y = (jsEvent.clientY + 20) + 'px';

            if((jsEvent.clientX+20)+$("#ttip").width() > $(window).width())
                x=$(window).width()-$("#ttip").width() + 'px';
            if((jsEvent.clientY+20)+$("#ttip").height() > $(window).height())
                y=$(window).height()-$("#ttip").height() + 'px';
            $("#ttip").css('top', y);
            $("#ttip").css('left', x);
            $("#ttip").css('display', 'block');
                
        }

    })
}

function CloseTooltip(){
    $(".ttip").css('display', 'none');
}
    
function SignUp(shiftType, shiftStart, shiftEnd){

    $('#id_start_date').val(moment(parseInt(shiftStart)).format("YYYY-MM-DD"));
    $("#id_start_date").prop("readonly", true);
    $('#id_end_date').val(moment(parseInt(shiftEnd)).format("YYYY-MM-DD"));
    $("#id_end_date").prop("readonly", true);
    $('#signUpModal').modal('show');

    ret = "";
    ret+="<option value='"+shiftType+"'>"+shiftType+"</option>";
    ret+="<option value='training'>training</option>";
    document.getElementById("id_shift_type").innerHTML=ret;
    document.getElementById("id_remove").checked = false;
    $("#id_remove").val(false);


}
    
    
function SignUpTrain(shiftType, shiftStart, shiftEnd){

    $('#id_start_date').val(moment(parseInt(shiftStart)).format("YYYY-MM-DD"));
    $("#id_start_date").prop("readonly", true);
    $('#id_end_date').val(moment(parseInt(shiftEnd)).format("YYYY-MM-DD"));
    $("#id_end_date").prop("readonly", true);
    $('#signUpModal').modal('show');

    ret = "";
    ret+="<option value='training'>training</option>";
    document.getElementById("id_shift_type").innerHTML=ret;
    document.getElementById("id_remove").checked = false;
    $("#id_remove").val(false);


}
    
    
function SignUpCredit(shiftType, shiftStart, shiftEnd){

    $('#id_start_date').val(moment(parseInt(shiftStart)).format("YYYY-MM-DD"));
    $("#id_start_date").prop("readonly", true);
    $('#id_end_date').val(moment(parseInt(shiftEnd)).format("YYYY-MM-DD"));
    $("#id_end_date").prop("readonly", true);
    $('#signUpModal').modal('show');

    ret = "";
    ret+="<option value='credit'>credit</option>";
    document.getElementById("id_shift_type").innerHTML=ret;
    document.getElementById("id_remove").checked = false;
    $("#id_remove").val(false);

}
    
    
function MarkAvailable(shiftType, shiftStart, shiftEnd, shifter, institute){
    $('#id_start_date').val(moment(parseInt(shiftStart)).format("YYYY-MM-DD"));
    $("#id_start_date").prop("readonly", true);
    $('#id_end_date').val(moment(parseInt(shiftEnd)).format("YYYY-MM-DD"));
    $("#id_end_date").prop("readonly", true);
    $("#id_institute").val(institute);

    $("#id_user").val(shifter);
    console.log($("#id_institute").val());
    console.log($("#id_user").val());
    console.log(shifter);

    ret = "";
    ret+="<option value='"+shiftType+"'>"+shiftType+"</option>";
    ret+="<option value='training'>training</option>";
    document.getElementById("id_shift_type").innerHTML=ret;
    document.getElementById("id_remove").checked = true;
    $("#id_remove").val(true);
    $("#sign_up_form").submit();

}
    
function EnableShiftSubmit(){

    if( $("#id_disclaimer").is(":checked") && $("#id_has_car").is(":checked"))
    $("#shift_submit_button").prop("disabled", false);
    else
    $("#shift_submit_button").prop("disabled", true);

}