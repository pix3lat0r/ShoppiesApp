//Default text for result-box
var resultBox = document.createElement("b");
var txt = "No results";
var empty = "";
var finalResult = document.createTextNode(txt);
resultBox.appendChild(finalResult);
var subs = document.getElementById("subTitle");
subs.style.visibility = 'hidden';
document.getElementById("results").appendChild(resultBox);

var vb = document.getElementById("result-box");
var nb = document.getElementById("nom-box");
var text = "";
var count = 0;

// Get user input and display it in result-box
(function getResults() {

    var searchBox = document.getElementById('movie');

    //No input -> hide divs
    if (count == 0) {
        vb.style.visibility = "hidden";
        nb.style.visibility = "hidden";
    }

    //SearchBox detects when user hits Enter
    searchBox.addEventListener('keypress', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            count++;
            var text = "";
            var inputs = document.querySelectorAll("input[type=text]");
            for (var i = 0; i < inputs.length; i++) {
                text += inputs[i].value;
            }

            //Change text for result-box
            var resultstxt = "Results for \"";
            var quotes = "\"";
            finalResult.nodeValue = resultstxt + text + quotes;

            //OMDB API vars
            var baseUrl = "https://www.omdbapi.com/?";
            var searchQuery = text;
            var apiKey = "e4161545";
            var searchUrl = baseUrl + 'apikey=' + apiKey;

            //User hits Enter: show result-box
            if (count == 1) {
                var br = document.createElement("br");
                subs.style.visibility = 'visible';
                var sb = "Click movie title to see more info";
                var sbt = document.createTextNode(sb);
                resultBox.appendChild(br);
                document.getElementById("results").appendChild(resultBox);
                subs.appendChild(sbt);

                var nomBox = document.createElement("b");
                var nom = "Nominations";
                var nomResult = document.createTextNode(nom);
                nomBox.appendChild(nomResult);
                document.getElementById("noms").appendChild(nomBox);

                vb.style.visibility = "visible";
            }

            //OMDB API search call
            $.ajax({
                url: searchUrl + '&s=' + encodeURI(searchQuery),
                dataType: "json",
                success: searchMovies
            });
        }
    });
}());

//Vars to keep track of
//nominated and removed movies
var el = 0;
var el2 = 0;
var err = false;

