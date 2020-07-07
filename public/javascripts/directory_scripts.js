function InitializeTable(divname){
    var groupColumn = 1
    var table = $(divname).DataTable({
        buttons: [
            'searchPanes'
        ],        
        searchPanes:{
            viewTotal: true,
            columns: [0, 3],
        },       
        dom: 'Bflrtip',                                  
        order: [[groupColumn, 'asc']],
        lengthMenu: [[25, 50, 100, -1], [25, 50, 100, "All"]],
        pageResize: true,
        language: {
            search: "",
            searchPlaceholder: "Search...",
            searchPanes: {
                collapse: {0: 'Filter', _: 'Filter (%d)'}
            }
        },
        ajax : {
            url: '/table_info',
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
            { title: "Start", targets: 7},
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
                return moment(data).format('MM/DD/YYYY');
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
        openModal(data)
    } );

}

function PrevAuthorsTable(divname) {
    var table = $(divname).DataTable({
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "All"]],
        ajax : {
            url: '/prev_author_table',
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
        openModal(data)
    } );
}

function CurrAuthorsTable(divname) {
    var table = $(divname).DataTable({
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "All"]],
        ajax : {
            url: '/curr_author_table',
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
        openModal(data)
    } );
}

function openModal(data) {
    $('#updateUserModal').on('show.bs.modal', function (event) {
        var user_info = data // Extract info from data-* attributes
        
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        document.getElementById("formUpdateUser").action = "/users/"+user_info._id+"/updateContactInfoAdmin"
        modal.find('.modal-body input[name="FirstName"]').val(user_info.first_name)
        modal.find('.modal-body input[name="LastName"]').val(user_info.last_name)
        modal.find('.modal-body input[name="Email"]').val(user_info.email)
        modal.find('.modal-body input[name="Institute"]').val(user_info.institute)
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
        $("#updateUserModal .modal-body").find('option').attr('selected', false);
        $("#updateUserModal").find('.modal-body option[id="selected"]').attr('selected', true)
      })
    $('#updateUserModal').modal('show')
}

function UpdateUserModal() {
    $('#updateUserModal').on('show.bs.modal', function (event) {
     var button = $(event.relatedTarget) // Button that triggered the modal
     var user_info = button.data('id') // Extract info from data-* attributes
     console.log(user_info)
     
     // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
     var modal = $(this)
     document.getElementById("formUpdateUser").action = "/users/"+user_info._id+"/updateContactInfoAdmin"
     modal.find('.modal-body input[name="FirstName"]').val(user_info.first_name)
     modal.find('.modal-body input[name="LastName"]').val(user_info.last_name)
     modal.find('.modal-body input[name="Email"]').val(user_info.email)
     modal.find('.modal-body input[name="Institute"]').val(user_info.institute)
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
     $("#updateUserModal .modal-body").find('option').attr('selected', false);
     $("#updateUserModal").find('.modal-body option[id="selected"]').attr('selected', true)
   })
 }