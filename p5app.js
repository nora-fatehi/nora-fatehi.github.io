/////////////////////////////////////////////////////////////////// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyD3Si8p96Aj9dQqyUAN4MDHiCF-eR2L-Og",
    authDomain: "characterml5.firebaseapp.com",
    databaseURL: "https://characterml5-default-rtdb.firebaseio.com",
    projectId: "characterml5",
    storageBucket: "characterml5.appspot.com",
    messagingSenderId: "306419610447",
    appId: "1:306419610447:web:0af703a7eb4330c75d4b3a",
    measurementId: "G-3S5FF8B474"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var database = firebase.database();




///////////////////////////////////////////////////////////////GLOBAL VARIABLES
var UID = '_' + Math.random().toString(36).substr(2, 9);

let faceapi;
let video;
let detections;
let allPoints;
let isRecording;
var otherConnected = false;
var homepage = true;

let data2;
var textInput;
var person1counter = 0;
var person1texts = [];
var username;
var sourire = false;

const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false,
};
let root = document.documentElement;


///////////////////////////////////////////////////////////////////////SETUP

function setup() {
    // CANVAS
    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);
    canvas.style("z-index", "-1");
    // canvas.style("background", "black");

    // WEBCAM
    video = createCapture(VIDEO);
    // video.size(1280, 960);

    video.size(320, 240);
    video.hide();
    // Hide the video element, and just show the canvas

    //LAUNCH FACEAPI
    faceapi = ml5.faceApi(video, detectionOptions, modelReady);

    //EVENT LISTENERS

    addDatabaseListener(); //firebase listener
    document.getElementById("send").addEventListener("click", sendChat);
    document.addEventListener("keydown", Enter);

    document.getElementById("chatroom").style.display = "none";
    document.getElementById("header").style.display = "none";
    //    document.addEventListener("keydown", checkwords);


    //ENTER THE CHATROOM
    document.getElementById("enter").addEventListener("click", EnterChatroom);

    //LINK BACK TO HOMEPAGE
    document.getElementById("titre").addEventListener("click", function() {
        document.getElementById("homepage").style.display = "block";
        document.getElementById("chatroom").style.display = "none";
        document.getElementById("header").style.display = "none";
    });


}

function EnterChatroom() {
    document.getElementById("header").style.display = "block";
    document.getElementById("chatroom").style.display = "block";
    document.getElementById("homepage").style.display = "none";
    document.getElementById("textinput").value = "write something";
    homepage = false;
    username = document.getElementById("username").value;
    send('PEOPLE/' + UID + '/', {
        'persontext': "joined the chat",
        'personusername': username,
    });

    setTimeout(send('PEOPLE/' + UID + '/', null), 100);


}
/////SUBMIT TEXT 
function Enter(e) {
    if ((e.key == "Enter")) {
        if (homepage == true) {
            //EnterChatroom();
            //send('PEOPLE/' + UID + '/', null);
        }

        if (homepage == false) {
            if (document.getElementById("send").disabled == false) {

                sendChat();
                document.getElementById('textinput').value = '';
            }
        }

    }
}

function checkwords() {
    // textInput = document.getElementById("textinput").value;
    // if ((textInput.includes("haha") == true) ||
    //     (textInput.includes("hahaha") == true) ||
    //     (textInput.includes("lol") == true) ||
    //     (textInput.includes("lol") == true) ||
    //     (textInput.includes("HAHAH") == true) ||
    //     (textInput.includes("lmao") == true) ||
    //     (textInput.includes("funny") == true))
    // {
    //     if (sourire == false) {
    //         document.getElementById("send").disabled = true;
    //         document.getElementById("send").style.opacity = "50%";
    //     }  if (sourire == true) {
    //         console.log("VAZY ChaKAl")
    //         document.getElementById("send").disabled = false;
    //         document.getElementById("send").style.opacity = "100%";

    //     }

    // } else {

    //     document.getElementById("send").disabled = false;
    //     document.getElementById("send").style.opacity = "100%";


    // }


}

