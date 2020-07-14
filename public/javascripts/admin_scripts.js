// function loadXENONnt() {
//     $.ajax({
//         type: "POST",
//         url: 'admin/gitremove_xenon1t',
//         dataType: "json",
//         data: { groupNames: JSON.stringify(groubyNames), page: JSON.stringify(page) },
//         success: function(data) {
//              var table = $('<table/>');
//              $(data).each(function() {
//                    var row = $('<tr/>');
//                    row.append('<td>' + this.Value + '</td>');
//                    row.append('<td>' + this.Value + '</td>');
//              });
//              table.append(row);                   
//              $('#groupTable').html(table); // not refreshing table withdata
//         },
//         error: function(request, status, error) {

//             alert(request.responseText);
//         }
//     });
// }

function loadXENON1t(tablediv) {
    $.getJSON('admin/gitremove_xenon1t', function(data){
        html = ""
        console.log(data)
        for (i=0; i < data.length; i++) {
            html += "<tr>"
            html += '<td>' + data[i][0].first_name + " " + data[i][0].last_name + '</td>'
            html += '<td><button class="btn-circle red"><i class="fas fa-times"></i></button></td>'
            html += "</tr>"
        }
        $(tablediv).html(html);
    })
}

function loadAddToDB(tablediv){
    $.getJSON('admin/add_to_db', function(data){
        html = ""
        console.log(data)
        for (i=0; i < data.length; i++) {
            html += "<tr>"
            html += '<td>' + data[i].toString().replace(/,/g, " ") + '</td>'
            html += '<td><button class="btn-circle green"><i class="fas fa-plus"></i></button></td>'
            html += "</tr>"
        }
        $(tablediv).html(html);
    })
}

function updateDB(){
    
}