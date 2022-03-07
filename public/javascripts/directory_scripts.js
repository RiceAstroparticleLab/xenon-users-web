/*
 * Scripts for authors and fulldirectory page
 */

const INSTITUTES_ARRAY = [['Bologna'], ['Coimbra'], ['Columbia'], 
                          ['Freiburg', 'Bern/Freiburg'], ['KIT'], 
                          ['Kobe'], ["L'Aquila"], ['LAL'], 
                          ['LNGS-GSSI', 'LNGS'], ['LPNHE'], ['Mainz'], 
                          ['MPI Heidelberg', 'MPIK Heidelberg'], 
                          ['Munster', 'Muenster'], ['Nagoya'], 
                          ['Naples', 'INFN Naples'], ['Nikhef'], ['NYUAD'], 
                          ['Purdue'], ['Rensselear'], ['Rice'], ['Stockholm'], 
                          ['Subatech'], ['Tokyo'], ['Torino'], 
                          ['UChicago', 'Chicago'], ['UCSD', 'UC San Diego'], 
                          ['WIS', 'Weizmann'], ['Zurich']];

// Makes DataTables table of current members in the fulldirectory page in 
// selected div (tablediv)
function InitializeTable(tablediv) {
  var groupColumn = 1;
  var table = $(tablediv).DataTable({       
    dom: 'flrtip',                                  
    order: [[groupColumn, 'asc']],
    pageResize: true,
    paging: false,
    language: {
      search: '',
      searchPlaceholder: 'Search...',
    },
    ajax: {
      url: '/shifts/curr_table_info',
      type: 'POST',
    },
    columns: [	    
      { data: "institute", defaultContent: '', searchable: true },
      { data: "institute", searchable: true },
      { data: "last_name", searchable: true },
      { data: "first_name", searchable: true },
      { data: "email", orderable: false, searchable: true },
      { data: "position", searchable: true },
      { data: "percent_xenon", orderable: false },
      { data: "start_date", type: 'datetime' }, 
      { data: "previous_time", defaultContent: '', orderable: false },
      { data: "last_modified", defaultContent: ''},
      { title: '', orderable: false }
    ],
    columnDefs: [
      { title: 'Institute', targets: 0 },
      { title: 'Institute', targets: 1 },
      { title: 'Last Name', targets: 2 },
      { title: 'First Name', targets: 3 },
      { title: 'Email', targets: 4 },
      { title: 'Position', targets: 5 },
      { title: 'Time', targets: 6 },
      { title: 'Start Date', targets: 7 },
      { title: 'Explanations <button type="button" class="btn btn-sm"' +
        'data-html="true" data-toggle="tooltip" data-placement="right" id="explanations"' +
        'data-original-title="Date of moving between institutes and comments on other ' +
        'status changes" style="border-radius:25px;border:transparent;padding:0px 5px;">' +
        '<i class="fas fa-question"></i></button>', targets: 8 },
      { visible: false, targets: 9 },
      { targets: -1,
        data: null,
        defaultContent: "<button type='button' class='btn-circle'>" + 
                        "<i class='fas fa-pen'></i></button>"
      },
      { visible: false, targets: groupColumn },
      { targets: [7],
        render: function(data) {
          if (typeof(data) === 'undefined') {
            return '';
          }
          return moment(data).tz('Atlantic/St_Helena').format('MMM YYYY');
        }
      }
    ],
    createdRow: function(row, data, index) {
      var d = new Date();
      var oneMonthAgo = d.setMonth(d.getMonth() - 1);
      if (new Date(data['last_modified']) > oneMonthAgo) {
        $(row).addClass('modified');
      }
    },
    // groups rows so that each group of members has a header row that has the 
    // name of the institute (like Ze's list)
    drawCallback: function(settings) {
      var api = this.api();
      var rows = api.rows({page: 'current'}).nodes();
      var last = null;
      
      api.column(groupColumn, {page: 'current'}).data().each(function(group,i) {
        if (last !== group) {
          $(rows).eq(i).before(
            '<tr class="group"><td colspan="9"><strong>' + group + 
              '</strong></td></tr>'
          )
          last = group;
        }
      })
    }
  });

  // set permisions for the edit button on the right hand side of each row
  $(tablediv + ' tbody').on('click', 'button', function(e) {
    e.preventDefault();
    var data = table.row($(this).parents('tr')).data();
    var user = data.current_user;
    if(user.groups.includes("directory") || (user.position === "PI" && data.institute === user.institute)) {
      openModal(data, 'fulldirectory');
    } else {
      alert("Sorry, you don't have the correct permissions.");
    }
  });
}

