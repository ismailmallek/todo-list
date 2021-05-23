
$(document).ready(function() {
    $('.markTaskAsCompleted').on('click', function (event) {
        var taskId = $(event.target).attr('data-id');

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
    });
    $('.deleteTask').on('click', function (event) {
        var taskId = $(event.target).attr('data-id');
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
    });
});