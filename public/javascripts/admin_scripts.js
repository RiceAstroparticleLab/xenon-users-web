/* 
 * Contains scripts for the admin dashboard page.
 */

/* scripts for User Roles tab */

// loads list of roles onto div in the users roles tab (tablediv) and 
// displays the number of roles in this list in (numdiv)
function loadRoles(tablediv, numdiv) {
  $.getJSON('admin/get_roles', function(data) {
    console.log(data)
    var html = '';
    var roles = data[data.length - 1].roles_list;
    console.log(roles.length)
    for (let i = 0; i < roles.length; i++) {
      var capital = roles[i].charAt(0).toUpperCase() +
        roles[i].slice(1);
      html += '<tr><td>' + capital + '</td><td>';
      for (let j = 0; j < data.length - 1; j++) {
        let user_roles = data[j].groups;
        console.log(user_roles);
        if (user_roles.includes(roles[i])) {
          let name = data[j].first_name + ' ' + data[j].last_name;
          var image = data[j].picture_url;
          html += '<img title="' + name + ' "class="overlap" src="' + image + 
                  '" style="border-radius:200px;">';
        }
      }
      html += '</td><td><button class="btn btn-default" data-toggle="modal"' + 
              ' data-target="#editRole">Edit Role</button></td></tr>';
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
      let git = '';
      if (doc.github !== undefined) {
        git = doc.github;
      }
      html += '<tr><td>' + doc.first_name + ' ' + doc.last_name + '</td>' +
              '<td>' + git + '</td>' +
              '<td><button class="btn btn-default"><i class="fas fa-times"></i>&nbsp;&nbsp;Remove' +
              '</button>&nbsp;&nbsp;&nbsp;<button class="btn">' + 
              '<i class="far fa-eye-slash"></i>&nbsp;&nbsp;Hide</button></td></tr>';
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
      let doc = data[i];
      let git = '';
      if (doc.github !== undefined) {
        git = doc.github;
      }
      html += '<tr><td>' + doc.first_name + ' ' + doc.last_name + '</td>' +
              '<td>' + doc.email + '</td>' +
              '<td>' + git + '</td>' +
              '<td><button class="btn btn-default"><i class="far fa-paper-plane"></i>&nbsp;&nbsp;Invite' +
              '</button>&nbsp;&nbsp;&nbsp;<button class="btn">' + 
              '<i class="far fa-eye-slash"></i>&nbsp;&nbsp;Hide</button></td></tr>';
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
              '<td><button class="btn btn-default"><i class="fas fa-plus"></i>&nbsp;&nbsp;Add' + 
              '</button>&nbsp;&nbsp;&nbsp;<button class="btn">' + 
              '<i class="far fa-eye-slash"></i>&nbsp;&nbsp;Hide</button></td></tr>';
    }
    $(numdiv).html(data.length);
    $(tablediv).html(html);
  })
}