// Makes DataTables table of previous members in the fulldirectory page in 
// selected div (tablediv)
function InitializePrevTable(tablediv) {
  var groupColumn = 8;
  var table = $(tablediv).DataTable({  
    dom: 'flrtip',                                  
    order: [[groupColumn, 'desc']],
    pageResize: true,
    paging: false,
    language: {
      search: '',
      searchPlaceholder: 'Search...',
    },
    ajax: {
      url: '/shifts/prev_table_info',
      type: 'POST',
    },
    columns: [	    
      { data: "institute", searchable: true },
      { data: "last_name" , searchable: true },
      { data: "first_name", searchable: true },
      { data: "email", orderable: false, searchable: true },
      { data: "position", searchable: true },
      { data: "percent_xenon", orderable: false },
      { data: "start_date", type: 'datetime' }, 
      { data: "end_date", type: 'datetime' },
      { data: "end_date", format: 'YYYY', type: 'datetime', orderable: false },
      { title: '', orderable: false }
    ],
    columnDefs: [
      { title: 'Institute', targets: 0 },
      { title: 'Last Name', targets: 1 },
      { title: 'First Name', targets: 2 },
      { title: 'Email', targets: 3 },
      { title: 'Position', targets: 4 },
      { title: 'Time', targets: 5},
      { title: 'Start Date', targets: 6 },
      { title: 'End Date', targets: 7 },
      { targets: -1,
        data: null,
        defaultContent: "<button type='button' class='btn-circle'>" + 
                        "<i class='fas fa-pen'></i></button>"
      },
      { visible: false, targets: groupColumn },
      { targets: [6, 7],
        render: function(data){
          if (typeof(data) === 'undefined') {
            return '';
          }
          return moment(data).tz('Atlantic/St_Helena').format('MMM YYYY');
        }
      }
    ],
    // groups rows by year they left collaboration so that each group of 
    // members has a header row that has the year (like Ze's list)
    drawCallback: function(settings) {
      var api = this.api();
      var rows = api.rows({page: 'current'}).nodes();
      var last = null;

      api.column(groupColumn, {page: 'current'}).data().each(function(group,i) {
        var year = moment(group).tz('Atlantic/St_Helena').format('YYYY');
        if (last !== year) {
          $(rows).eq(i).before(
            '<tr class="group"><td colspan="9"><strong>' + year + 
              '</strong></td></tr>'
          )
          last = year;
        }
      })
    }
  });

  // set permisions for the edit button on the right hand side of each row
  $(tablediv + ' tbody').on('click', 'button', function(e) {
    e.preventDefault();
    var data = table.row($(this).parents('tr')).data();
    var user = data.current_user;
    if(user.groups.includes("directory") || (user.position === "PI" && data.institute === user.institute)) {
      openModal(data, 'fulldirectory');
    } else {
      alert("Sorry, you don't have the correct permissions.");
    }
  });
}

