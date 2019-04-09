$(document).ready(function() {

  $('.count-down').each(function(index, item) {
    var $item = $(item);
    var timeLeft = Number($item.data('time-left'));
    var m = moment().locale('cs').add(timeLeft, 'seconds');
    if (timeLeft > 0) {
      if (timeLeft < (86400 * 8)) {
        $item.html('Odevzdávání bude uzavřeno <strong>' +
          m.fromNow() +
          '</strong>' +
          ' (' + m.format('llll') + ')'
        ).removeClass('d-none').addClass('prob-almost-over')
      }
    } else {
      $item.html('Odevzdávání bylo uzavřeno <strong>' +
        m.fromNow()
      ).removeClass('d-none').addClass('prob-over')
    }
  });
  var editor = ace.edit("editor");
  var $queue = $('.queue');

  editor.setTheme("ace/theme/github");
  editor.session.setMode("ace/mode/java");
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  });

  editor.session.on('change', function() {
    saveCode();
  });
  $('#editor').append('<span class="btn btn-link fullscreen"><i class="fas fa-expand"></i></span>');
  $('#editor .btn.fullscreen').click(function() {
    $('#editor').toggleClass('fullscreen');
    window.dispatchEvent(new Event('resize'))
  });


  var loadLocalStorage = function() {
    var problemID = storageGet('problemID');
    var languageID = storageGet('languageID');
    var key = [problemID, languageID];
    var sourceCode = storageGet(key.concat('sourceCode'));

    if (problemID) {
      $('.prob-select').val(problemID);
    }

    if (languageID) {
      $('.lang-select').val(languageID);
    }

    if (sourceCode) {
      editor.setValue(sourceCode);
    }
  };

  var saveProblemAndLang = function() {
    var problemID = $('.prob-select').val();
    var languageID = $('.lang-select').val();

    storagePut('problemID', problemID);
    storagePut('languageID', languageID);
  };

  var loadProblemAndLang = function() {
    var problemID = storageGet('problemID');
    var languageID = storageGet('languageID');

    if (problemID) {
      $('.prob-select').val(problemID);
      $('.prob-select').trigger('change');
    }

    if (languageID) {
      $('.lang-select').val(languageID);
      $('.prob-select').trigger('change');
    }
  };

  var saveCode = function() {
    var problemID = $('.prob-select').val();
    var languageID = $('.lang-select').val();
    var key = [problemID, languageID];
    var sourceCode = editor.getValue();
    storagePut(key.concat('sourceCode'), sourceCode);
  };

  var loadCode = function() {
    var problemID = storageGet('problemID');
    var languageID = storageGet('languageID');
    var key = [problemID, languageID];
    var sourceCode = storageGet(key.concat('sourceCode'));
    if (sourceCode) {
      editor.setValue(sourceCode);
    }
  };

  $('.lang-select').change(function() {
    var style = $('.lang-select option:checked').data('style');
    editor.session.setMode('ace/mode/' + style);
    saveProblemAndLang();
    loadCode();
  });

  $('.prob-select').change(function() {
    var problemID = $(this).val();
    var problemName = $(this).find('option[value="' + problemID + '"]').data('problem-name');

    var $id = $('#desc-' + problemID);
    $('.prob-desc').addClass('d-none');
    $id.removeClass('d-none');

    var elms = '#editor, form button, .lang-select';
    var timeLeft = Number($id.data('time-left'));
    if (timeLeft > 0) {
      $(elms).css('opacity', '1.0').removeClass('disabled').show('normal');
    } else {
      $(elms).addClass('disabled').css('opacity', '0.5');
    }

    $('.manage-problem-link').attr(
      'href', $('.manage-problem-link').data('href') + $(this).val()
    )
    $('.prolem-name-placeholder').text(problemName);

    saveProblemAndLang();
    loadCode();
  });

  $('form').submit(function(e) {

    var $form = $(this);
    $form.addClass('disabled');
    var $target = $('.solution-result');
    Automatest.setTarget($target);
    $('#solution-result').collapse('show');
    $('#solution-result-heading .btn-link').removeClass('disabled');

    var courseID = $('.prob-select').data('course');
    var problemID = $('.prob-select').val();
    var sourceCode = editor.getValue();
    var languageID = $('.lang-select').val();
    var useDocker = $('.input-use-docker').is(':checked');
    var actionType = 'solve';

    saveProblemAndLang();
    saveCode();

    Automatest.submitSolution(
      courseID, problemID, languageID, sourceCode, actionType, useDocker,
      function(event) {
        $form.removeClass('disabled');
      }
    );
    return false;
  });

  loadProblemAndLang();
  loadCode();
  $('.prob-select').trigger('change');
});