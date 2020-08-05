var array_of_institutes = [['Bologna'], ['Coimbra'], ['Columbia'], ['Freiburg', 'Bern/Freiburg'], ['KIT'], 
['Kobe'], ["L'Aquila"], ['LAL'], ['LNGS-GSSI', 'LNGS'], ['LPNHE'], ['Mainz'],
['MPI Heidelberg', 'MPIK Heidelberg'], ['Munster', 'Muenster'], ['Nagoya'], 
['Naples', 'INFN Naples'], ['Nikhef'], ['NYUAD'], ['Purdue'], ['Rensselear'], 
['Rice'], ['Stockholm'], ['Subatech'], ['Tokyo'], ['Torino'], 
['UChicago', 'Chicago'], ['UCSD', 'UC San Diego'], ['WIS', 'Weizmann'], ['Zurich']];

function InitializeTable(divname){
    var groupColumn = 1
    var table = $(divname).DataTable({       
        dom: 'flrtip',                                  
        order: [[groupColumn, 'asc']],
        pageResize: true,
        paging: false,
        language: {
            search: "",
            searchPlaceholder: "Search...",
        },
        ajax : {
            url: 'curr_table_info',
	        type: "POST",
        },
        columns : [	    
            { data : null, defaultContent: '', orderable: false},
            { data : "institute", searchable: true },
            { data : "last_name" , searchable: true},
            { data : "first_name", searchable: true },
            { data : "email", orderable: false, searchable: true},
            { data : "position", searchable: true },
            { data : "percent_xenon", orderable: false},
            { data : "start_date", format: 'MM.YYYY', type: 'datetime', orderable: false}, 
            { data : "previous_time", defaultContent: '', orderable: false},
            { title: "", orderable: false}
        ],
        columnDefs: [
            { title: "Institute", targets: 0},
            { title: "Institute", targets: 1},
            { title: "Last Name", targets: 2},
            { title: "First Name", targets: 3},
            { title: "Email", targets: 4},
            { title: "Position", targets: 5},
            { title: "Time", targets: 6},
            { title: "Start Date", targets: 7},
            { title: "Previous Time Info", targets: 8},
            { "targets": -1,
             data: null,
             "defaultContent": "<button type='button' class='btn-circle'><i class='fas fa-pen'></i></button>"
            },
            {"visible": false, "targets": groupColumn},
            {
            targets: [7],
            render: function(data){
                if(typeof(data)=="undefined") 
                    return "";
                return moment(data).tz('Atlantic/St_Helena').format('MMM YYYY');
            }
            }
        ],
        drawCallback: function(settings) {
            var api = this.api()
            var rows = api.rows({page: 'current'}).nodes();
            var last = null;
            
            api.column(groupColumn, {page: 'current'}).data().each(function(group,i) {
                if (last !== group) {
                    $(rows).eq(i).before(
                        '<tr class="group"><td colspan="9"><strong>'+group+'</strong></td></tr>'
                    )
                    last = group;
                }
            })
        }
    });

    $(divname + ' tbody').on( 'click', 'button', function (e) {
        e.preventDefault()
        var data = table.row( $(this).parents('tr') ).data();
        if((data.current_user.position == "PI" && data.current_user.institute == data.institute) ||
            (data.current_user.groups != "not set") || data.current_user.last_name == "Matias-Lopes") {
            openModal(data, 'fulldirectory')
        } else {
            alert("Sorry, you don't have the correct permissions.")
        }
    } );

}

