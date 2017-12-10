
// Scrape news
$(document).on("click", "#news", function () {
  $("#welcome").hide()
  $.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
    
      $("#articles").append("<h3 data-id='" + data[i]._id + "'>" + data[i].title + "</h3>" + "<p>" + data[i].link + "</p>" + "<button class='btn-info' id='addNote' data-id='" + data[i]._id + "'>" + "Add a note" + "</button>" + "<hr>" + "<br>");
    }
  });
})

// add note
$(document).on("click", "#addNote", function() {
  $("#notes").empty();
  $("displayNote").show("slow")
  var thisId = $(this).attr("data-id");


  // ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
  
    .done(function(data) {
      console.log(data);
      $("#notes").append("<h5>" + data.title + "</h5>");
      $("#notes").append("<input id='titleinput' name='title' placeholder='Title'>"+"<br>");
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Add your note here'></textarea>"+"<br>");
      $("#notes").append("<button data-id='" + data._id + "' id='savenote' class='btn-outline-info'>Save Note</button>");

    
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

// save notes and display notes below
$(document).on("click", "#savenote", function() {


  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    // url: "/articles/" + thisId,
    url: "/submit" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val(),
      created: Date.now()
    }
  })
    .done(function(data) {

      console.log(data);
      $("#displayNote").prepend("<p class='dataentry' data-id=" + data._id + "><span class='dataTitle' data-id=" +
      data._id + ">" + data.title + "</span><span class=deleter>X</span></p>");
      $("#notes").empty();
      $("#titleinput").val("");
      $("#bodyinput").val("");
    });
 
});
