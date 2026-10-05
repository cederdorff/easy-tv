/**
 * functions.js
 * by Rasmus Cederdorff
 */
/*jslint browser: true*/
/*global $, jQuery, alert*/
var cities = [];
var channels = [];
var packages = [];
var selectedChannels = [];
var selectedCity = "";

/*
 * Når DOM'en er loaded udføres loadCities(), loadChannels();
 * og loadPackages(), der alle trækker data ud fra json-filer.
 * Der added også en clickevent til #selectedCityBtn
 */
$(document).ready(function () {
  loadCities();
  loadChannels();
  loadPackages();

  $("#selectedCityBtn").click(clearCity);
});

/*
 * Når browser resizes appendes kanalerne på ny afhængig af browserens width (se calculateLimit())
 * Sikre at oversigten hele tiden stemmer over ens og alle "rækker" af knapper har samme antal
 */
$(window).resize(function () {
  $("#danskeKanalerBtns").html("");
  $("#udenlandskeKanalerBtns").html("");
  appendChannels();
});

/**
 * Loader byer og deres postnummer fra json-fil og
 * pusher til listen cities
 */
function loadCities() {
  $.getJSON("json/postnumre.json", function (data) {
    $.each(data.postnumre, function (i, value) {
      cities.push(value.nr + " " + value.navn);
    });
    setupCityAutocomplete();
  });
}

/**
 * Loader kanaler fra json-fil og
 * pusher til listen channels
 */
function loadChannels() {
  $.getJSON("json/kanaler.json", function (data) {
    $.each(data.kanaler, function (i, value) {
      kanal = {
        navn: value.navn,
        id: value.id,
        value: value.navn, //skal bruge value til autocomplete
        icon: value.icon,
        hd: value.hd,
        sprog: value.sprog,
        beskrivelse: value.beskrivelse
      }
      channels.push(kanal);
    });
    setupChannelAutocomplete();
    appendChannels();
  });
}

/**
 * Loader pakker fra json-fil og
 * pusher til listen packages
 */
function loadPackages() {
  $.getJSON("json/pakker.json", function (data) {
    $.each(data.pakker, function (i, value) {
      package = {
        navn: value.udbyder,
        id: value.id,
        icon: value.icon,
        pakkenavn: value.pakkenavn,
        prisPrMd: value.prisPrMd,
        mindstepris: value.mindstepris,
        bredbaand: value.bredbaand,
        kanaler: value.kanaler
      }
      packages.push(package);
    });
    appendPackages(packages);
  });
}

/**
 * Sætter autocomplete for #city (inputfelt)
 */
function setupCityAutocomplete() {
  $("#city").autocomplete({
    minLength: 3,
    source: cities,
    select: function (event, ui) {
      selectedCity = ui.item.value;
      $("#selectedCity").text(ui.item.value);
      $("#selectedCityBtn").prop("disabled", false);
      $.bootstrapGrowl("<b>" + ui.item.value + "</b> tilføjet som by til din søgning. <br>Gå til <a href='#tableJumbotron'>søgeresultat</a>", {
        type: 'info',
        offset: {
          from: 'bottom',
          amount: 20
        },
        delay: 5000,
        allow_dismiss: false,
      });
    }
  });
}

/**
 * Sætter autocomplete for #channelSearchInput (inputfelt)
 */
function setupChannelAutocomplete() {
  $("#channelSearchInput").autocomplete({
    minLength: 2,
    source: channels,
    focus: function (event, ui) {
      $("#channelSearchInput").val(ui.item.navn);
    },
    select: function (event, ui) {
      $("#channelSearchInput").val(ui.item.navn);
      addSelectedChannel(ui.item);
    }
  }).data("ui-autocomplete")._renderItem = function (ul, item) {
    return $("<li>")
      .append("<a>" + item.navn + "</a>")
      .appendTo(ul);
  };
}

/*
 * Tilføjer en "kanal-knap" til oversigten over alle kanaler for hver kanal der findes i channels.
 */
