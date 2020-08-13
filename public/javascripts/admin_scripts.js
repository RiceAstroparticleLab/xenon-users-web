/* 
 * Contains scripts for the admin dashboard page.
 */

/* scripts for User Roles tab */

// loads list of roles onto div in the users roles tab (tablediv) and 
// displays the number of roles in this list in (numdiv)
function loadRoles(tablediv, numdiv) {
  $.getJSON('admin/get_roles', function(data) {
    var html = '';
    var roles = data[0].roles_list;

    for (let i = 0; i < roles.length; i++) {
      html += '<tr><td>' + roles[i] + '</td></tr>';
    }
    $(numdiv).html(roles.length);
    $(tablediv).html(html);
  })
}

/* scripts for GitHub tab */

// loads list of people from selected GitHub organization (org) that need to be 
// removed from GitHub onto div in github tab (tablediv) and displays the
// number of people in this list in (numdiv)
function loadRemove(org, tablediv, numdiv) {
  $.getJSON('admin/gitremove_' + org, function(data) {
    var html = '';

    for (let i = 0; i < data.length; i++) {
      let doc = data[i][0];
      html += '<tr><td>' + doc.first_name + ' ' + doc.last_name + '</td>' +
              '<td><button class="btn-circle"><i class="fas fa-times"></i>' +
              '</button></td></tr>';
    }
    $(numdiv).html(data.length);
    $(tablediv).html(html);
  })
}

// loads list of people from selected GitHub organization (org) that need to be 
// added to GitHub onto div as a table in github tab (tablediv) and displays
// the number of people in this list in (numdiv)
function loadAdd(org, tablediv, numdiv) {
  $.getJSON('admin/gitadd_' + org, function(data) {
    var html = '';

    for (let i = 0; i < data.length; i++) {
      let doc = data[i][0];
      html += '<tr><td>' + doc.first_name + ' ' + doc.last_name + '</td></tr>';
    }
    $(numdiv).html(data.length);
    $(tablediv).html(html);
  })
}

// loads list of people who have a github account but are not in the database
// onto the div as a table in github tab (tablediv) and displays the number of
// people in this list in (numdiv)
function loadAddToDB(tablediv, numdiv){
  $.getJSON('admin/add_to_db', function(data) {
    var html = '';

    for (let i = 0; i < data.length; i++) {
      html += '<tr><td>' + data[i].toString().replace(/,/g, ' ') + '</td>' +
              '<td><button class="btn-circle"><i class="fas fa-plus"></i>' + 
              '</button></td></tr>';
    }
    $(numdiv).html(data.length);
    $(tablediv).html(html);
  })
}