function InitializePrevTable(divname){
    var groupColumn = 8
    var table = $(divname).DataTable({  
        dom: 'flrtip',                                  
        order: [[groupColumn, 'desc']],
        pageResize: true,
        paging: false,
        language: {
            search: "",
            searchPlaceholder: "Search...",
        },
        ajax : {
            url: 'prev_table_info',
	        type: "POST",
        },
        columns : [	    
            { data : "institute", searchable: true },
            { data : "last_name" , searchable: true},
            { data : "first_name", searchable: true },
            { data : "email", orderable: false, searchable: true},
            { data : "position", searchable: true },
            { data : "percent_xenon", orderable: false},
            { data : "start_date", format: 'MM.YYYY', type: 'datetime', orderable: false}, 
            { data : "end_date", format: 'MM.YYYY', type: 'datetime'},
            { data : "end_date", format: 'YYYY', type: 'datetime', orderable: false},
            { title: "", orderable: false}
        ],
        columnDefs: [
            { title: "Institute", targets: 0},
            { title: "Last Name", targets: 1},
            { title: "First Name", targets: 2},
            { title: "Email", targets: 3},
            { title: "Position", targets: 4},
            { title: "Time", targets: 5},
            { title: "Start Date", targets: 6},
            { title: "End Date", targets: 7},
            { "targets": -1,
             data: null,
             "defaultContent": "<button type='button' class='btn-circle'><i class='fas fa-pen'></i></button>"
            },
            {"visible": false, "targets": groupColumn},
            {
            targets: [6, 7],
            render: function(data){
                if(typeof(data)=="undefined") 
                    return "";
                return moment(data).tz('Atlantic/St_Helena').format('MMM YYYY');
            }
            }
        ],
        drawCallback: function(settings) {
            var api = this.api()
            var rows = api.rows({page: 'current'}).nodes();
            var last = null;
            
            api.column(groupColumn, {page: 'current'}).data().each(function(group,i) {
                var year = moment(group).tz('Atlantic/St_Helena').format('YYYY');
                if (last !== year) {
                    $(rows).eq(i).before(
                        '<tr class="group"><td colspan="9"><strong>'+year+'</strong></td></tr>'
                    )
                    last = year;
                }
            })
        }
    });

    $(divname + ' tbody').on( 'click', 'button', function (e) {
        e.preventDefault()
        var data = table.row( $(this).parents('tr') ).data();
        if((data.current_user.position == "PI" && data.current_user.institute == data.institute) ||
            data.current_user.groups != "not set" || data.current_user.last_name == "Matias-Lopes") {
            openModal(data, 'fulldirectory')
        } else {
            alert("Sorry, you don't have the correct permissions.")
        }
    } );

}
function PrevAuthorsTable(divname) {
    var table = $(divname).DataTable({
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "All"]],
        ajax : {
            url: 'prev_author_table',
	        type: "POST",
        },
        columns : [	    
            { data : "last_name" , searchable: true},
            { data : "first_name", searchable: true },
            { data : "institute", searchable: true },
            { data : "email" },
            { data : "position", searchable: true },
            { data : "percent_xenon" },
            { data : "start_date", format: 'MM.YYYY', type: 'datetime'},
            { data : "end_date", format: 'MM.YYYY', type: 'datetime'},
            { data : "additional_institutes", defaultContent: ""},
            { title: "", orderable: false}
        ],
        columnDefs: [
            { title: "Last Name", targets: 0},
            { title: "First Name", targets: 1},
            { title: "Institute", targets: 2},
            { title: "Email", targets: 3},
            { title: "Position", targets: 4},
            { title: "Time", targets: 5},
            { title: "Start", targets: 6},
            { title: "End", targets: 7},
            { title: "Additional Insititutions", targets: 8},
            { "targets": -1,
             data: null,
             "defaultContent": "<button type='button' class='btn-circle'><i class='fas fa-pen'></i></button>"
            },
            {
            targets: [6,7],
            render: function(data){
                if(typeof(data)=="undefined") 
                    return "";
                return moment(data).format('MM/DD/YYYY');
            }
            }
        ],

    })

    $(divname + ' tbody').on( 'click', 'button', function (e) {
        e.preventDefault()
        var data = table.row( $(this).parents('tr') ).data();
        if((data.current_user.position == "PI" && data.current_user.institute == data.institute) ||
            (data.current_user.groups != "not set") || data.current_user.last_name == "Matias-Lopes") {
        openModal(data, 'authors')
        } else {
            alert("Sorry, you don't have the correct permissions.")
        }
    } );
}