function searchMovies(data) {

    //For debugging purposes
    //console.log(JSON.stringify(data));

    var baseUrl = "https://www.omdbapi.com/?";
    var apiKey = "e4161545";
    var searchUrl = baseUrl + 'apikey=' + apiKey;

    //User types invalid movie title
    if (data.totalResults == null) {
        finalResult.nodeValue = "Sorry there are no movies with that title";
        subs.style.visibility = 'hidden';
    }

    var movies = data.Search;

    //Loops through movies from data
    $.each(movies, function (index, movie) {
        subs.style.visibility = 'visible';

        ////Create nominate btn
        var nomBtn = document.createElement("button");
        nomBtn.id = 'nomBtn';
        nomBtn.type = "button";
        nomBtn.className = "btn-grey btn-sm";
        var btnTxt = "Nominate";
        var nod = document.createTextNode(btnTxt);
        nomBtn.appendChild(nod);

        // Create list item for result-box
        var space = " ";
        var nod2 = document.createTextNode(space);
        var li = document.createElement("li");

        //Create modal link + append to list item
        var infoBtn = document.createElement("button");
        infoBtn.type = "button";
        infoBtn.className = "btn bl"
        infoBtn.id = "infoBtn-" + index;
        infoBtn.name = "infoBtn-" + index;
        infoBtn.setAttribute("data-toggle", "modal");
        infoBtn.setAttribute("data-target", "#movieModal");
        var node = movies[index].Title + ' (' + movies[index].Year + ')';
        infoBtn.append(node);
        li.appendChild(infoBtn);
        li.appendChild(nod2);
        li.appendChild(nomBtn);

        //If user presses Enter once, append to list;
        //Otherwise put new search items at top of list
        var list = document.getElementById("list");
        if (count == 1) {
            list.appendChild(li);
        }
        else {
            list.insertBefore(li, list.firstElementChild);
        }

        //Get movie info and display in movieModal
        infoBtn.onclick = function () {
            var lay = document.getElementById("movieTitle");
            lay.innerHTML = movies[index].Title;

            //OMDB API get plot
            $.ajax({
                url: searchUrl + '&t=' + movies[index].Title + '&y=' + movies[index].Year + '&plot=short&r=json',
                method: 'GET'
            }).done(function (response) {
                if (response.length < 1) {
                    finalResult.nodeValue = "Sorry, no movies were found";
                }
                else {
                    var img = document.getElementById("moviePic");
                    var actor = document.getElementById("actor");
                    var genre = document.getElementById("genre");
                    var plot = document.getElementById("moviePlot");
                    var rd = document.getElementById("rd");
                    var yr = "";
                    var gn = "";
                    var rn = "";
                    for (var prop in response) {
                        //For debugging purposes
                        //console.log(JSON.stringify(response));
                        if (response[prop] != "N/A") {
                            if (prop == "Poster") {
                                img.src = response[prop];
                            }
                            if (prop == "Actors") {
                                actor.innerHTML = '<strong>Starring: </strong>' + response[prop];
                            }
                            else if (prop == "Released") {
                                rd.innerHTML = '<strong>Released: </strong>' + response[prop];
                            }
                            else if (prop == "Year") {
                                yr = response[prop];
                            }
                            else if (prop == "Genre") {
                                gn = response[prop];
                            }
                            else if (prop == "Runtime") {
                                rn = response[prop];
                            }
                            else if (prop == "Plot") {
                                plot.innerHTML = response[prop];
                            }
                            genre.innerHTML = yr + " | " + gn + "<br>Duration: " + rn;
                        }
                        else if (prop == "Poster" && response[prop] == "N/A") {
                            img.src = "public/nopic.png";
                        }
                    }
                }
            })
        }

        //Create remove btn
        var remBtn = document.createElement("button");
        remBtn.type = "button";
        remBtn.className = "btn-grey btn-sm";
        remBtn.id = 'remBtn';
        var btnTxt2 = "Remove";
        var bt = document.createTextNode(btnTxt2);
        remBtn.appendChild(bt);

        //Create list item for nom-box
        var li2 = document.createElement("li");
        var sp = nod2.cloneNode(true);
        var noll = movies[index].Title + ' (' + movies[index].Year + ')';
        li2.append(noll);
        li2.appendChild(sp);
        li2.appendChild(remBtn);

        //When user clicks on nominate button
        nomBtn.onclick = function () {
            nb.style.visibility = 'visible';

            el++;
            console.log("err = " + err);
            console.log("el2 = " + el2);
            nomBtn.disabled = true;

            //User nominates 5 movies: success modal will display
            //User nominates >5 movies: error modal will display
            if (el > 5) {
                if (err) {
                    $('#errorModal').modal('show');
                    nomBtn.disabled = false;
                    el--;
                }
                else if (!err) {
                    $('#successModal').modal('show');
                    document.getElementById("nomList").appendChild(li2);
                    el2++;
                    err = true;
                }
            }
            else if (el == 5) {
                $('#successModal').modal('show');
                document.getElementById("nomList").appendChild(li2);
                el2++;
                err = true;
            }
            else if (el < 5) {
                $('#successModal').modal('hide');
                document.getElementById("nomList").appendChild(li2);
                el2++;
            }
        }

        //When user clicks on remove button
        remBtn.onclick = function () {
            el2--;
            err = false;
            console.log("err = " + err);
            console.log("el2 = " + el2);

            //User removes all items from nom-box: nom-box will hide
            if (el2 == 0) {
                toggle(document.querySelectorAll('.nom-box'));
            }

            el--;
            li2.parentNode.removeChild(li2);
            nomBtn.disabled = false;
        }
    });
}

//Toggles display of nom-box
function toggle(elements, specifiedDisplay) {
    var element, index;

    elements = elements.length ? elements : [elements];
    for (index = 0; index < elements.length; index++) {
        element = elements[index];

        if (isElementHidden(element)) {
            element.style.visibility = '';

            // If the element is still hidden after removing visibility
            if (isElementHidden(element)) {
                element.style.visibility = 'visible';
            }
        } else {
            element.style.visibility = 'hidden';
        }
    }
    function isElementHidden(element) {
        return window.getComputedStyle(element, null).getPropertyValue('dvisibility') === 'hidden';
    }
}
