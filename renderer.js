// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

$(document).ready(function() { //Sets max length to 13, 8
  if($('#isbnmode').is(':checked')) {
    $('#input').attr('maxlength','13'); }
  if($('#oclcmode').is(':checked')) {
    $('#input').attr('maxlength','10'); }
});

$.fn.press = function() { //Submit function

  $(".metadata").html("");

  if($('#isbnmode').is(':checked')) {
    var isbn = $('#input').val().replace(/\s/g, '');
    check = false
    apcallisbn(isbn, check);
    $("#amazon").load("templates/amazon.html");
    $('#input').select(); }

  if($('#oclcmode').is(':checked')) {
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
      if ($('#input').is(':focus')) {
        $("#subtutton").press();
      }
    }
});

function apcalloclc(oclc, check){ //All the crap submit does for an OCLC input
  var request = require('request');
  var url = 'http://www.worldcat.org/webservices/catalog/content/' + oclc;
  var queryParams = '?servicelevel=full&' +  encodeURIComponent('wskey') + '=' + encodeURIComponent('uwpGfFREPIyE38NK4wmJATF53xA1E2qMbIM2ksm1ZPfxtXGVWEccdDb8qb1oqjF2rC85WWC4mQpMahuZ');

  request({
      url: url + queryParams,
      method: 'GET'
  },
  function (error, response, body) {
      //console.log(body);

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
                    apcallisbn(isbn, check); }

                  if(fields[i].subfield.length > 1){ //tag 20 also has a chance of encoding material type
                    var Material = fields[i].subfield[1]._
                    $("#Material").html("<b>Material Type: </b>" + Material); } }


                if(fields[i].$.tag == 100){ //tag 100 encodes author
                  var Author = fields[i].subfield[0]._
                  $("#Author").html("<b>Author: </b>" + Author); }

/*                if(fields[i].$.tag == 245){ //tag 245 encodes title
                  var Title = fields[i].subfield[0]._
                  $("#Title").html("<b>Title: </b>" + Title); }
*/

                  $("#oclc").html("<b>OCLC: </b>" + oclc); //sending oclc to amazon.html

                  $("#link").html("<b>Additional Information: </b>" + 'http://worldcat.org/oclc/' + oclc); //encoding link to worldcat (given oclc)


                if(fields[i].$.tag == 260){ //tag 260 encodes Publisher / Publication Location and Time
                  var PubPlace = fields[i].subfield[0]._
                  $("#PubPlace").html("<b>Publication Location: </b>" + PubPlace);

                  var Pub = fields[i].subfield[fields[i].subfield.length - 2]._
                  $("#Pub").html("<b>Publisher: </b>" + Pub);

                  var PubYear = fields[i].subfield[fields[i].subfield.length - 1]._
                  $("#PubYear").html("<b>Publication Year: </b>" + PubYear); }


                if(fields[i].$.tag == 264 && fields[i].$.ind2 == 1){ //tag 264 encodes Publisher / Publication Location and Time
                  var PubPlace = fields[i].subfield[0]._
                  $("#PubPlace").html("<b>Publication Location: </b>" + PubPlace);

                  var Pub = fields[i].subfield[1]._
                  $("#Pub").html("<b>Publisher: </b>" + Pub);

                  var PubYear = fields[i].subfield[2]._
                  $("#PubYear").html("<b>Publication Year: </b>" + PubYear); }


                if(fields[i].$.tag == 776 && fields[i].$.ind2 == 8){ //Tag 776 encodes Material and Publisher
                  var Material = fields[i].subfield[0]._
                  $("#Material").html("<b>Material Type: </b>" + Material);

                  var Pub = fields[i].subfield[3]._
                  $("#Pub").html("<b>Publisher: </b>" + Pub); }


                if(fields[i].$.tag == 655){ //Tag 665 has a chance of encoding Material
                  var Material2 = fields[i].subfield[0]._
                  $("#Material2").html("<b>Second Material Type: </b>" + Material2); }


                if(fields[i].$.tag == 588){ //Tag 588 has a chance of encoding Material
                  var Material = fields[i].subfield[0]._
                  $("#Material").html("<b>Material Type: </b>" + Material); }

                localStorage.setItem("oclc", oclc);
                localStorage.setItem("Material", Material);
                localStorage.setItem("Material2", Material2);
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

function apcallisbn(isbn, check){ //All the crap submit does for an ISBN input

  var request = require('request');
  var url = 'http://www.worldcat.org/webservices/catalog/search/worldcat/opensearch?q=' + isbn;
  var queryParams = '&' +  encodeURIComponent('wskey') + '=' + encodeURIComponent('uwpGfFREPIyE38NK4wmJATF53xA1E2qMbIM2ksm1ZPfxtXGVWEccdDb8qb1oqjF2rC85WWC4mQpMahuZ');

  request({
      url: url + queryParams,
      method: 'GET'
  },
  function (error, response, body) {
      //console.log(body);

      var parseString = require('xml2js').parseString;
      parseString(body, function (err, result) {
          console.dir(result);  //Object > feed: > entry: Array(#) > blah

        if(result==undefined || !result.feed.hasOwnProperty('entry')){ //If it screws up
          $("#failureISBN").css("display", "inline");
        }else{
          fields = result.feed.entry[result.feed.entry.length - 1]


          if(check == false){
            oclc = fields['oclcterms:recordIdentifier'][0] //Get the OCLC Number
              $("#oclc").html("<b>OCLC: </b>" + oclc);
              apcalloclc(oclc, check); }


          Title = result.feed.entry[0].title[0] //Get the title
            $("#Title").html("<b>Title: </b>" + Title);


          Title2 = fields.title[0] //Sometimes titles are different for different versions
            if(Title != Title2){
              $("#Title2").html("<b>Second Title: </b>" + Title2); }


          Author = fields.author[0].name[0] //Get the Author
            $("#Author").html("<b>Author: </b>" + Author);

            $("#isbbn").html("<b>ISBN: </b>" + isbn); //Print out the ISBN


          link = fields.link[0].$.href //Get a link to worldcat (for additional info)
            $("#link").html("<b>Additional Information: </b>" + link);

          localStorage.setItem("isbn", isbn);
          localStorage.setItem("Title", Title);
          localStorage.setItem("Title2", Title2);
          localStorage.setItem("Author", Author);
          localStorage.setItem("link", link);

          }

          if(check == true){
            mother();
          }

      });
  });
}

function mother(){
  information = createjson();
  var jsonString = JSON.stringify(information);
  console.dir(JSON.parse(jsonString));
  console.log(information.title);
}

/*{
  "owner": {
    "value": "MAIN"
  },
  "type": {
    "value": "PRINT_OT"
  },
  "vendor": {
    "value": "MVEN"
  },
  "rush": false,
  "price": {
    "sum": "150.0",
    "currency": {
      "value": "USD"
    }
  },
  "url": "",
  "vendor_account": "MVEN",
  "vendor_reference_number": "",
  "po_number": "",
  "invoice_reference": "",
  "resource_metadata": {
    "title": "The last love.",
    "author": "",
    "issn": null,
    "isbn": "1234AA",
    "publisher": "",
    "publication_place": "",
    "publication_year": "",
    "vendor_title_number": ""
  },
  "reporting_code": "",
  "base_status": "",
  "access_provider": "",
  "material_type": {
    "value": "BOOK"
  },
  "fund_distribution": []
} */

function createjson(){

  var information = new Object();
    information.title = localStorage.getItem("Title");
    information.title2 = localStorage.getItem("Title2");
    information.author  = localStorage.getItem("Author");
    information.oclc = localStorage.getItem("oclc");
    information.isbn = localStorage.getItem("isbn");
    information.publisher = localStorage.getItem("Pub");
    information.pubplace = localStorage.getItem("PubPlace");
    information.pubyear = localStorage.getItem("PubYear");
    information.material = localStorage.getItem("Material");
    information.material2 = localStorage.getItem("Material2");
    information.link = localStorage.getItem("link");
  return(information);
}
