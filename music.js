const musicIntersts = [];
const playlist = [];
var lastSearch;

musicIntersts.add = function(trackId){
  for (let track of musicIntersts) {
    if (track.trackId == trackId){
      return;
    }
  }
  for (let track of lastSearch.results) {
    if (track.trackId == trackId) {
      musicIntersts.push(track);
      let text = `${track.trackName} - ${track.artistName}`;
      ($(`<li class="list-group-item d-flex justify-content-between align-items-center" trackId="${track.trackId}">${text}<span class="badge badge-outline-dark badge-pill">-</span></li>`))
      .appendTo($('#interests-list'));
    }
  };
}

musicIntersts.handle = function() {
  if (musicIntersts.length < 5) {
    // to do 
  } else {
    let IdList = [];
    for (let track of musicIntersts) {
      if (!IdList.includes(track.artistId)) {
        IdList.push(track.artistId);
      }
    }
    let url = `https://itunes.apple.com/lookup?id=${IdList}&entity=song&limit=5&sort=recent&callback=initializePlaylist`;
    $(`<script src="${url}"/>`).appendTo('#scripts');
  }
}

function initializePlaylist(response) {

  if (response.resultCount > 0) {
    for (let result of response.results) {
      if (result.wrapperType == 'track'){
        playlist.push(result);
        let text = `${result.trackName} - ${result.artistName}`;
        $(`<li class="list-group-item d-flex justify-content-between align-items-center" trackId="${result.trackId}">${text}<span class="badge badge-outline-dark badge-pill">Play</span></li>`)
        .appendTo('#playlist');
      }
      
    }
    $('#myTab a[href="#playlist-page"]').tab('show')
  }
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
  $(`<script src="${url}"/>`).appendTo('#scripts');
})

function initializeSuggestionsList(response) {
  lastSearch = response;
  let suggestionsList = $('#suggestions-list');
  suggestionsList.empty();
  if (response.resultCount > 0) {
    for (let result of response.results) {
      let text = `${result.trackName} - ${result.artistName}`;
      $(`<li class="list-group-item d-flex justify-content-between align-items-center" trackId="${result.trackId}">${text}<span class="badge badge-outline-dark badge-pill">+</span></li>`)
      .click( function() {
        musicIntersts.add($(this).attr('trackId'));
      }).appendTo(suggestionsList);
    }
  }
}


$('#getPlaylistBtn').click(function () {
  musicIntersts.handle();
});
