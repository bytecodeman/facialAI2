import validated from "./validatesingleton.js";

$(function () {
  grecaptcha.ready(function () {
    grecaptcha
      .execute("6LdWKUMaAAAAAF8zS_5ima4fp7rtuDz19s2tdvEU", {
        action: "facialai",
      })
      .then(function (token) {
        $("#recaptchaResponse").val(token);
      });
  });

  $("#recaptchacheck").submit(function (event) {
    event.preventDefault();
    if (validated.get()) {
      return false;
    }
    $.ajax({
      url: "verifyperson.php",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
    })
      .done(function (response) {
        const { status, message } = response;
        if (status) {
          validated.set(true);
          $("#alert").addClass("d-none").text("");
        } else {
          $("#alert").removeClass("d-none").text(message);
        }
      })
      .fail(function (jqXhr, json, errorThrown) {
        $("#alert").removeClass("d-none").text(jqXhr.responseText);
      });
  });
});
