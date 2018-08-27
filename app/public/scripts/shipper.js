var apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.sign-in-shipper').click(function() {
  update();
});

function update() {

  //get user input data
  var formShipperId = $('.shipper-id input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"shipperid" : "' + formShipperId + '", ' + '"cardid" : "' + formCardId + '"}';
  console.log(inputData)

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'shipperData',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";
    },
    success: function(data) {

      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {

        //update heading
        $('.heading').html(function() {
          var str = '<h2><b>' + data.name + '</b></h2>';
          str = str + '<h2><b>' + data.shipperId + '</b></h2>';

          return str;
        });

        //remove login section and display member page
        document.getElementById('loginSection').style.display = "none";
        document.getElementById('transactionSection').style.display = "block";
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {

    }
  });
}