function CurrAuthorsTable(divname) {
    var table = $(divname).DataTable({
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "All"]],
        ajax : {
            url: 'curr_author_table',
	        type: "POST",
        },
        columns : [	    
            { data : "last_name" , searchable: true},
            { data : "first_name", searchable: true },
            { data : "institute", searchable: true },
            { data : "email" },
            { data : "position", searchable: true },
            { data : "percent_xenon" },
            { data : "start_date", format: 'MM.YYYY', type: 'datetime'},
            { data : "additional_institutes", defaultContent: ""},
            { title: "", orderable: false}
        ],
        columnDefs: [
            { title: "Last Name", targets: 0},
            { title: "First Name", targets: 1},
            { title: "Institute", targets: 2},
            { title: "Email", targets: 3},
            { title: "Position", targets: 4},
            { title: "Time", targets: 5},
            { title: "Start", targets: 6},
            { title: "Additional Institutions", targets: 7},
            { "targets": -1,
             data: null,
             "defaultContent": "<button type='button' class='btn-circle'><i class='fas fa-pen'></i></button>"
            },
            {
            targets: [6],
            render: function(data){
                if(typeof(data)=="undefined") 
                    return "";
                return moment(data).format('MM/DD/YYYY');
            }
            }
        ],

    })

    $(divname + ' tbody').on( 'click', 'button', function (e) {
        e.preventDefault()
        var data = table.row( $(this).parents('tr') ).data();
        if((data.current_user.position == "PI" && data.current_user.institute == data.institute) ||
            (data.current_user.groups != "not set") || data.current_user.last_name == "Matias-Lopes") {
            openModal(data, 'authors')
        } else {
            alert("Sorry, you don't have the correct permissions.")
        }
    } );
}

function openModal(data, page) {
    $('#updateUserModal').on('show.bs.modal', function (event) {
        var user_info = data // Extract info from data-* attributes
        var curr_pg = page

        var institute
        for (i = 0; i < array_of_institutes.length; i++) {
            if (array_of_institutes[i][0] == user_info.institute || array_of_institutes[i][1] == user_info.institute) {
              institute = array_of_institutes[i][0]
            }
          }
        
        
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        document.getElementById("formUpdateUser").action = "users/"+curr_pg+"/"+user_info._id+"/updateContactInfoAdmin"
        modal.find('.modal-body input[name="FirstName"]').val(user_info.first_name)
        modal.find('.modal-body input[name="LastName"]').val(user_info.last_name)
        modal.find('.modal-body input[name="Email"]').val(user_info.email)
        modal.find('.modal-body input[name="prevTime"]').val(user_info.previous_time)
        modal.find('.modal-body input[name="Time"]').val(user_info.percent_xenon)
        modal.find('.modal-body input[name="Tasks"]').val(user_info.tasks)
        modal.find('.modal-body input[name="StartDate"]').val(new Date(user_info.start_date).toISOString().slice(0,10))
        modal.find('.modal-body input[name="position"]').val(user_info.position)

        if (page == 'authors') {
            modal.find('.modal-body input[name="Institute"]').val(user_info.institute)
        } else {
            modal.find('.modal-body input[name="institute"]').val(user_info.institute)
        }
        
        if (user_info.mailing_lists) {
          var lists = user_info.mailing_lists
          for (i = 0; i < lists.length; i++) {
            if (lists[i] != null) {
              modal.find('.modal-body input[value="'+ lists[i]+ '"]').prop("checked", true)
            }
          }
        }
      })
      $('#updateUserModal').on('hidden.bs.modal', function(e) {
        $("#updateUserModal .modal-body").find('input:checkbox').prop('checked', false);
        $("#updateUserModal .modal-body").find('option').attr('selected', false);
        $("#updateUserModal").find('.modal-body option[id="selected"]').attr('selected', true)
      })
    $('#updateUserModal').modal('show')
}

