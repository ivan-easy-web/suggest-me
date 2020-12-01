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
      $('#interests-list').append(createListPlayableItem(track, true).append($(`
          <span class="badge-remove badge badge-outline-dark badge-pill">
            - remove
          </span>`)
        )
      );
    }
  }
}

function createListPlayableItem(track, fromInterests) {
  let li = $(`<li class="list-group-item list-item-track d-flex justify-content-between align-items-center" trackId="${track.trackId}""></li>`);
  li.append($(`
    <span class="playButton" style="background: url(${track.artworkUrl60})">
      <svg width="40px" height="40px" viewBox="0 0 16 16" class="bi bi-play" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/></svg>
    </span>`).click(function(){
      let trackId = $(this).parent().attr('trackId');
      for (let track of (fromInterests)? musicIntersts: playlist) {
        if (track.trackId == trackId) {
          player.play(track);
          return;
        }
      }
    }));
  li.append($(`<span class="track-text">${track.trackName} - ${track.artistName}</span>`));
  return li;
}

$('body').on('click', '.playButton', function() {
  
  
})

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
      $('#playlist').append(createListPlayableItem(track,false).append($(`
        <span class="badge badge-outline-dark badge-pill">
          <a target="_blank" href = ${track.trackViewUrl}>
            View on Itunes
          </a>
        </span>`)
        )
      );
    }
    $('#myTab a[href="#playlist-page"]').tab('show');
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

$('#getStartedBtn').click(function() {
  $('#myTab a[href="#my-musicologist-page"]').tab('show')
})


function notify(title,content) {
  $('#modalTitle').text(title);
  $('#modalContent').text(content);
  $('#modal').modal('show');
}

let player = {
  onPlay: false,
  currentTrack: null,
  play: function(track) {
    $('#stopBtn').css('display', 'block');
    if (this.onPlay) {
      this.currentTrack.pause();
    }
    this.currentTrack = new Audio(track.previewUrl);
    $('#name-line').append($(`<span>${track.trackName} - ${track.artistName}</span>`))
    this.currentTrack.play();
    this.onPlay = true;
    this.currentTrack.addEventListener('ended', function() {
      $('#stopBtn').css('display', 'none');
    });
  }
}

$('#stopBtn').click(function() {
  player.currentTrack.pause();
  $('#stopBtn').css('display', 'none');
})