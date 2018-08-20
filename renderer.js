// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

$.fn.press = function() { //Submit function

  $(".metadata").html(""); //resets metadata

  if($('#isbnmode').is(':checked')) { //function for isbn input
    var isbn = $('#input').val().replace(/\s/g, '');
    check = false
    apcallisbn(isbn, check);
    $("#amazon").load("templates/amazon.html");
    $('#input').select(); }

  if($('#oclcmode').is(':checked')) { //function for oclc input
    var oclc = $('#input').val().replace(/\s/g, '');
    check = true
    apcalloclc(oclc, check);
    $("#amazon").load("templates/amazon.html");
    $('#input').select(); }
};

$("#subbutton").click(function() { //Clicking "Sub" button counts as submit
  $("#subtutton").press();
});

$(document).keypress(function(e) { //Pressing "enter" key counts as submit
    if(e.which == 13) {
      if ($('#input').is(':focus') || $('#cost').is(':focus')) {
        $("#subtutton").press();
      }
    }
});

function apcalloclc(oclc, check){ //Picking out information given OCLC input
  var request = require('request');
  var url = 'http://www.worldcat.org/webservices/catalog/content/' + oclc;
  var queryParams = '?servicelevel=full&' +  encodeURIComponent('wskey') + '=' + encodeURIComponent('uwpGfFREPIyE38NK4wmJATF53xA1E2qMbIM2ksm1ZPfxtXGVWEccdDb8qb1oqjF2rC85WWC4mQpMahuZ');

  request({
      url: url + queryParams,
      method: 'GET'
  },
  function (error, response, body) {

      var parseString = require('xml2js').parseString;
      parseString(body, function (err, result) {
          console.dir(result);

          if(result==undefined || !result.record.hasOwnProperty('datafield')){ //If it screws up

            $("#failureOCLC").css("display", "inline");

          }else{
            fields = result.record.datafield

            for (i = 0; i < fields.length; ++i) {

                if(fields[i].$.tag == 20){ //tag 20 encodes isbn number
                  var isbn = fields[i].subfield[0]._
                  if(isbn.length == 13 && check == true){
                    apcallisbn(isbn, check);
                  }
                }

                if(fields[i].$.tag == 100){ //tag 100 encodes author
                  var Author = fields[i].subfield[0]._
                }

                if(fields[i].$.tag == 260){ //tag 260 encodes Publisher / Publication Location and Time
                  var PubPlace = fields[i].subfield[0]._
                  var Pub = fields[i].subfield[fields[i].subfield.length - 2]._
                  var PubYear = fields[i].subfield[fields[i].subfield.length - 1]._
                }

                if(fields[i].$.tag == 264 && fields[i].$.ind2 == 1){ //tag 264 encodes Publisher / Publication Location and Time
                  var PubPlace = fields[i].subfield[0]._
                  var Pub = fields[i].subfield[1]._
                  var PubYear = fields[i].subfield[2]._
                }

                if(fields[i].$.tag == 776 && fields[i].$.ind2 == 8){ //Tag 776 encodes Material and Publisher
                  var Material = fields[i].subfield[0]._
                  var Pub = fields[i].subfield[3]._
                }

                localStorage.setItem("oclc", oclc); //Locally store all the important stuff
                localStorage.setItem("Material", Material);
                localStorage.setItem("PubPlace", PubPlace);
                localStorage.setItem("Pub", Pub);
                localStorage.setItem("PubYear", PubYear);
            }
          }

          if(check == false){
            mother();
          }

      });
  });
}

function apcallisbn(isbn, check){ //Picking out information given ISBN input

  var request = require('request');
  var url = 'http://www.worldcat.org/webservices/catalog/search/worldcat/opensearch?q=' + isbn;
  var queryParams = '&' +  encodeURIComponent('wskey') + '=' + encodeURIComponent('uwpGfFREPIyE38NK4wmJATF53xA1E2qMbIM2ksm1ZPfxtXGVWEccdDb8qb1oqjF2rC85WWC4mQpMahuZ');

  request({
      url: url + queryParams,
      method: 'GET'
  },
  function (error, response, body) {

      var parseString = require('xml2js').parseString;
      parseString(body, function (err, result) {
          console.dir(result);  //log the info

        if(result==undefined || !result.feed.hasOwnProperty('entry')){ //If it screws up

          $("#failureISBN").css("display", "inline");

        }else{

          fields = result.feed.entry[result.feed.entry.length - 1]

          if(check == false){
            oclc = fields['oclcterms:recordIdentifier'][0] //Get the OCLC Number
              apcalloclc(oclc, check); }

          Title = result.feed.entry[0].title[0] //Get the title
          $("#Title").html("<b>Title: </b>" + Title);

          Author = fields.author[0].name[0] //Get the Author
          link = fields.link[0].$.href //Get a link to worldcat (for additional info)

          localStorage.setItem("isbn", isbn);
          localStorage.setItem("Title", Title);
          localStorage.setItem("Author", Author);
          localStorage.setItem("link", link);

          }

          if(check == true){
            mother();
          }

      });
  });
}

function mother(){ //Sets up JSON string

var almastring =
    {
      "owner": {
        "value": "Watzek"
      },
      "type": {
        "value": "PRINTED_BOOK_OT"
      },
      "vendor": {
        "value": "wamaz"
      },
      "rush": false,
      "price": {
        "sum": $("#cost").val(),
        "currency": {
          "value": "USD"
        }
      },
      "url": localStorage.getItem("link"),
      "vendor_account": "wamaz",
      "vendor_reference_number": "",
      "po_number": "",
      "invoice_reference": "",
      "resource_metadata": {
        "title": localStorage.getItem("Title"),
        "author": localStorage.getItem("Author"),
        "issn": null,
        "isbn": localStorage.getItem("isbn"),
        "publisher": localStorage.getItem("Pub"),
        "publication_place": localStorage.getItem("PubPlace"),
        "publication_year": localStorage.getItem("PubYear"),
        "vendor_title_number": ""
      },
      "reporting_code": "BOOK",
      "base_status": "",
      "access_provider": "",
      "material_type": {
        "value": "BOOK"
      },
      "fund_distribution": [
      {
        "fund_code": {
          "value": $("#fundcode").val(),
        },
        "amount":{
            "sum": $("#cost").val(),
            "currency": {
              "value": "USD"
            }
          }
      }
    ],
  };
  console.dir(almastring);

  var almastring2 = JSON.stringify(almastring);
  $("#almajson").html("<b>JSON String: </b>" + almastring2);

  genesis(almastring2);

  console.log(localStorage.getItem("Title"));
}

function genesis(x){ //Sends JSON string to alma
  var request = require('request');
  var url = 'https://api-eu.hosted.exlibrisgroup.com/almaws/v1/acq/po-lines';
  var queryParams = '?' +  encodeURIComponent('apikey') + '=' + encodeURIComponent('l7xxd4db206386cc41ddb45583cb2336aee6');
  request({
      url: url + queryParams,
      body: x,
      headers: { 'Content-Type':'application/json'  },
      method: 'POST'
  }, function (error, response, body) {
      console.log('Reponse received', body);
  });
}