function UpdateUserModal() {
    var institute
    $('#updateUserModal').on('show.bs.modal', function (event) {
     var button = $(event.relatedTarget) // Button that triggered the modal
     var user_info = button.data('id') // Extract info from data-* attributes
     institute = user_info.institute
     if (institute == 'Bern/Freiburg') {
         institute = 'Freiburg'
     }
     console.log(user_info)
     
    for (i = 0; i < array_of_institutes.length; i++) {
        if (array_of_institutes[i][0] == user_info.institute || array_of_institutes[i][1] == user_info.institute) {
            institute = array_of_institutes[i][0]
        }
    }
    console.log(institute)
     // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
     var modal = $(this)
     document.getElementById("formUpdateUser").action = "users/Institute_"+institute+"/"+user_info._id+"/updateContactInfoAdmin"
     modal.find('.modal-body input[name="FirstName"]').val(user_info.first_name)
     modal.find('.modal-body input[name="LastName"]').val(user_info.last_name)
     modal.find('.modal-body input[name="Email"]').val(user_info.email)
     modal.find('.modal-body input[name="institute"]').val(institute)
     modal.find('.modal-body input[name="prevTime"]').val(user_info.previous_time)
     modal.find('.modal-body input[name="Time"]').val(user_info.percent_xenon)
     modal.find('.modal-body input[name="Tasks"]').val(user_info.tasks)
     modal.find('.modal-body input[name="StartDate"]').val(new Date(user_info.start_date).toISOString().slice(0,10))
 
     if (modal.find('.modal-body option[value="'+ user_info.position +'"]').length) {
       modal.find('.modal-body option[id="selected"]').attr('selected', false)
       modal.find('.modal-body option[value="'+ user_info.position +'"]').attr('selected', true)
     }
     
     if (user_info.mailing_lists) {
       var lists = user_info.mailing_lists
       for (i = 0; i < lists.length; i++) {
         if (lists[i] != null) {
           modal.find('.modal-body input[value="'+ lists[i]+ '"]').prop("checked", true)
         }
       }
     }
   })
   $('#updateUserModal').on('hidden.bs.modal', function(e) {
     $("#updateUserModal .modal-body").find('input:checkbox').prop('checked', false);
     $("#update_institute option").removeAttr("selected")
     document.getElementById(institute).selected = false;
   })
 }

function AutocompleteInstitutes(id) {
    var arr = ['Bologna', 'Coimbra', 'Columbia', 'Freiburg', 'KIT',
    'Kobe', "L'Aquila", 'LAL', 'LNGS-GSSI', 'LPNHE', 'Mainz',
    'MPI Heidelberg','Muenster', 'Nagoya', 'Naples', 'Nikhef',
    'NYUAD', 'Purdue', 'Rensselear', 'Rice', 'Stockholm', 'Subatech',
    'Tokyo', 'Torino', 'UChicago', 'UCSD', 'WIS', 'Zurich'];
    console.log(arr)
    $(id).autocomplete({
      source: function( request, response ) {
        console.log(request)
        console.log(response)
        var matches = $.map( arr, function(item) {
          if ( item.toUpperCase().indexOf(request.term.toUpperCase()) != -1 ) {
            return item;
          } 
        });
        response(matches);
      }
    });
}

function Autocomplete(id, arr) {
    arr = arr.split(",")
    console.log(arr)
    $(id).autocomplete({
      source: function( request, response ) {
        console.log(request)
        console.log(response)
        var matches = $.map( arr, function(item) {
          if ( item.toUpperCase().indexOf(request.term.toUpperCase()) != -1 ) {
            return item;
          }
        });
        response(matches);
      }
    });
}