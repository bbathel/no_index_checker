// ==UserScript==
// @name         No-Index Checker
// @namespace    Brice_JS_Badass.com
// @version      0.1
// @description  Warns you if you are on a page that has a no-index meta tag or is dissallowed in robots.txt
// @author       The Brice
// @match        *://*/*
// @grant        unsafeWindow
// @noframes      
// ==/UserScript==

// put hostnames to ignore here

/*this is extending arrays to have a contains function*/
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

/* bs text_output object */
var Text_output = function(){
        this.log = function(){ return true;};
    }
    
var text_output,NIC;

/* array of pages to ignore */
var ignore_list = [
        'crm.searchinfluence.com',
        'mail.google.com',
        'drive.google.com',
        'www.gstatic.com',
        'pastebin.searchinfluence.com',
        '/o/oauth2/postmessageRelay',
        'codepen.io',
        's.codepen.io',
        'plus.google.com',
        'accounts.google.com',
        'clients6.google.com',
        'plus.google.com',
        'hangouts.google.com',
        'plus.google.com',
        'accounts.google.com',
        'clients4.google.com',
        '9.client-channel.google.com',
        'hangouts.google.com',
        'hangouts.google.com',
        'hangouts.google.com',
        'plus.google.com',
        'accounts.google.com',
        'googleads.g.doubleclick.net',
        '18.client-channel.google.com'
    ];

/* returns true if the current page is on the ignore list */
var black_listed = function(){
        return ignore_list.contains(window.location.host);
    }
    
