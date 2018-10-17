(function($) {$(function() {
  var uid=0;

  // Find content in a textarea, hide textarea and provide a password input.
  $('textarea.safe-json-encrypted').each(function() {
    var $encryptedField = $(this);
    $encryptedField.hide();
    var id = 'safepass' + (uid++);
    if ($encryptedField.val()) {
      try {
        encryptedData = JSON.parse($encryptedField.val());
      }
      catch (err) {
        console.warn("Failed to parse existing json" ,err.message);
      }
    }
    var $password = $('<div/>');
    var $textarea;
    var $password_field = $('<input type="password" class="form-text"/>')
      .attr('id', id)
      .on('keydown', function(e) {
        if (e.keyCode != 13) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();

        if (this.value != '') {
          $password.hide();
          $loading.text('Attempting decryption').fadeIn();
          $.post('/safe-json/decrypt', {
            encrypted: $encryptedField.val(),
            secret: this.value
          })
          .done(function(result) {
            $textarea
              .attr('rows', Math.max(5, Math.min((result.decrypted + '\n').match(/\n/g).length, 8)))
              .val(result.decrypted);

            $textarea[0].savedValue = result.decrypted;
            $decrypted.fadeIn();
            $textarea.focus();
            $loading.html("&#x1f512; When done editing, press Encrypt, then Save.");
          })
          .fail(function(r, f) {
            var result = JSON.parse(r.responseText);
            $password.fadeIn();
            $loading.hide();
            alert(result.error);
          })
          ;
        }
      });

    var $loading = $('<div/>').hide();
    var $decrypted = $('<div>').hide();
    $password.append(
      $('<label>Enter encryption password to edit</label>').attr('for', id),
      $password_field
    );

    $textarea = $('<textarea />').on('input', function(e) {
        if ($textarea[0].savedValue !== $textarea.val()) {
          $loading.html("&#x26A0; Not encrypted. When done editing, press Encrypt, then Save.");
        }
        else {
          $loading.html("&#x1f512; When done editing, press Encrypt, then Save.");
        }
      });

    var $save_button = $encryptedField.closest('form').find('input[type="submit"][value="Save"]');

    $decrypted.append(
      $textarea,
      $('<button/>')
      .text( $save_button.length ? 'Encrypt then Save' : 'Encrypt')
      .click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        $loading.empty().text('Attempting encryption').fadeIn();
        $decrypted.hide();

        // In future other metadata may be provided here.
        $.post('/safe-json/encrypt', {
          decrypted: $decrypted.find('textarea').val(),
          secret: $password_field.val()
        })
        .done(function(r) {
          $encryptedField.val(JSON.stringify(r.encrypted));
          $loading.html("&#x1f512; Encrypted the data, you can <strong>save this form now</strong> (or make more edits)");
          $textarea[0].savedValue = $textarea.val();
          if ($save_button.length) {
            $save_button.trigger('click');
          }
          $decrypted.fadeIn();
        })
        .fail(function(xhr) {
          try {
            var result = JSON.parse(xhr.responseText);
          }
          catch (e) {
            result = {error: "Unknown error"};
          }
          $decrypted.fadeIn();
          $loading.text("\u26A0 Not saved: " + result.error);
        });
    }));
    $encryptedField.after($password, $loading, $decrypted);
  });
  $('div.safe-field').each(function() {
    // Create label, password field.
    var id = 'safepass' + (uid++);
    const $div = $(this).empty(),
      $results_div = $('<div style="white-space: pre-wrap;"/>'),
      $label = $('<label>&#x1f512; Enter decryption password</label>').attr('for', id),
      $password = $('<input type="password" class="safe-password" />').attr('id', id);

    $password.on('keydown', function(e) {
      if (e.keyCode != 13) {
        return;
      }
      $label.hide();
      $password.hide();
      $results_div.text('Attempting to decrypt...');
      $.post('/safe-json/decrypt', {
        encrypted: $div[0].dataset.safeField,
        secret: this.value
      })
      .done(function(result) {
        $results_div.text(result.decrypted);
      })
      .fail(function(r, f) {
        var result = JSON.parse(r.responseText);
        $label.fadeIn();
        $password.fadeIn();
        $results_div.html('&#x274C; Failed to decrypt: ' + $('<div/>').text(result.error).text());
      });
    });

    $div.append($label, $password, $results_div);

  });



})})(jQuery);