// Makes DataTables table of previous members in the fulldirectory page in 
// selected div (tablediv)
function TechTable(tablediv) {
  var groupColumn = 1;
  var table = $(tablediv).DataTable({
    dom: 'flrtip',               
    order: [[groupColumn, 'asc']],
    pageResize: true,
    paging: false,
    language: {
      search: '',
      searchPlaceholder: 'Search...',
    },
    ajax: {
      url: '/shifts/tech_table',
      type: 'POST',
    },
    columns: [
      { data: "institute", defaultContent: '', searchable: true },
      { data: "institute", searchable: true },
      { data: "last_name", searchable: true },
      { data: "first_name", searchable: true },
      { data: "email", orderable: false, searchable: true },
      { data: "position", searchable: true },
      { data: "percent_xenon", orderable: false },
      { data: "start_date", type: 'datetime' },
      { data: "previous_time", defaultContent: '', orderable: false },
      { data: "username", defaultContent: '', orderable: false },
      { title: '', orderable: false }
    ],
    columnDefs: [
      { title: 'Institute', targets: 0 },
      { title: 'Institute', targets: 1 },
      { title: 'Last Name', targets: 2 },
      { title: 'First Name', targets: 3 },
      { title: 'Email', targets: 4 },
      { title: 'Position', targets: 5 },
      { title: 'Time', targets: 6 },
      { title: 'Start Date', targets: 7 },
      { title: 'Explanations <button type="button" class="btn btn-sm"' +
        'data-html="true" data-toggle="tooltip" data-placement="right" id="explanationsTech"' +
        'data-original-title="Date of moving between institutes and comments on other ' +
        'status changes" style="border-radius:25px;border:transparent;padding:0px 5px;">' +
        '<i class="fas fa-question"></i></button>', targets: 8 },
      { title: 'Username', targets: 9 },
      { targets: -1,
        data: null,
        defaultContent: "<button type='button' class='btn-circle'>" +
                        "<i class='fas fa-pen'></i></button>"
      },
      { visible: false, targets: groupColumn },
      { targets: [7],
        render: function(data) {
          if (typeof(data) === 'undefined') {
            return '';
          }
          if (typeof(data) === String) {
            return data
          }
          return moment(data).tz('Atlantic/St_Helena').format('MMM YYYY');
        }
      }
    ],
    // groups rows so that each group of members has a header row that has the 
    // name of the institute (like Ze's list)
    drawCallback: function(settings) {
      var api = this.api();
      var rows = api.rows({page: 'current'}).nodes();
      var last = null;

      api.column(groupColumn, {page: 'current'}).data().each(function(group,i) {
        if (last !== group) {
          $(rows).eq(i).before(
            '<tr class="group"><td colspan="10"><strong>' + group +
              '</strong></td></tr>'
          )
          last = group;
        }
      })
    }
  });
  // set permisions for the edit button on the right hand side of each row
  $(tablediv + ' tbody').on('click', 'button', function(e) {
    e.preventDefault();
    var data = table.row($(this).parents('tr')).data();
    var user = data.current_user;
    if(user.groups.includes("directory") || (user.position === "PI" && data.institute === user.institute)) {
      openModal(data, 'fulldirectory');
    } else {
      alert("Sorry, you don't have the correct permissions.");
    }
  });
}

// Makes DataTables table of previous technicians in the fulldirectory page in 
// selected div (tablediv)
function PrevTechTable(tablediv) {
  var table = $(tablediv).DataTable({       
    dom: 'flrtip',                                  
    order: [[7, 'asc']],
    pageResize: true,
    paging: false,
    language: {
      search: '',
      searchPlaceholder: 'Search...',
    },
    ajax: {
      url: '/shifts/prev_tech_table',
      type: 'POST',
    },
    columns: [
      { data: "institute", defaultContent: '', searchable: true},
      { data: "last_name", searchable: true },
      { data: "first_name", searchable: true },
      { data: "email", orderable: false, searchable: true },
      { data: "position", searchable: true },
      { data: "percent_xenon", orderable: false },
      { data: "start_date", type: 'datetime' },
      { data: "end_date", type: 'datetime', orderable: false }, 
      { data: "username", defaultContent: '', orderable: false },
      { title: '', orderable: false }
    ],
    columnDefs: [
      { title: 'Institute', targets: 0 },
      { title: 'Last Name', targets: 1 },
      { title: 'First Name', targets: 2 },
      { title: 'Email', targets: 3 },
      { title: 'Position', targets: 4 },
      { title: 'Time', targets: 5 },
      { title: 'Start Date', targets: 6 },
      { title: 'End Date', targets: 7 },
      { title: 'Username', targets: 8 },
      { targets: -1,
        data: null,
        defaultContent: "<button type='button' class='btn-circle'>" + 
                        "<i class='fas fa-pen'></i></button>"
      },
      { targets: [6, 7],
        render: function(data) {
          if (typeof(data) === 'undefined') {
            return '';
          }
          if (typeof(data) === String) {
            return data
          }
          return moment(data).tz('Atlantic/St_Helena').format('MMM YYYY');
        }
      }
    ],
  });
  // set permisions for the edit button on the right hand side of each row
  $(tablediv + ' tbody').on('click', 'button', function(e) {
    e.preventDefault();
    var data = table.row($(this).parents('tr')).data();
    var user = data.current_user;
    if(user.groups.includes("directory") || (user.position === "PI" && data.institute === user.institute)) {
      openModal(data, 'fulldirectory');
    } else {
      alert("Sorry, you don't have the correct permissions.");
    }
  });
}

