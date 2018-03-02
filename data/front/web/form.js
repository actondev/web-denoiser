
var $form = $('.box');
$form.addClass('has-advanced-upload');
console.log("here");

var droppedFiles = false;

var $input    = $form.find('input[type="file"]'),
    $label    = $form.find('label'),
    showFiles = function(files) {
      $label.text(files.length > 1 ? ($input.attr('data-multiple-caption') || '').replace( '{count}', files.length ) : files[ 0 ].name);
    };

$form.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
  e.preventDefault();
  e.stopPropagation();
})
  .on('dragover dragenter', function () {
    $form.addClass('is-dragover');
  })
  .on('dragleave dragend drop', function () {
    $form.removeClass('is-dragover');
  })
  .on('drop', function (e) {
    console.log("drop")
    droppedFiles = e.originalEvent.dataTransfer.files;
    $form.submit()
  });

$form.on('submit', function (e) {
  console.log("submit");
  e.preventDefault();

  console.log("not uploading")

  $form.addClass('is-uploading').removeClass('is-error');

  var ajaxData = new FormData($form.get(0));

  if (droppedFiles) {
    $.each(droppedFiles, function (i, file) {
      ajaxData.append($input.attr('name'), file);
    });
  }

  console.log("lets do some ajax")

  $.ajax({
    url: '/upload/'+window.clientId,
    type: $form.attr('method'),
    data: ajaxData,
    dataType: 'json',
    cache: false,
    contentType: false,
    processData: false,
    complete: function () {
      $form.removeClass('is-uploading');
    },
    success: function (data) {
      $form.addClass(data.success == true ? 'is-success' : 'is-error');
      if (!data.success) $errorMsg.text(data.error);
    },
    error: function () {
      // Log the error, show an alert, whatever works for you
    }
  });
});
