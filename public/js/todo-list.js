
$(document).ready(function() {
    $('.markTaskAsCompleted').on('click', function (event) {
        var taskId = $(event.target).attr('data-id');


        var proceed = confirm("Are you sure you want to mark this task as completed ?");
        if (proceed) {
            $.ajax({
                type: 'PUT',
                url: '/markAsCompleted/' + taskId,
                success: function(resp) {
                    alert('task updated');
                    window.location.href = '/todo-list';
                },
                error: function(err) {
                    console.log(err);
                }
            });
        } else {
          //don't proceed
        }
    });
    $('.shareTask').on('click', function (event) {
        var taskId = $(event.target).attr('data-id');

        var proceed = confirm("Are you sure you want to SHARE this task ?");
        if (proceed) {
            $.ajax({
                type: 'PUT',
                url: '/markAsShared/' + taskId,
                error: function(err) {
                    console.log(err);
                }
            });
        } else {
          //don't proceed
        }
    });
    $('.unshareTask').on('click', function (event) {
        var taskId = $(event.target).attr('data-id');

        var proceed = confirm("Are you sure you want to UNSHARE this task ?");
        if (proceed) {
            $.ajax({
                type: 'PUT',
                url: '/markAsUnshared/' + taskId,
                error: function(err) {
                    console.log(err);
                }
            });
        } else {
          //don't proceed
        }
    });
    $('.deleteTask').on('click', function (event) {
        var taskId = $(event.target).attr('data-id');
        var proceed = confirm("Are you sure you want to DELETE this task ?");
        if (proceed) {
            $.ajax({
                type: 'DELETE',
                url: '/deleteTask/' + taskId,
                success: function(resp) {
                    alert('task deleted');
                    window.location.href = '/todo-list';
                },
                error: function(err) {
                    console.log(err);
                }
            });
        } else {
          //don't proceed
        }
    });
});