function sendChat() {
    textInput = document.getElementById("textinput").value;

    if (document.getElementById("send").disabled == false) {
        var toSend = document.createElement("p"); // Create a <p> element
        toSend.innerHTML = "@" + username + " : " + textInput; // Insert text
        toSend.className = "myclass";
        toSend.style.color = "red";
        document.getElementById("messages").appendChild(toSend); // Append <p> to <div> with id="myDIV"
        document.getElementById('textinput').value = '';
        updateScroll();

        send('PEOPLE/' + UID + '/', {

            'persontext': textInput,
            'personusername': username,
        });

        // this.send('DRAWINGS/' + this.UID, null);


        setTimeout(function() {
            send('PEOPLE/' + UID + '/', null);
        }, 1000);


    }



}

function updateScroll() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}

/////////////////////////////////////////////////////////////FIREBASE FUNCTION

////SEND TO FIREBASE
function send(path, value) {
    //  console.log('send');
    const json = {
        'data': value
    };
    database.ref(path).set(json);
}

//// //RECEPTION FIREBASE
function addDatabaseListener() {

    ///GET TEXT 
    database.ref("PEOPLE").on("value", (snapshot) => {
        const people = snapshot.val();
        // console.log("people"+ people);

        for (const person in people) {
            //console.log("persone"+person);
            //console.log(people[person]);
            if (person) {

                if (person != UID) {
                    var persontext = (people[person].data.persontext);
                    var personusername = (people[person].data.personusername);

                    var received = document.createElement("p"); // Create a <p> element
                    received.innerHTML = "@" + personusername + " : " + persontext; // Insert text
                    received.className = "myclass";
                    document.getElementById("messages").appendChild(received); // Append <p> to <div> with id="myDIV"

                    updateScroll();

                }

            }

        }

    })

    ///////GET SMILE POINTs


    database.ref("PEOPLEMOUTH").on("value", (snapshot) => {
        const mouths = snapshot.val();
        // console.log("people"+ people);

        for (const mouth in mouths) {
            //console.log("persone"+person);
            //console.log(people[person]);
            if (mouth) {

                if (mouth != "jpp" + UID && homepage == false) {

                    var mouthpoints = (mouths[mouth].data.personmouth);

                    beginShape();
                    for (let i = 0; i < mouthpoints.length; i += 1) {
                        const x = ((mouthpoints[i]._x * -4) + 1000);
                        const y = ((mouthpoints[i]._y) * 4);
                        stroke(0);
                        strokeWeight(2);
                        noFill();
                        textSize(5);
                        vertex(x, y);
                    }

                    endShape(CLOSE);


                }
            }
        }

    })

    // database.ref("PERSON2MOUTH/").on("value", (snapshot) => {
    //     const Main2 = snapshot.val();
    //     console.log(Main2);

    //     if (Main2) {
    //         otherConnected = true;
    //         data2 = Main2.data.mouth2;
    //         console.log("FACEPOINT");
    //         console.log(data2);
    //     }
    // })

}

/////////////////////////////////////////////// DRAWING FACEAPI POINTS//////////////


