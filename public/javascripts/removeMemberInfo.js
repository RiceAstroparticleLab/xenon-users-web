

$(window).on("load resize ", function () {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({
        'padding-right': scrollWidth
    });
}).resize();

$(document).on("keyup", "#gitHubInput", function() {
    searchBarGitHub();
});

let gtable = $("#githubtable");
let stable = $("#slacktable");
let mtable = $("#mailtable");
$(".gbutton").on("click", function() {
    $(".githubicon").css("color", "white");
    gtable.show();
    $(".slackicon").css("color", "rgba(255, 255, 255, 0.3)");
    stable.hide();
    $(".mailicon").css("color", "rgba(255, 255, 255, 0.3)");
    mtable.hide();
});
$(".sbutton").on("click", function() {
    $(".slackicon").css("color", "white");
    stable.show();
    $(".githubicon").css("color", "rgba(255, 255, 255, 0.3)");
    gtable.hide();
    $(".mailicon").css("color", "rgba(255, 255, 255, 0.3)");
    mtable.hide();
});
$(".mbutton").on("click", function() {
    $(".mailicon").css("color", "white");
    mtable.show();
    $(".slackicon").css("color", "rgba(255, 255, 255, 0.3)");
    stable.hide();
    $(".githubicon").css("color", "rgba(255, 255, 255, 0.3)");
    gtable.hide();
});




function searchBarGitHub() {
    // Declare variables
    var input, filter, table1, table2, tr1, tr2, td1, td2, i, j, txtValue;
    input = document.getElementById("gitHubInput");
    filter = input.value.toUpperCase();
    table1 = document.getElementById("memberstablebody");
    table2 = document.getElementById("collabstablebody");

    tr1 = table1.getElementsByTagName("tr");
    tr2 = table2.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr1.length; i++) {
      td1 = tr1[i].getElementsByTagName("td")[0];
      
      if (td1) {
        txtValue = td1.textContent || td1.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr1[i].style.display = "";
        } else {
          tr1[i].style.display = "none";
        }
      }

    
    }

    for (j = 0; j < tr2.length; j++) {
        td2 = tr2[j].getElementsByTagName("td")[0];
        
        if (td2) {
          txtValue = td2.textContent || td2.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr2[j].style.display = "";
          } else {
            tr2[j].style.display = "none";
          }
        }
      }
}

function searchBarSlack() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("slackInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("userstablebody");

    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }

    
    }
}

function searchBarMail() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("mailInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("mailtablebody");

    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }

    
    }
}