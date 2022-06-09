<?php
  header('Content-Type: application/json; charset=utf-8');

  function getUserIP() {
    $client  = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote  = $_SERVER['REMOTE_ADDR'];

    if(filter_var($client, FILTER_VALIDATE_IP)) {
        $ip = $client;
    }
    elseif(filter_var($forward, FILTER_VALIDATE_IP)) {
        $ip = $forward;
    }
    else {
        $ip = $remote;
    }
    return $ip;
  }

  //Server side validation
  function isValid() {
    // This is the most basic validation for demo purposes. Replace this with your own server side validation
    if(isset($_POST['recaptchaResponse'])) {
        return true;
    } 
    else {
        return false;
    }
  }
  
  try {
    if(isValid()) {
      // Build POST request to get the reCAPTCHA v3 score from Google
      $recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
      $recaptcha_secret = '6LdWKUMaAAAAAIigp8F3ofZvd1gOBowb3n6Pgoga'; 
      $recaptcha_response = $_POST['recaptchaResponse'];
      // Make the POST request
      //$recaptcha = file_get_contents($recaptcha_url . '?secret=' . $recaptcha_secret . '&response=' . $recaptcha_response);
      $recaptchafile = file_get_contents($recaptcha_url . '?secret=' . $recaptcha_secret . '&response=' . $recaptcha_response . "&remoteip=" .  getUserIP());
      $recaptcha = json_decode($recaptchafile);
      if ($recaptcha->success == true && $recaptcha->score >= 0.5 && $recaptcha->action == 'facialai') {
        $status = true;
        $message = "Success $recaptchafile";
      }
      else {
        $status = false;
        $message = "Recaptcha Test Failed $recaptchafile"; 
      }
    } 
    else {
      $status = false;
      $message = "Recaptcha Token Not Set";
    }
   
    $output = array(
      'status'  =>  $status,
      'message' =>  $message
    );
  }
  catch (RuntimeException $e) {
    $output = array(
      'status'  => false,
      'message' =>  $e
    );
  }  
  
  echo json_encode($output);
?>
