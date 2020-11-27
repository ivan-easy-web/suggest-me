const musicIntersts = [];

musicIntersts.handle = function() {
  
}

musicIntersts.render = function() {
  const $list = $('.info').eq(0);

  $list.empty();

  for (const song of musicIntersts) {
    const $item = $('<li class="list-group-item">').text(info);

    $list.append($item)
  }
}

musicIntersts.clear = function() {
  musicIntersts.length = 0;
}

function get(url) {
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send();
    request.onload(function() {
      if (request.status == 200) {
        resolve(JSON.parse(request.response));
      } else {
        reject(request.statusText);
      }
    })
    request.onerror(function() {
      reject(request.statusText);
    })
  })
}

$('#searchButton').click(function() {
  let text = $('#searchField').text();
  let url = `https://itunes.apple.com/search?media=music&term=${text}`;
  get(url).then(results => {
    for(result of results) {
      text = `Artist name: ${result.artistName}, Song name: ${result.trackName}`;
      $(`<li>${text}</li>`).appendTo('#suggestions-list');
      $('#suggestions-list').style('display', 'block');
    }
  })
})

$('#searchField').keyup(function(event) {
  if (event.which == 13) { // User presses Enter
    $('#searchButton').click();
  }
});

$('#getPlaylistBtn').click(function (event) {

  // todo
});
