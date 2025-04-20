    function encryptText() {
      var text = document.getElementById("text").value;
      var keyword = document.getElementById("keyword").value;
      var encrypted = encryptWithKeywordCipher(text, keyword);
      document.getElementById("result").value = encrypted;
    }

    function decryptText() {
      var encrypted = document.getElementById("text").value;
      var keyword = document.getElementById("keyword").value;
      var decrypted = decryptWithKeywordCipher(encrypted, keyword);
      document.getElementById("result").value = decrypted;
    }

    function encryptWithKeywordCipher(text, keyword) {
      var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
      var cipher = "";
      var key = "";

      // Remove repeated letters from keyword
      for (var i = 0; i < keyword.length; i++) {
        if (key.indexOf(keyword.charAt(i)) == -1) {
          key += keyword.charAt(i);
        }
      }

      // Generate cipher alphabet
      for (var i = 0; i < key.length; i++) {
        if (cipher.indexOf(key.charAt(i)) == -1) {
          cipher += key.charAt(i);
        }
      }

      for (var i = 0; i < alphabet.length; i++) {
        if (cipher.indexOf(alphabet.charAt(i)) == -1) {
          cipher += alphabet.charAt(i);
        }
      }

      // Encrypt text
      var encrypted = "";

      for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);

        if (c >= 'a' && c <= 'z') {
          encrypted += cipher.charAt(alphabet.indexOf(c));
        } else if (c >= 'A' && c <= 'Z') {
          encrypted += cipher.charAt(alphabet.indexOf(c.toLowerCase())).toUpperCase();
        } else if (c >= '0' && c <= '9') {
          encrypted += cipher.charAt(alphabet.indexOf(c));
        } else {
          encrypted += c;
        }
      }

      return encrypted;
    }

    function decryptWithKeywordCipher(encrypted, keyword) {
      var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
      var cipher = "";
      var key = "";

      // Remove repeated letters from keyword
      for (var i = 0; i < keyword.length; i++) {
        if (key.indexOf(keyword.charAt(i)) == -1) {
          key += keyword.charAt(i);
        }
      }

      // Generate cipher alphabet
      for (var i = 0; i < key.length; i++) {
        if (cipher.indexOf(key.charAt(i)) == -1) {
          cipher += key.charAt(i);
        }
      }

      for (var i = 0; i < alphabet.length; i++) {
        if (cipher.indexOf(alphabet.charAt(i)) == -1) {
          cipher += alphabet.charAt(i);
        }
      }

      // Decrypt text
      var decrypted = "";

      for (var i = 0; i < encrypted.length; i++) {
        var c = encrypted.charAt(i);

        if (c >= 'a' && c <= 'z') {
          decrypted += alphabet.charAt(cipher.indexOf(c));
        } else if (c >= 'A' && c <= 'Z') {
          decrypted += alphabet.charAt(cipher.indexOf(c.toLowerCase())).toUpperCase();
        } else if (c >= '0' && c <= '9') {
          decrypted += alphabet.charAt(cipher.indexOf(c));
        } else {
          decrypted += c;
        }
      }

      return decrypted;
    }