function No_index_checker(){
 
    var robots, disallow_string, ahhhh_no_robots, meta_tags;                                 // variables to be used later.
    this.url = window.location.protocol + "//" + window.location.hostname + "/robots.txt";   // url of the robots.txt file composed of the protocol two slashes the hostname and "robots.txt"
    var UA_groups = new Object();
    var UA_regex = /user-agent\:\s*(.*)/i;                                                   // this catches the user-agent in a user-agent line
    var disallow_regex= /disallow\: {0,2}([\w\\\/\.\*\?\-]*)/i;                              // this catches the directory disallowed by the disallow statement
    var path_regex = new RegExp(window.location.pathname.substring(1,window.location.pathname.length));
    var meta_tag_regex = new RegExp('robots','gi');                                          // regex to find if robots is the name of the meta tag
    var no_regex = /no\-?(index|follow)/;                                                    // regex to find if no-index or no-follow is the content of the meta tag
    var important_UAs = ['googlebot','*']                                                    // an array of User-agents we care about starting from most specfic ending in least specific (usually *)
    
    /* getters */
    this.get_uas = function(){return UA_groups};
    this.get_robots = function(){return robots};
    
    /* function takes the robots.txt as only argument, parses it,adds a key to UA_groups obect and seperates it into arrays by user-agent containing all the disallows directives*/
    var robots_parse = function(robots){
        var user_agent                                                                       // variable to hold the user_agent string gotten from the User-agent: directive 
        robots_array = robots.split(/\n/);                                                   // robots_array is the robots.txt split at every new line
        for(var i = 0; i < robots_array.length;i++){
            if(UA_regex.test(robots_array[i])){                                              // if the line is a user-agent: line
                user_agent = robots_array[i].match(UA_regex)[1];                             // sets user_agent to the name from the robots.txt
                UA_groups[user_agent] = new Array();                                         // creates a new array within a key value pair of the UA_groups object, where the key is the name of the UA
                }
            else if (disallow_regex.test(robots_array[i]) &&  user_agent !== undefined) {    // if the line is a disallow line and user_agent was already set 
                UA_groups[user_agent].push(robots_array[i].match(disallow_regex)[1])         // add the path after disallow to the array
            }
        }
        
    }
    
    
    /*This function gets all meta tags on a page and checks if they are for robots then if they are no-index or no-follow*/
    this.meta_tag_checker = function(){
        meta_tags = document.getElementsByTagName('meta');                                   // gets all meta tags from the page
        for(var i = 0; i < meta_tags.length;i++){                                            // loops through all the meta tags
            if(meta_tag_regex.test(meta_tags[i].getAttribute('name'))){                      // if meta tag name is robots
                if(no_regex.test(meta_tags[i].getAttribute('content'))){                     // if meta tag content is no-index or no-follow
                    create_alert_box('meta tag');                                            // creates an alert box that has meta tag as the message.
                    return true;                                                             // returns true if there is a meta tag so this can be used as a boolean later on in the run_checker function
                }
            }
        } return false;
    }
    
    
    
    /* this function takes an array of user-agents defined at the top of this class and looks through them for disallow statements*/
    var ua_disallow = function(user_agent){
        if (UA_groups[user_agent] !== undefined) {
            if (UA_groups[user_agent].contains(window.location.pathname)) {
                create_alert_box("Robots "+ user_agent + " Disallows " + window.location.pathname)                        // if this page is explicitly listed in Robots.txt 
                return true;
            }
            else if (UA_groups[user_agent].contains('/')) {
                create_alert_box("Robots "+ user_agent + " Disallows /" )                                                 // if this page isn't explicitly listed in Robots.txt but user-agent disallows / an alert box pops up
                return true;
            }
        }
    }
    
    /* takes the UA_groups and decides if page is disallowed first for googlebot and if googlebot UA doesn't exist then it checks the "*" user-agent */
    var disallow_checker = function(UA_groups){
        for(var i = 0; i < important_UAs.length ; i++ ){
            if(ua_disallow(important_UAs[i])){
                return true;
            }
        }
        return false;
    }
    
    /* this creates a super cool little alert box to tell you you are on a disallowed page at the bottom right of the screen */
    var create_alert_box = function(message){
        ahhhh_no_robots = document.createElement('div')
        ahhhh_no_robots.id = "ahhhh_no_robots"
        ahhhh_no_robots.innerHTML = '<h1 id="exclamation-point">!</h1>';
        ahhhh_no_robots.innerHTML += '<h2> this page is<br> no-index:<br>' + message + '</h2>';
        var style_string = "<style>"
        style_string += "#ahhhh_no_robots{height:200px;width:200px;position:fixed;bottom:0;right:0;text-transform:uppercase;z-index:100000000000;}"
        style_string += "#ahhhh_no_robots h1#exclamation-point{color:red;font-size:100px;font-weight:900;text-align:center;margin-top:30%;}"
        style_string += "#ahhhh_no_robots h2{text-transform:uppercase;color:red;font-size:25px;font-weight:900;text-align:center;height:0;position:relative;bottom:0;line-height:25px;overflow:hidden;}"
        style_string += "</style>"
        ahhhh_no_robots.innerHTML += style_string;
        document.body.appendChild(ahhhh_no_robots);
        ahhhh_no_robots.childNodes[0].addEventListener('click',                                                 // adds a click listener that popsup the information on the page.
                                         function(event){
                                             event.preventDefault();
                                             ahhhh_no_robots.childNodes[1].style.height = '200px';
                                             ahhhh_no_robots.childNodes[0].remove();
                                             ahhhh_no_robots.style.backgroundColor = "rgba(200,200,200,.8)";
                                         })
        ahhhh_no_robots.childNodes[1].addEventListener('click',                                                 // adds a click listener that removes the box if you click on it
                                        function(event){
                                            event.preventDefault();
                                            ahhhh_no_robots.remove();  
                                        })
    }
    
    /* This runs the whole check in one function call once a new instance of No_index_checker is created. */
    this.run_checker = function(){
        text_output = new Text_output()                                                    // creates a bs test_output object to so no error is thrown for all the .log()'s that I have for debugging.
        //uncomment line below to output stuff to console
        //text_output = console;
        var xmlhttp = new XMLHttpRequest();
        text_output.log(this.url);
    
        /* this will request the robots.txt file and then call the robots_alert function to test if the path is in there */
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                robots = xmlhttp.responseText;                                                     // the robots.txt text itself.
                text_output.log(robots)
                robots_parse(robots);                                                              // robots_parse takes the robots file and adds it to the UA_groups
                disallow_checker(UA_groups);                                                       // parses the ua groups to see if page is disallowed. 
            }
        }
        if(!this.meta_tag_checker()){                                                               // checks if there is a no-follow meta tag if there is then id doesn't check robots.txt
            xmlhttp.open("GET", this.url, true);                                                    // requests robots here
            xmlhttp.send();                                                                         // sends the request.
            
        }
    }
}

/* this function runs everything */
if(!black_listed()){                                                                                // Checks if a page is on the ignore list

    NIC = new No_index_checker()                                                                    // creates a new No_index_checker();
    NIC.run_checker();                                                                              // this is the main function
    
}
