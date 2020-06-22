function InitializeTable(divname){
    var groupColumn = 0
    $(divname).DataTable({
        buttons: [

            'searchPanes'
        ],        
        searchPanes:{
            viewTotal: true,
            columns: [0, 3],
        },
        dom: 'Bflrtip',                                                           
        order: [[groupColumn, 'asc']],
        displayLength: 25,
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
            { data : "last_name" , searchable: true},
            { data : "first_name", searchable: true },
            { data : "position", searchable: true },
            { data : "start_date", format: 'MM.YYYY', type: 'datetime'},
            { data : "end_date", format: 'MM.YYYY', type: 'datetime',
	      defaultContent: "<i>Not set</i>"},
            { data : "email" },
        ],
        columnDefs: [
            {title: "Institute", targets: 0},
            { title: "Last Name", targets: 1},
            { title: "First Name", targets: 2},
            { title: "Position", targets: 3},
            { title: "Start", targets: 4},
            { title: "End", targets: 5},
            { title: "Email", targets: 6},
            {"visible": false, "targets": groupColumn},
            {
            targets: [4, 5],
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
                        '<tr class="group"><td colspan="6"><strong>'+group+'</strong></td></tr>'
                    )
                    last = group;
                }
            })
        }
    });
}
