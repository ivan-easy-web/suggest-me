const musicIntersts = [];
var playlist = [];
var lastSearch;

musicIntersts.add = function(trackId) {
  for (let track of musicIntersts) {
    if (track.trackId == trackId){
      return;
    }
  }
  for (let track of lastSearch.results) {
    if (track.trackId == trackId) {
      musicIntersts.push(track);
      let text = `${track.trackName} - ${track.artistName}`;
      ($(`<li class="list-group-item d-flex justify-content-between align-items-center" trackId="${track.trackId}">${text}<span class="badge-remove badge badge-outline-dark badge-pill">- remove</span></li>`))
      .appendTo($('#interests-list'));
    }
  }
}

$('body').on('click', '.badge-remove', function() {
  musicIntersts.remove($(this).parent().attr('trackId'));
  $(this).parent().remove();
})

musicIntersts.remove = function(trackId) {
  for( var i = 0; i < musicIntersts.length; i++){ 
    if ( musicIntersts[i].trackId == trackId) { 
      musicIntersts.splice(i, 1);
    }
  }
}

musicIntersts.handle = function() {
  if (musicIntersts.length < 5) {
    notify('Warning.', 'Interest list must contain at least 5 elements.');
  } else {
    displayGetPlaylistWaitingAnimation();
    let IdList = [];
    for (let track of musicIntersts) {
      if (!IdList.includes(track.artistId)) {
        IdList.push(track.artistId);
      }
    }
    let limit = 50 / IdList.length;
    let url = `https://itunes.apple.com/lookup?id=${IdList}&entity=song&limit=${limit}&callback=initializePlaylist`;
    $(`<script src="${url}"/>`).appendTo('#scripts');
  }
}

function displayGetPlaylistWaitingAnimation() {
  $('#getPlaylistBtn').append($(`<div class="spinner-grow" role="status"><span class="sr-only">Loading...</span></div>`));
}


function initializePlaylist(response) {
  stopGetPlaylistWaitingAnimation();
  if (response.resultCount > 0) {
    $('#help-text-1').css('display', 'none');
    for (let result of response.results) {
      if (result.wrapperType == 'track'){
        playlist.push(result);
      }
    }
    playlist = shuffle(playlist);
    for (let track of playlist) {
      let text = `${track.trackName} - ${track.artistName}`;
        $(`<li class="list-group-item d-flex justify-content-between align-items-center" trackId="${track.trackId}">${text}<span class="badge badge-outline-dark badge-pill">Play</span></li>`)
        .appendTo('#playlist');
    }
    $('#myTab a[href="#playlist-page"]').tab('show')
  }
}


function stopGetPlaylistWaitingAnimation() {
  $('#getPlaylistBtn').empty();
  $('#getPlaylistBtn').text('Get Playlist ');
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

musicIntersts.clear = function() {
  musicIntersts.length = 0;
}





$('#searchField').keyup(function(event) {
  if (event.which == 13) {
    $('#searchButton').click();
  }
});

$('#searchButton').click(function() {
  let text = $('#searchField').val();
  let url = `https://itunes.apple.com/search?media=music&term=${text}&callback=initializeSuggestionsList`;
  displaySuggestionsWaitingAnimation();
  $(`<script src="${url}"/>`).appendTo('#scripts');
})

function displaySuggestionsWaitingAnimation() {
  let suggestionsList = $('#suggestions-list');
  suggestionsList.empty();
  for (let i = 0; i < 50; i++) {
    $(`<li class="list-group-item d-flex justify-content-between align-items-center"">Loading...</li>`)
    .appendTo(suggestionsList);
  }
}

function initializeSuggestionsList(response) {
  lastSearch = response;
  let suggestionsList = $('#suggestions-list');
  suggestionsList.empty();
  if (response.resultCount > 0) {
    for (let result of response.results) {
      let text = `${result.trackName} - ${result.artistName}`;
      $(`<li class="list-group-item d-flex justify-content-between align-items-center" trackId="${result.trackId}">${text}<span class="badge-add badge badge-outline-dark badge-pill">+ add</span></li>`)
      .click( function() {
        $(this).css('cursor', 'default').children().removeClass('badge-add').addClass('badge-added').text('added');
        musicIntersts.add($(this).attr('trackId'));
        $('#help-text').css('display','none');
      }).appendTo(suggestionsList);
    }
  } else {
    $(`<li class="list-group-item d-flex justify-content-between align-items-center"">Not found.</li>`)
    .appendTo(suggestionsList);
  }
}


$('#getPlaylistBtn').click(function () {
  musicIntersts.handle();
});


function notify(title,content) {
  $('#modalTitle').text(title);
  $('#modalContent').text(content);
  $('#modal').modal('show');
}