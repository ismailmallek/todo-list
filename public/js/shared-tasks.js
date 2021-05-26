
$(document).ready(function() {
    $('.showForm').on('click', function (event) {
        $('.hideForm').hide();
        $('.showForm').css({
            'color': 'initial',
            'font-weight': 'initial'});
        $(event.target).css({
            'color': 'cadetblue',
            'font-weight': 'bolder'});
        $(event.target).next('.hideForm').show();
    });
});