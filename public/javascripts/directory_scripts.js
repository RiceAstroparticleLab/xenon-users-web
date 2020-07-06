function InitializeTable(divname){
    var groupColumn = 0
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
            { data : "institute", searchable: true },
            { data : null, defaultContent: ''},
            { data : "last_name" , searchable: true},
            { data : "first_name", searchable: true },
            { data : "email" },
            { data : "position", searchable: true },
            { data : "percent_xenon" },
            { data : "start_date", format: 'MM.YYYY', type: 'datetime'},
            { data : null, defaultContent: ''},
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
            { title: "", data: null, defaultContent: '<button type="button" class="btn-circle"><i class="fas fa-pen"></i></button>', targets: -1},
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

    $(divname + 'tbody').on( 'click', 'button', function (e) {
        e.preventDefault()
        var data = table.row( $(this).parents('tr') ).data();
        $('#updateUserModal').on('show.bs.modal', function (event) {
            // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
            var modal = $(this)
            document.getElementById("formUpdateUser").action = "/users/"+data._id+"/updateContactInfoAdmin"
            modal.find('.modal-body input[name="FirstName"]').val(data.first_name)
            modal.find('.modal-body input[name="LastName"]').val(data.last_name)
            modal.find('.modal-body input[name="Email"]').val(data.email)
            modal.find('.modal-body input[name="Position"]').val(data.position)
            modal.find('.modal-body input[name="Institute"]').val(data.institute)
            modal.find('.modal-body input[name="Time"]').val(data.percent_xenon)
            modal.find('.modal-body input[name="Tasks"]').val(data.tasks)
            modal.find('.modal-body input[name="StartDate"]').val(new Date(data.start_date).toISOString().slice(0,10))
        })
        $('#updateUserModal').modal('show')
    } );

}

function PrevAuthorsTable(divname) {
    $(divname).DataTable({
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
            { data : "" },
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
}

function CurrAuthorsTable(divname) {
    $(divname).DataTable({
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
            { data : "" },
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
}