function drawPart(feature, closed) { /// CHAQUE FRAME

    //SEND MY MOUTH POINTS/////////
    setInterval(send('PEOPLEMOUTH/' + 'jpp' + UID + '/', {
        'personmouth': feature,
    }), 100);


    //send('PEOPLEMOUTH/' +'jpp'+ UID +'/', null);




    // send('PERSON1MOUTH/', {
    //     mouth1: feature,
    // });
    //background(255);

    //DRAW MY SMILE ////////////////////////////////////
    beginShape();
    for (let i = 0; i < feature.length; i += 1) {
        const x = ((feature[i]._x * -4) + 2000);
        const y = ((feature[i]._y) * 4);
        stroke(255, 0, 0);
        strokeWeight(2);
        noFill();
        textSize(5);
        vertex(x, y);
    }
    if (closed === true) {
        endShape(CLOSE);
    } else {
        endShape();
    }

    //DRAW OTHER SMILE ////////////////////////////////////

    // if (homepage == false) {
    //     beginShape();
    //     for (let i = 0; i < data2.length; i += 1) {
    //         const x = ((data2[i]._x * -4) + 1000);
    //         const y = ((data2[i]._y) * 4);
    //         stroke(255,0,0);
    //         strokeWeight(2);
    //         noFill();
    //         textSize(5);
    //         vertex(x, y);
    //         // text(i, x, y);
    //     }
    //     if (closed === true) {
    //         endShape(CLOSE);
    //     } else {
    //         endShape();
    //     }
    // }



    //////CALCULER MON SOURIRE AVEC FACE POINT
    const left = feature[12]._y;
    const right = feature[16]._y;
    const top = feature[14]._y;
    const moyenne = (left + right) / 2;
    //  const diff =((top-moyenne)*200)+200;

    //CHANGE HOMEPAGE TYPO
    if (homepage == true) {
        const diff = map((top - moyenne), -1, 3, 0, 50);
        root.style.setProperty('--custom-phtw', diff - 10);
        root.style.setProperty('--custom-phth', diff);
    }

    //CHANGE TYPER TYPO
    if (homepage == false) {
        const diff = map((top - moyenne), -1, 3, 0, 90);
        root.style.setProperty('--custom-phtw', diff - 10);
        root.style.setProperty('--custom-phth', diff);
    }

    /////////////// //DETECT SMILE
    if (moyenne > top) {
        sourire = false;
        // console.log('restinbitchface');
        // root.style.setProperty('--custom-TRMG', 500);
    }
    if (moyenne < top) {
        // root.style.setProperty('--custom-TRMG', 0);
        // console.log('smileyyy');
        sourire = true;
    }
    // console.log(sourire);






    /////PARTIE TEXT WORD CHECK//////////////////////////////////////////////

    ///IF YOU SAY FUNNY WORDS//////////
    textInput = document.getElementById("textinput").value;

    if ((textInput.includes("haha") == true) ||
        (textInput.includes("hah") == true) ||
        (textInput.includes("HAHA") == true) ||
        (textInput.includes("wow") == true) ||
        (textInput.includes("love") == true) ||
        (textInput.includes("like") == true) ||
        (textInput.includes("nice") == true) ||
        (textInput.includes("cool") == true) ||
        (textInput.includes("fun") == true) ||
        (textInput.includes("great") == true) ||
        (textInput.includes("best") == true) ||
        (textInput.includes("amazing") == true) ||
        (textInput.includes("wonderful") == true) ||
        (textInput.includes("incredible") == true) ||
        (textInput.includes("laugh") == true) ||
        (textInput.includes("hihi") == true) ||
        (textInput.includes("mdr") == true) ||
        (textInput.includes("ptdr") == true) ||
        (textInput.includes("good") == true) ||
        (textInput.includes("lol") == true) ||
        (textInput.includes("HAHAH") == true) ||
        (textInput.includes("lmao") == true) ||
        (textInput.includes("funny") == true)) {

        //////BUT YOU DONT SMILE
        if (sourire == false) {
            document.getElementById("send").disabled = true;
            document.getElementById("send").style.opacity = "50%";
            console.log("SMILE NOW")
        }

        //////BUT YOU SMILE
        if (sourire == true) {
            console.log("YOU SMILED")
            document.getElementById("send").disabled = false;
            document.getElementById("send").style.opacity = "100%";
        }

        //////////IF YOU SAY NORMAL WORDS

    } else {
        document.getElementById("send").disabled = false;
        document.getElementById("send").style.opacity = "100%";
    }



}




/////////////////////////////////////////////// GET POINTS FROM FACEAPI////////////
//// PAS TOUCHER 


function modelReady() {
    console.log("ready!");
    console.log(faceapi);
    faceapi.detect(gotResults);
}

function gotResults(err, result) {
    if (err) {
        console.log(err);
        return;
    }
    detections = result;
    background(255);
    stroke(255);
    strokeWeight(5);
    rect(width * 0.4, 100, 320, 240);
    //image(video, 0, 0, 320, 240);

    if (detections) {
        if (detections.length > 0) {
            //TOUT LES POIIIIINTS
            allPoints = detections[0].landmarks.positions;
            drawLandmarks(detections);
        }
    }
    faceapi.detect(gotResults);
}

function drawLandmarks(detections) {
    for (let i = 0; i < detections.length; i += 1) {
        const mouth = detections[i].parts.mouth;
        drawPart(mouth, true);

    }
}