// Makes DataTables table of previous members in the authors page in 
// selected div (tablediv)
function PrevAuthorsTable(tablediv) {
  var table = $(tablediv).DataTable({
    lengthMenu: [[10, 50, 100, -1], [10, 50, 100, 'All']],
    ajax: {
      url: '/shifts/prev_author_table',
      type: 'POST',
    },
    columns: [	    
      { data: "last_name", searchable: true },
      { data: "first_name", searchable: true },
      { data: "institute", searchable: true },
      { data: "email" },
      { data: "position", searchable: true },
      { data: "percent_xenon" },
      { data: "start_date", format: 'MM.YYYY', type: 'datetime' },
      { data: "end_date", format: 'MM.YYYY', type: 'datetime' },
      { data: "additional_institutes", defaultContent: '' },
      { title: '', orderable: false }
    ],
    columnDefs: [
      { title: 'Last Name', targets: 0 },
      { title: 'First Name', targets: 1 },
      { title: 'Institute', targets: 2 },
      { title: 'Email', targets: 3 },
      { title: 'Position', targets: 4 },
      { title: 'Time', targets: 5 },
      { title: 'Start', targets: 6 },
      { title: 'End', targets: 7 },
      { title: 'Additional Insititutions', targets: 8 },
      { targets: -1,
        data: null,
        defaultContent: "<button type='button' class='btn-circle'>" +
                        "<i class='fas fa-pen'></i></button>"
      },
      { targets: [6,7],
        render: function(data) {
          if (typeof(data) === 'undefined') {
            return '';
          }
          return moment(data).format('MM/DD/YYYY');
        }
      }
    ],
  })

  // set permissions for edit button
  $(tablediv + ' tbody').on('click', 'button', function (e) {
      e.preventDefault();
      var data = table.row($(this).parents('tr')).data();
      var user = data.current_user;
      if (user.groups.includes("directory")) {
        openModal(data, 'authors');
      } else {
        alert("Sorry, you don't have the correct permissions.")
      }
  });
}

// Makes DataTables table of current members in the authors page in 
// selected div (tablediv)
function CurrAuthorsTable(tablediv) {
  var table = $(tablediv).DataTable({
    lengthMenu: [[10, 50, 100, -1], [10, 50, 100, 'All']],
    ajax: {
      url: '/shifts/curr_author_table',
      type: 'POST',
    },
    columns: [	    
        { data: "last_name", searchable: true },
        { data: "first_name", searchable: true },
        { data: "institute", searchable: true },
        { data: "email" },
        { data: "position", searchable: true },
        { data: "percent_xenon" },
        { data: "start_date", format: 'MM.YYYY', type: 'datetime' },
        { data: "additional_institutes", defaultContent: '' },
        { title: '', orderable: false }
    ],
    columnDefs: [
      { title: 'Last Name', targets: 0 },
      { title: 'First Name', targets: 1 },
      { title: 'Institute', targets: 2 },
      { title: 'Email', targets: 3 },
      { title: 'Position', targets: 4 },
      { title: 'Time', targets: 5 },
      { title: 'Start', targets: 6 },
      { title: 'Additional Institutions', targets: 7 },
      { targets: -1,
        data: null,
        defaultContent: "<button type='button' class='btn-circle'>" +
                        "<i class='fas fa-pen'></i></button>"
      },
      { targets: [6],
        render: function(data) {
          if (typeof(data) === 'undefined') { 
            return '';
          }
          return moment(data).format('MM/DD/YYYY');
        }
      }
    ],
  })

  // set permissions for edit button
  $(tablediv + ' tbody').on('click', 'button', function(e) {
    e.preventDefault();
    var data = table.row($(this).parents('tr')).data();
    var user = data.current_user;
    if (user.groups.includes("directory")) {
      openModal(data, 'authors');
    } else {
      alert("Sorry, you don't have the correct permissions.")
    }
  });
}

