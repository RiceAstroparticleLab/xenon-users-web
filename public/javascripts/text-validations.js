// Checks that date is in YYYY-MM-DD format
function ValiDate(elem) {
  $(elem).on('input', function() {
    // regex for YYYY-MM-DD
    var re = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    if (re.test($(this).val())) {
      $(this).removeClass("invalid");
      // if bool is true, form will suggest 
    }
    else{
      $(this).addClass("invalid");
    }
  });
}

// checks if text is made of extended ASCII characters
function isASCII(str) {
  var txt = $(str).val()
  return /^[\x00-\xFF]*$/.test(txt);
}

function ValidateForm(elem, list) {
  $(elem).on('submit', function(event) {
    var valid = true;
    for (let i = 0; i < list.length; i++) {
      // checks that the field is valid. If not, shows error message
      if ($(list[i]).hasClass('invalid')) {
        valid = false
        var hiddenClass = list[i] + '_hidden';
        console.log(hiddenClass)
        $(hiddenClass).show();
      }
    }
    var start_date = new Date($('#sdate').val());
    var end_date =  new Date($('#edate').val());
    var oneyear = new Date();
    var tenyears = new Date();
    oneyear.setFullYear(oneyear.getFullYear() - 1);
    tenyears.setFullYear(tenyears.getFullYear() + 10);
    console.log(oneyear)
    console.log(tenyears)

    // check that the end date comes after start date
    if (end_date < start_date) {
      console.log("End date comes before start date");
      valid = false;
      $('#valid_edate').show();
    } else {
      $('#valid_edate').hide();
    }

    // checks that first and last name fields only use extended ASCII
    if (!isASCII('#fname')) {
      console.log("First name not ascii");
      valid = false;
      $('#fname_hidden').show();
    } else {
      $('#fname_hidden').hide();
    }
    if (!isASCII('#lname')) {
      console.log("Last name not ascii");
      valid = false;
      $('#lname_hidden').show();
    } else {
      $('#lname_hidden').hide()
    }

    // If all fields are valid, submit form, otherwise don't
    console.log(valid)
    if (!valid) {
      event.preventDefault();
    } else {
      var submit_button = $(this).find(':submit');
      submit_button.attr('disabled', true);
    }
  });
}

// Checks that a phone number is in valid format.
function ValidatePhone(elem) {
  $(elem).on('input', function() {
    // regex for valid phone numbers.
    var re = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    if (re.test($(this).val())) {
      $(this).removeClass("invalid");
      // if bool is true, form will suggest 
    }
    else {
      $(this).addClass("invalid");
    }
  });
}