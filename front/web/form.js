var $form = $('.box');
$form.addClass('has-advanced-upload');

var dataTransfer = false;

var $input = $form.find('input[type="file"]');

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
    dataTransfer = e.originalEvent.dataTransfer;
    console.log(e.originalEvent)
    $form.submit()
  });

$form.on('submit', function (e) {
  console.log("submit");
  e.preventDefault();

  $form.addClass('is-uploading').removeClass('is-error');

  var ajaxData = new FormData($form.get(0));

  if (dataTransfer) {
    $.each(dataTransfer.files, function (i, file) {
      ajaxData.append($input.attr('name'), file);
      console.log(file)
    });
  }
  var file = dataTransfer.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    window.app.$refs.original.setAudioSource(e.target.result)
  }
  reader.readAsDataURL(file);

  $.ajax({
    url: '/upload/' + window.clientId,
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
      window.app.$refs.stepper.goToStep("denoise")
      $form.addClass(data.success == true ? 'is-success' : 'is-error');
      window.ref = data.ref;
    },
    error: function () {
      // Log the error, show an alert, whatever works for you
    }
  });
});
