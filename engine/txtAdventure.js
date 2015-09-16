jQuery.noConflict();
(function($){
  $.getJSON('stories/dungeon.json', function(json){
    // HTML VARIABLES
    var $msgForm=$('.msgForm form');
    var $msgInput=$('#myMsg');
    var $msgArea=$('.msgArea');

    // GAME VARIABLES
    //var heroName=json.variables.hero.name;
    var globalCommands=Object.keys(json.globalCommands);
    var randomAws=json.variables.randomAws;
    var textVariables=Object.keys(json.textVariables);

    var stages=json.stages;
    var stageIndex;
    var stag;
    var partialIndex;
    var partial;

    // START GAME
    goToStage(['start_game', 'intro']);

    // COMMAND FUNCTIONS
    function newCommand(){
      msg=$msgInput.val();
      $msgInput.val('');
      addMyMessage(msg);
      command=findCommandInMessage(msg);
      exeThisCommand(command);
    }

    function findCommandInMessage(msg){
      currentCommands=Object.keys(partial.commands);
      res=-1;
      // command in current partial
      for(var i=0; i<currentCommands.length; i++){
        if(isCommand(currentCommands[i], msg)){
          res=[currentCommands[i], 'CURRENT'];
          break;
        }
      }
      // command in general commands
      if(!res){
        for(var i=0; i<globalCommands.length; i++){
          if(isCommand(globalCommands[i], msg)){
            res=[globalCommands[i], 'GLOBAL'];
            break;
          }
        };
      }
      // command in current partial other
      if(!res && typeof partial.commands._ALL_ !=='undefined'){
          res=['_ALL_', 'CURRENT'];
      }
      return res;
    }

    function isCommand(cmd, msg){
      cmd=cmd.toLowerCase();
      msg=msg.toLowerCase();
      cmds=cmd.split(", ");
      res=false;
      for(var i=0; i<cmds.length; i++){
        words=cmds[i].split(" ");
        n=0;
        nn=words.length;
        for(var y=0; y<words.length; y++){
          if (msg.indexOf(words[y]) != -1){
            n++
          }
        }
        if (n == nn) res=true;
      }

      return res;
    }

    function exeThisCommand(arr){
      cmd=arr[0];
      amb=arr[1];
      if(amb=='CURRENT') execActions(partial.commands[cmd]); // CURRENT
      else if(amb=='GLOBAL') execActions(json.globalCommands[cmd]); // GLOBAL
      else sendRandomMessage(randomAws); // RANDOM
    }

    function exeCommand(cmd){
      if(partial.commands[cmd]) execActions(partial.commands[cmd]); // CURRENT
      else if(json.globalCommands[cmd])execActions(json.globalCommands[cmd]); // GLOBAL
      else sendRandomMessage(randomAws); // RANDOM
    }

    function execActions(actions){
      acts=Object.keys(actions);
      acts.map(function(o,i){
        act=o;
        data=actions[o];
        eval(act+'(data)');
      });
    }

    // MESSAGE FUNCTIONS
    function addMyMessage(msg){
      //$msg=$('<div class="myMsg"><b>Tu: </b>'+msg+'</div>');
      $msg=$('<div class="myMsg"> - '+msg+'</div>');
      $msgArea.append($msg);
      $msg.slideDown(200);
    }

    function addHeroMessage (msg){
      msg=ctrlMsg(msg);
      //$msg=$('<div class="heroMsg"><b>'+heroName+': </b>'+msg+'</div>');
      $msg=$('<div class="heroMsg">'+msg+'</div>');
      $msgArea.append($msg);
      $msg.slideDown(200);
    }

    function ctrlMsg(msg){
      for(var i=0; i<textVariables.length; i++){
        o=textVariables[i];
        if (msg.indexOf(o) != -1){
          text=eval(json.textVariables[o]+'()');
          msg=msg.replace(o, text);
        }
      }
      return msg;
    }

    function getRandomInt(max) {
      min=0;
      return Math.floor(Math.random() * (max - min)) + min;
    }

    // GAME FUNCTIONS
    function goToStage(data){
      stageIndex=data[0];
      stage=stages[stageIndex];
      partialIndex=data[1];
      partial=stage.partials[partialIndex];
      sendMessages(partial.messages);
    }

    function goToPartial(data){
      partial=stage.partials[data[0]];
      sendMessages(partial.messages);
    }

    function sendMessage(data){
      if( Object.prototype.toString.call(data) === '[object Array]' ) msg=data[0];
      else msg=data;
      time=data[1] || 500;
      setTimeout(function(){addHeroMessage(msg);},time);
    }

    function sendMessages(data){
      if( Object.prototype.toString.call(data) === '[object Array]' ){
        for(var i=0; i<data.length; i++){
          console.log(data[i]);
          addHeroMessage(data[i]);
        };
      }else{
        Object.keys(data).map(function(o,i){
          setTimeout(function(){
            addHeroMessage(data[o]);
          },o);
        });
      }
    }

    function sendRandomMessage(data){
      max=data.length;
      randomN=getRandomInt(max);
      addHeroMessage(data[randomN]);
    }

    function verifyLifeStatus(data){
      msgs=['bene', 'così così', 'male'];
      $.extend(msgs, data);

      lLv=json.variables.status.life[0];
      lMax=json.variables.status.life[1];
      if(lLv<lMax/4){
        message=msgs[2];
      }else if(lLv<lMax/2){
        message=msgs[1];
      }else{
        message=msgs[0];
      }
      addHeroMessage(message);
    }

    function verifyForceStatus(data){
      msgs=['abbastanza', 'così così', 'svengo'];
      $.extend(msgs, data);

      lLv=json.variables.status.force[0];
      lMax=json.variables.status.force[1];
      if(lLv<lMax/4){
        message=msgs[2];
      }else if(lLv<lMax/2){
        message=msgs[1];
      }else{
        message=msgs[0];
      }
      addHeroMessage(message);
    }

    function itemList(){
      items=json.variables.items;
      text='';
      Object.keys(items).map(function(o,i){
        text=text+items[o]+' '+o+' ';
      });
      return text;
    }

    function addItem(data){
      if(json.variables.items[data[0]]) json.variables.items[data[0]]=json.variables.items[data[0]]+data[1];
      else json.variables.items[data[0]]=data[1];
    }

    function removeItem(data){
      if(json.variables.items[data[0]]){
        json.variables.items[data[0]]=json.variables.items[data[0]]-data[1];
        if (json.variables.items[data[0]]==0) delete json.variables.items[data[0]];
      }
    }

    function addLifePoint(data){
      point=[1, 'Grande! Ho recuperato in salute'];
      $.extend(point, data);
      json.variables.status.life[0]=json.variables.status.life[0]+point;
      if(json.variables.status.life[0]>json.variables.status.life[1])json.variables.status.life[0]=json.variables.status.life[1];
      addHeroMessage(point[1]);
    }

    function removeLifePoint(data){
      point=[1, 'Mi sono fatto male'];
      $.extend(point, data);
      json.variables.status.life[0]=json.variables.status.life[0]-point[0];
      if(json.variables.status.life[0]<=0) gameOver();
      else addHeroMessage(point[1]);
    }

    function addMaxLifePoint(data){
      point=[1, 'La mia salute massima aumenta'];
      $.extend(point, data);
      json.variables.status.life[1]=json.variables.status.life[1]+point[0];
      json.variables.status.life[0]=json.variables.status.life[1];
      addHeroMessage(point[1]);
    }

    function event(data){
      actions=json.events[data[0]];
      execActions(actions);
    }

    function gameOver(){
      $msgInput.prop('disabled', true);
    }

    // log
    function log(){
      console.log(json);
    }

    // LISTNER EVENT
    $msgForm.on('submit', function(e){
      e.preventDefault();
      newCommand();
    });
  });
})(jQuery);