function appendChannels() {
  var danishChannels = 1;
  var foreignChannels = 1;
  for (i = 0; i < channels.length; i++) {
    var currentChannel = channels[i];
    var limit = calculateLimit();

    if (currentChannel.sprog == "dansk" && danishChannels <= limit) {
      $("#danskeKanalerBtns").append('<button id="' + currentChannel.navn + '" type="button" class="btn btn-default">' +
        '<img src="' + currentChannel.icon + '" class="img-responsive">' +
        '</button>');
      danishChannels = danishChannels + 1;
    } else if (currentChannel.sprog == "udenlandsk" && foreignChannels <= limit) {
      $("#udenlandskeKanalerBtns").append('<button id="' + currentChannel.navn + '" type="button" class="btn btn-default">' +
        '<img src="' + currentChannel.icon + '" class="img-responsive">' +
        '</button>');
      foreignChannels = foreignChannels + 1;
    }
  }
  $("#kanaler button").click(channelButtonClicked);
}

/*
 * Tilføjer en række i tv-pakke-tabellen for hver tv-pakke der er i packages
 */
function appendPackages(pakagesToShow) {
  $("#tvpakketablebody").html("");
  for (i = 0; i < pakagesToShow.length; i++) {
    var package = pakagesToShow[i];
    $("#tvpakketablebody").append('<tr id ="' + package.id + '" data-toggle="collapse" data-target="#more_' + package.id + '">' +
      '<td class="text-center"><img src="' + package.icon + '" alt="' + package.navn + '"></td>' +
      '<td class="hidden-xs">' + package.pakkenavn + '</td>' +
      '<td class="hidden-xs">' + package.kanaler.length + '</td>' +
      '<td class="hidden-xs">' + package.bredbaand + '</td>' +
      '<td>' + package.prisPrMd + ' kr.</td>' +
      '<td class="hidden-xxs">' + package.mindstepris + ' kr.</td></tr>' +
      '<tr> <td colspan="6" class="hiddenRow"><div class="collapse" id="more_' + package.id + '">Mere info</div></td></tr>');
  }
}

/*
 * Sætter begrænsing for antallet af kanaler der skal hentes, afhængig af browser width
 */
function calculateLimit() {
  var limit = 9;
  if (window.matchMedia("(min-width: 480px)").matches) {
    limit = 12;
  }
  if (window.matchMedia("(min-width: 590px)").matches) {
    limit = 15;
  }
  if (window.matchMedia("(min-width: 692px)").matches) {
    limit = 18;
  }
  if (window.matchMedia("(min-width: 992px)").matches) {
    limit = 20;
  }
  return limit;
}

/*
 * Sætter #selectedCity til "Intet valgt" og disabler
 * knappen
 */
function clearCity() {
  $("#selectedCity").text("Intet valgt");
  $("#selectedCityBtn").prop("disabled", true);
  $("#city").val("");
}

/*
 * Event der kaldes, når der klikkes på en "kanal-knap" i oversigten over kanaler. Der kaldes addSelectedChannel(...) med den givne kanal
 */
function channelButtonClicked() {
  var channel = getChannel(this.id);
  addSelectedChannel(channel);
}

/*
 * Tilføjer kanal til selectedChannels. Det kan kun ske hvis selectedChannels ikke allerede består af 5 kanaler og hvis det givne kanal ikke allerede findes i selectedChannels. Hvis kanalen tilføjes gives besked til brugeren.
 */
