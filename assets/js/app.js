var myDataRef;
var num=0;
var auth;
var project;

function getUrlParameter(sParam){
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++){
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam){
        return sParameterName[1];
    }
  }
}

function validateURL(textval) {
  var urlregex = new RegExp(
        "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
  return urlregex.test(textval);
}

var login=function(provider){
  var rootRef = new Firebase('https://firewrite.firebaseio.com');
  var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
    if (error) {
      console.log(error);
    } else if (user) {
      window.location.replace("home.htm");
    } else {
      auth.login(provider);
    }
  });
}

var logout = function(){
  auth.logout();
}

var editProject=function(){
  window.location.replace("i.htm?project="+project);
}

var viewProject=function(){
  window.location.replace("o.htm?project="+project);
}


function getUrlParameter(sParam){
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) 
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) 
    {
        return sParameterName[1];
    }
  }
}

var initI=function(){
  project=getUrlParameter("project");
  var rootRef = new Firebase('https://firewrite.firebaseio.com');
  num=0;
  var stringid="text-0"
  var listRef = new Firebase("https://firewrite.firebaseio.com/presence/");
  auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
    if (error) {
      console.log(error);
    } else if (user) {
      if(user.username==undefined) user.username=user.displayName;
      $("#user").text(user.username);
      var userRef = listRef.push(user.uid);
      // Add ourselves to presence list when online.
      var presenceRef = new Firebase("https://firewrite.firebaseio.com/.info/connected");
      presenceRef.on("value", function(snap) {
        if (snap.val()) {
          userRef.set(true);
          // Remove ourselves when we disconnect.
          userRef.onDisconnect().remove();
        }
      });

      myDataRef = new Firebase('https://firewrite.firebaseio.com/'+user.provider+":"+user.username+"/"+project);
      myDataRef.once('value', function(snapshot) {
        var message = snapshot.val();
        if(message==undefined) return;
        num=message.num;
        $('#title').text(message["title"]);
        $('#description').text(message["description"]);
        if(num==undefined){
          num=0;
          myDataRef.update({num:0});
        }

        stringid="text-"+num;
        $('#messageInput').text(message[stringid]);
      });
      $('#messageInput').keyup(function (e) {
        var text = $('#messageInput').val();
        if(e.keyCode==13){
          stringid=saveAndClear();
        }
        else{
          saveMessage(stringid,text);
        }
      });
    }
    else{
      window.location.replace("login.htm");
    }

    $('#imageUpload').on('submit',(function(e) {
      e.preventDefault();
      var formData = new FormData(this);

      $.ajax({
          type:'POST',
          url: $(this).attr('action'),
          data:formData,
          cache:false,
          contentType: false,
          processData: false,
          success:function(data){
              if($('#messageInput').val().length>0) stringid=saveAndClear();
              console.log(data.data.img_view);
              saveMessage(stringid,"<img data-src='"+data.data.img_url+"' class='img-thumbnail' src='"+data.data.thumb_url+"'/>");
              stringid=saveAndClear();
          },
          error: function(data){
          }
      });
  }));
  });
}

var saveMessage = function(stringid,text){
  var data={};
  data[stringid]={};
  data[stringid].date=new Date();
  data[stringid].text=text;
  myDataRef.update(data);
}

var saveAndClear = function(){
  num++;
  myDataRef.update({num:num});
  stringid="text-"+num;
  $('#messageInput').val("");
  return stringid
}

var appendDot = function(){
  $('#messageInput').val($('#messageInput').val()+".");
  saveMessage($('#messageInput').val());
}