// Sets default values for modal that is opened when the edit button is 
// clicked in any of the above tables in the specified page (page) using the
// data that is being displayed in the table (user_info)
function openModal(userInfo, page) {
  $('#updateUserModal').on('show.bs.modal', function(event) {
    var institute;

    // catch any institutes whose names may be under other aliases
    for (let i = 0; i < INSTITUTES_ARRAY.length; i++) {
      let primary = INSTITUTES_ARRAY[i][0];
      let secondary = INSTITUTES_ARRAY[i][1];
      if (primary === userInfo.institute || secondary === userInfo.institute) {
        institute = primary;
        break;
      }
    }
    
    // Update the modal's content based on data from user info
    var modal = $(this);
    document.getElementById('formUpdateUser').action = 
      'users/' + page + '/' + userInfo._id + '/updateContactInfoAdmin';
    modal.find('.modal-body input[name="FirstName"]').val(userInfo.first_name);
    modal.find('.modal-body input[name="LastName"]').val(userInfo.last_name);
    modal.find('.modal-body input[name="Email"]').val(userInfo.email);
    modal.find('.modal-body input[name="Time"]').val(userInfo.percent_xenon);
    modal.find('.modal-body input[name="Tasks"]').val(userInfo.tasks);
    if (userInfo.position){
      modal.find('.modal-body select[name="position"]').val(userInfo.position).prop('selected', true);
    } else {
      modal.find('.modal-body select[name="position"]').val('default').prop('selected', true);
    }
    if (userInfo.institute) {
      modal.find('.modal-body select[name="institute"]').val(userInfo.institute).prop('selected', true);
    } else {
      modal.find('.modal-body select[name="institute"]').val('default').prop('selected', true);
    }
    modal.find('.modal-body input[name="lngs_id"]').val(userInfo.lngs_ldap_uid);
    modal
      .find('.modal-body input[name="prevTime"]')
      .val(userInfo.previous_time);
    modal
      .find('.modal-body input[name="StartDate"]')
      .val(new Date(userInfo.start_date).toISOString().slice(0,10));
    if (userInfo.end_date && userInfo.end_date != null && userInfo.end_date != "") {
      modal
        .find('.modal-body input[name="EndDate"]')
        .val(new Date(userInfo.end_date)
    .toISOString().slice(0,10));
    }
    
    // select only the checkboxes that correspond to the mailing lists for
    // this user
    var lists = userInfo.mailing_lists;
    if (lists) {
      for (let i = 0; i < lists.length; i++) {
        if (lists[i] != null) {
          modal
            .find('.modal-body input[value="'+ lists[i]+ '"]')
            .prop("checked", true);
        }
      }
    }
  });
  // reset checkboxes when modal is closed
  $('#updateUserModal').on('hidden.bs.modal', function(e) {
    $("#updateUserModal .modal-body")
      .find('input:checkbox')
      .prop('checked', false);
    $("#updateUserModal .modal-body")
      .find('select:option')
      .prop('selected', false);
  });

  $('#updateUserModal').modal('show');
}