function addSelectedChannel(channel) {
  if (selectedChannels.length >= 5) {
    $.bootstrapGrowl("Du kan højest vælge 5 kanaler, som du ønsker i din tv-pakke", {
      type: 'warning',
      offset: {
        from: 'bottom',
        amount: 20
      },
      delay: 5000,
      allow_dismiss: false
    });
  } else if (selectedChannelsContainsOf(channel.navn)) {
    $.bootstrapGrowl("Du har allerede valgt " + channel.navn, {
      type: 'warning',
      offset: {
        from: 'bottom',
        amount: 20
      },
      delay: 5000,
      allow_dismiss: false
    });
  } else if (selectedChannels.length < 5) {
    selectedChannels.push(channel);
    appendSelectedChannel(channel);
    $.bootstrapGrowl("<b>" + channel.navn + "</b> tilføjet til din søgning. <br>Gå til <a href='#tableJumbotron'>søgeresultat</a>", {
      type: 'info',
      offset: {
        from: 'bottom',
        amount: 20
      },
      delay: 5000,
      allow_dismiss: false
    });
    filterPackages();
  }
  //Når første elemen tilføjes skal #intetValgtBtn skjules
  if (selectedChannels.length == 1) {
    $("#intetValgtBtn").hide();
  }
}

/*
 * Fjerner kanal fra selectedChannels og fra knappen fra #selectedChannelsBtns
 * Parameter: channel, som er et obejkt
 */
function removeSelectedChannel(channel) {
  var index = selectedChannels.indexOf(channel);
  selectedChannels.splice(index, 1);
  $("#selected_" + channel.id).remove();
  if (selectedChannels.length == 0) {
    $("#intetValgtBtn").show();
  }
  filterPackages();
}

/*
* Tjekker om en kanal findes i selectedChannels og returnerer true hvis dette er sandt. 
Parameter: kanalnavn
*/
function selectedChannelsContainsOf(channelName) {
  found = false;
  var i = 0;
  while (!found && i < selectedChannels.length) {
    if (selectedChannels[i].navn == channelName) {
      found = true;
    } else {
      i++;
    }
  }
  return found;
}

/*
 * Finder og returnerer kanal udfra kanalnavn
 */
function getChannel(channelName) {
  found = false;
  var i = 0;
  while (!found && i < channels.length) {
    if (channels[i].navn == channelName) {
      found = true;
    } else {
      i++;
    }
  }
  return channels[i];
}

/*
 * Tilføjer "valgt-kanal-knap" til søgeresultatet.
 */
function appendSelectedChannel(channel) {
  $("#selectedChannelsBtns").append('<button type="button" class="btn btn-default btn-xs" id="selected_' + channel.id + '">' +
    '<b>' + channel.navn + '</b>&nbsp; ' +
    '<span class="glyphicon glyphicon-remove"></span>' +
    '</button>');
  $("#selected_" + channel.id).click(function () {
    removeSelectedChannel(channel);
  });
}

/*
 * Filtrer de pakker som skal vises ud fra valgte kanaler (selectedChannels).
 * Tager ikke hensyn til valgt by
 */
function filterPackages() {
  var packagesToShow = [];
  for (i = 0; i < packages.length; i++) { //først gennemløbes alle pakker
    var package = packages[i];
    var packageChannels = packages[i].kanaler;

    var allFound = true;
    for (j = 0; j < selectedChannels.length; j++) { // for hver pakke gennemløbes selectedChannels
      var found = false;
      var z = 0;
      while (!found && z < packageChannels.length) { // for hver kanal i selectedChannels gennemløbes den aktuelle pakkes kanaler og der tjekkes for om kanalen findes i pakken
        if (selectedChannels[j].navn == packageChannels[z]) {
          found = true;
        } else {
          z++;
        }
      }
      if (!found) { // når en selectedChannel ikke fines i en pakkes kanaler, sættes allFound til false
        allFound = false;
      }
    }
    //Findes alle selectedChannels i en pakkes kanaler tilføjes pakken til listen over de pakker der skal vises
    if (allFound) {
      packagesToShow.push(package);
    }
  }
  if (packagesToShow.length == 0) {
    $.bootstrapGrowl("Din søgning gav desværre ingen resultater. Slet senest valgte kanal og prøv igen.", {
      type: 'warning',
      offset: {
        from: 'bottom',
        amount: 20
      },
      delay: 6000,
      allow_dismiss: false
    });
  }
  appendPackages(packagesToShow);
}