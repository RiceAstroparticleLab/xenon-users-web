function UpdateUserModal() {
   $('#updateUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var user_info = button.data('id') // Extract info from data-* attributes
    
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    document.getElementById("formUpdateUser").action = "/users/"+user_info._id+"/updateContactInfoAdmin"
    modal.find('.modal-body input[name="FirstName"]').val(user_info.first_name)
    modal.find('.modal-body input[name="LastName"]').val(user_info.last_name)
    modal.find('.modal-body input[name="Email"]').val(user_info.email)
    modal.find('.modal-body input[name="Position"]').val(user_info.position)
    modal.find('.modal-body input[name="Institute"]').val(user_info.institute)
    modal.find('.modal-body input[name="Time"]').val(user_info.percent_xenon)
    modal.find('.modal-body input[name="Tasks"]').val(user_info.tasks)
    modal.find('.modal-body input[name="StartDate"]').val(new Date(user_info.start_date).toISOString().slice(0,10))
  })
}