var initO=function(){
  project=getUrlParameter("project");
  var messageTemplate=$('#messageTemplate').html();
  Mustache.parse(messageTemplate);
  var rootRef = new Firebase('https://firewrite.firebaseio.com');
  auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
    if (error) {
      toastr.error(error);
    } else if (user) {
      if(user.username==undefined) user.username=user.displayName;
      $("#user").text(user.username);
      var listRef = new Firebase("https://firewrite.firebaseio.com/presence/");
      var userRef = listRef.push(user.uid);
      var stringid="text-0";

      // Add ourselves to presence list when online.
      var presenceRef = new Firebase("https://firewrite.firebaseio.com/.info/connected");
      presenceRef.on("value", function(snap) {
        if (snap.val()) {
          userRef.set(true);
          // Remove ourselves when we disconnect.
          userRef.onDisconnect().remove();
        }
      });

      myDataRef = new Firebase('https://firewrite.firebaseio.com/'+user.provider+":"+user.username+"/"+project);
      myDataRef.once('value', function(snapshot) {
        var message = snapshot.val();
        if(message==undefined) return;  
        $('#title').text(message["title"]);
        $('#description').text(message["description"]);            
        var num=message.num;
        if(num!=undefined){
          for(var i=0;i<num;i++){
            stringid="text-"+i;
            displayMessage(i,message[stringid]);
          }
          $("img").click(function(){
            console.log($(this).data("src"));
          });
        }
      });
      myDataRef.on('value', function(snapshot) {
        var message = snapshot.val();
        if(message==undefined) return;
        var num=message.num;
        if(num==undefined){
          num=0;
        }
        stringid="text-"+num;
        displayMessage(num,message[stringid]);
      });
      function displayMessage(count,message) {
        console.log(message);
        if(message==undefined) return;
        var dom=$('#message'+count);
        message.text=message.text.replace(/ point point/g,".");
        message.moment=moment(message.date).format("HH:mm");
        if(validateURL(message.text)){
          message.text="<a target='_blank' class='oembed"+count+"' href='"+message.text+"'> "+message.text+"</a>";
        }
        var rendered = Mustache.render(messageTemplate, {message:message, id:count});
        if(dom.length == 0){
          $('#messagesDiv').prepend(rendered);
        }
        else{
          dom.replaceWith(rendered);
        }
        $(".oembed"+count).oembed();
      };
    }else{
      window.location.replace("login.htm");
    }
  });
};



function removeProject(id) {
  if(confirm("Are you sure?")){
    var projectid="project-"+id;
    console.log(projectid);
    myDataRef.child(projectid).remove(function(error) {
      if (error) {
        toastr.error("Can't delete the project!");
      } else {
        toastr.info("Project deleted");
        $('#'+projectid).remove();
      }
    });
  }
}


var initHome=function(){
  var projectTemplate=$('#projectTemplate').html();
  Mustache.parse(projectTemplate);
  var rootRef = new Firebase('https://firewrite.firebaseio.com');
  auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
    if (error) {
      console.log(error);
    } else if (user) {
      console.log(user);
      if(user.username==undefined) user.username=user.displayName;
      $("#user").text(user.username);
      var listRef = new Firebase("https://firewrite.firebaseio.com/presence/");
      var userRef = listRef.push(user.uid);

      // Add ourselves to presence list when online.
      var presenceRef = new Firebase("https://firewrite.firebaseio.com/.info/connected");
      presenceRef.on("value", function(snap) {
        if (snap.val()) {
          userRef.set(true);
          // Remove ourselves when we disconnect.
          userRef.onDisconnect().remove();
        }
      });

      myDataRef = new Firebase('https://firewrite.firebaseio.com/'+user.provider+":"+user.username);
      $("#newProject").click(function(e){
          e.preventDefault();
          var data={};
          var projectid="project-"+num;
          data[projectid]={projectid:num,title:$("#title").val(), description:$("#description").val()};
          myDataRef.update(data);
          myDataRef.update({num:num+1});
          window.location.replace("i.htm?project="+projectid);
      });
      myDataRef.once('value', function(snapshot) {
        var projects = snapshot.val();
        if(projects==undefined) return;
        num=projects.num; 
        if(num!=undefined){
          for(var i=0;i<num;i++){
            stringid="project-"+i;
            displayProject(projects[stringid]);
          }
        }
        else{
          num=0;
        }
        
      });
      function displayProject(project) {
        if(project==undefined) return;
        var rendered = Mustache.render(projectTemplate, project);
        $('#projectsDiv').append(rendered);
      };
      
    }else{
      window.location.replace("login.htm");
    }
  });
};