// Sets default values for modal that is opened on individual user pages using
// data stored in database
function UpdateUserModal() {
  var institute;
  $('#updateUserModal').on('show.bs.modal', function(event) {
    // Button that triggered the modal
    var button = $(event.relatedTarget);
    var userInfo = button.data('id');

    // deal with any institute naming discrepancies    
    institute = userInfo.institute;
    for (let i = 0; i < INSTITUTES_ARRAY.length; i++) {
      let primary = INSTITUTES_ARRAY[i][0];
      let secondary = INSTITUTES_ARRAY[i][1];
      if (primary === userInfo.institute || secondary === userInfo.institute) {
        institute = primary;
      }
    }

    var modal = $(this);
    // Update the modal's content to match the data for the user
    document.getElementById('formUpdateUser').action = 
      '/shifts/users/Institute_'+institute+'/'+userInfo._id+'/updateContactInfoAdmin';
    modal.find('.modal-body input[name="FirstName"]').val(userInfo.first_name);
    modal.find('.modal-body input[name="LastName"]').val(userInfo.last_name);
    modal.find('.modal-body input[name="Email"]').val(userInfo.email);
    if (userInfo.position){
      modal.find('.modal-body select[name="position"]').val(userInfo.position).prop('selected', true);
    } else {
      modal.find('.modal-body select[name="position"]').val('default').prop('selected', true);
    }
    if (userInfo.institute) {
      modal.find('.modal-body select[name="institute"]').val(userInfo.institute).prop('selected', true);
    } else {
      modal.find('.modal-body select[name="institute"]').val('default').prop('selected', true);
    }
    modal.find('.modal-body input[name="Time"]').val(userInfo.percent_xenon);
    modal.find('.modal-body input[name="Tasks"]').val(userInfo.tasks);
    modal.find('.modal-body input[name="lngs_id"]').val(userInfo.lngs_ldap_uid);
    modal
      .find('.modal-body input[name="prevTime"]')
      .val(userInfo.previous_time);
    modal
      .find('.modal-body input[name="StartDate"]')
      .val(new Date(userInfo.start_date).toISOString().slice(0,10));

    if (userInfo.end_date != "" && userInfo.end_date != null) {
      modal
        .find('.modal-body input[name="EndDate"]')
        .val(new Date(userInfo.end_date).toISOString().slice(0,10));
    }
    
    // check only correct mailing list checkbox
    var lists = userInfo.mailing_lists;
    if (lists) {
      for (i = 0; i < lists.length; i++) {
        if (lists[i] != null) {
          modal
            .find('.modal-body input[value="'+ lists[i]+ '"]')
            .prop("checked", true);
        }
      }
    }
  });

  // uncheck checkboxes and unselect position on close modal
  $('#updateUserModal').on('hidden.bs.modal', function(e) {
    $("#updateUserModal .modal-body")
      .find('input:checkbox')
      .prop('checked', false);
    $("#update_institute option").removeAttr("selected");
    document.getElementById(institute).selected = false;
  });
}

// Allows the textbox with the id (id) to provide autocomplete suggestions 
// based on an inputted array (arr). If no array is inputted, the function 
// defaults to an array of institutes
function Autocomplete(id, arr) {
  if (arr) {
    arr = arr.split(',');
  } else {
    arr = ['Bologna', 'Coimbra', 'Columbia', 'Freiburg', 'KIT',
    'Kobe', "L'Aquila", 'LAL', 'LNGS-GSSI', 'LPNHE', 'Mainz',
    'MPI Heidelberg','Muenster', 'Nagoya', 'Naples', 'Nikhef',
    'NYUAD', 'Purdue', 'Rensselear', 'Rice', 'Stockholm', 'Subatech',
    'Tokyo', 'Torino', 'UChicago', 'UCSD', 'WIS', 'Zurich'];
  }
  $(id).autocomplete({
    source: function(request, response) {
      var matches = $.map(arr, function(item) {
        if (item.toUpperCase().indexOf(request.term.toUpperCase()) !== -1) {
          return item;
        }
      });
      response(matches);
    }
  });
}

// shows message suggesting the user go to the remove a user form
function suggestRemoveForm(elem) {
  $(elem).on('input', function() {
    // regex for YYYY-MM-DD
    var re = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    if (re.test($(this).val())) {
      var d = new Date($(this).val());
      if (d < new Date()) {
        $('#suggest_form').show();
      }
    }
  });
}
