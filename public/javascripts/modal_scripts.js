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
