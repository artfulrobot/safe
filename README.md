# Safe - Store encrypted text in a Drupal field.

## Installation

The project uses 3rd party libraries for encryption ([Defuse][2]). If you have the
[composer\_manager][1] extension configured then these should be pulled in as part
of your install. Otherwise you'll need to make sure these libraries are
installed yourself.

## Usage

1. Visit `/admin/config/safe` to create a passworded key.  You can revisit that page in future to change your password.

2. Add an encrypted text field to an entity (e.g. a Content Type).

3. When you edit something that uses that field you will see "Enter encryption
   password to edit". Type the password you set in step 1 and hit Enter. If
   your password is correct you should have a textarea to type in.

4. Enter some text. To save you **must** click the *Encrypt and Save* button.
   Saving the form without this will *not* save your changes.

5. When viewing the field, it will appear with an 'enter decryption password'
   input. Type the password you set in step 1 and hit Enter. You should now be
   able to see the data.

## Notes

- Javascript is required for editing/viewing encrypted data.

- The data is encrypted with a random key which itself is stored protected by
  your password. Changing your password means the key is re-protected with the
  new password, but the key itself does not change. Therefore if someone has the
  unprotected key (which is not made accessible by this module, but could be
  stolen by some other malicious module), they would be able to decrypt the data
  regardless of a changed password. To change the master key you would need to
  write code to loop through and re-encrypt everything; this is not part of this
  module.

- The password-protected key is stored as a variable `safe_ascii_protected_key`
  If that is lost there is no way to recover your data(!) Ditto if you lose your
  password.



  [1]: https://www.drupal.org/project/composer_manager
  [2]: https://github.com/defuse/php-encryption
