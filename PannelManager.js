// skillsPannelsListの中身
/**
 * [
 *  {
 *    player: PlayerHandle, 
 *    skillsPannel: ItemHandle
 *   },
*  {
 *    player: PlayerHandle, 
 *    skillsPannel: ItemHandle
 *   },
 * ]
 */

function initialize() {
  $.state.items = null;
  $.state.i = 0;
  $.state.currentTime = 0;

  $.state.skillsPannelsList = [];
  $.state.pannelState = "initializing";

  const distance = 30;
  if ($.state.items == null)
    $.state.items = $.getItemsNear($.getPosition(), distance);
}

$.onStart(() => {
  initialize();
});

$.onUpdate((deltaTime) => {
  deltaTimeFunction(deltaTime, 0.2, sendInitialize);
  deactivateInitializingPanel();  
});

$.onReceive((messageType, arg, sender) => {
  switch (messageType) {
    case "onInitializeSkillsPannel": {
      const skillsPannelItemHandle = arg;
      setStateSkillsPanelsList(skillsPannelItemHandle);
      break;
    }
    case "requestPannelManagerId": {
      const skillsPannelItemHandle = sender;
      sendPanelInitialize(skillsPannelItemHandle);
      
      break;
    }
    case "requestSkillsPannelEquipped": {
      if (isInitializingPannel()) return;

      const skillsPannelId = arg.skillsPannel.id
      const player = arg.player;
      sendEventAllowEquip(skillsPannelId, player);
      break;
    }
    case "onSwitchInteracted": {
      if (isInitializingPannel()) return;

      const player = arg.player;
      const interactedSwitchNumber = arg.interactedSwitchNumber
      
      if (!isPlayerAlreadyEquipped(player)) {
        assignPannelToPlayer(player);
      }
      sendEventTagChangeEvent(player, interactedSwitchNumber);
      break;
    }
    case "onLeavePlayer": {
      const player = arg
      removeSkillsPannelInfoFromState(player);
      break;
    }
  }
});

function deltaTimeFunction(deltaTime, restTime, argFunction) {
  if ($.state.items != null) {
    $.state.currentTime += deltaTime;
    if ($.state.currentTime >= restTime && $.state.i < $.state.items.length) {
      argFunction();
      $.state.i++;
      $.state.currentTime = 0;
    }
    if ($.state.i >= $.state.items.length) {
      $.state.i = 0;
      $.state.currentTime = 0;
      $.state.pannelState = null;
      $.state.items = null;
    }
  }
}

function sendInitialize() {
  $.state.items[$.state.i].send("switchInitialize", "");
  $.state.items[$.state.i].send("pannelInitialize", "");
}

function deactivateInitializingPanel() {
  let pannelState = $.state.pannelState;
  if (pannelState !== "initializing") {
    $.subNode("Initializing").setEnabled(false);
  }
}

function setStateSkillsPanelsList(skillsPannelItemHandle) {
  const skillsPannelsList = $.state.skillsPannelsList;
  skillsPannelsList.push({ player: null, skillsPannel: skillsPannelItemHandle })
  $.state.skillsPannelsList = skillsPannelsList;
}

function sendPanelInitialize(skillsPannelItemHandle) {
  const pannelManager = $.itemHandle
  skillsPannelItemHandle.send("pannelInitialize", pannelManager);
}

function sendEventTagChangeEvent(player, interactedSwitchNumber) {
  const skillsPannelList = $.state.skillsPannelsList;
  const skillsPannelIndex = skillsPannelList.findIndex(panel => panel.player && panel.player.id === player.id);
  skillsPannelList[skillsPannelIndex].skillsPannel.send("tagChangeEvent", interactedSwitchNumber);
}

function removeSkillsPannelInfoFromState(player) {
  const playerId = player.id
  const skillsPannelList = $.state.skillsPannelsList;
  const skillsPannelIndex = skillsPannelList.findIndex(panel => panel.player && panel.player.id === playerId);
  if (skillsPannelList[skillsPannelIndex].player.playerId === playerId) {
    skillsPannelList.splice(i, 1);
  }
}

function deactivateInitializingPannel() {
  let pannelState = $.state.pannelState;
  if (pannelState !== "initializing") {
    $.subNode("Initializing").setEnabled(false);
  }
}

function isInitializingPannel() {
  const pannelState = $.state.pannelState;
  return pannelState === "initializing";
}

function isPlayerAlreadyEquipped(player) {
  const skillsPannelsList = $.state.skillsPannelsList
  const skillsPannel = skillsPannelsList.filter(pannel => pannel.playerId === player.id)
  return skillsPannel.length !== 0;
}

function assignPannelToPlayer(player){
  const skillsPannelsList = $.state.skillsPannelsList
  for(var i = 0; i < skillsPannelsList.length; i++) {
    if(skillsPannelsList[i].player) continue;
    sendEventAllowEquip(skillsPannelsList[i].skillsPannel.id, player);
    break;
  }
}

function sendEventAllowEquip(skillsPannelId, player) {
  if(isPlayerAlreadyEquipped(player)) return;
  
  const skillsPannelList = $.state.skillsPannelsList;
  const skillPannelIndex = skillsPannelList.findIndex(panel => panel.skillsPannel.id === skillsPannelId);
  if(skillsPannelList[skillPannelIndex].player) return;

  skillsPannelList[skillPannelIndex].skillsPannel.send("allowEquip", player);
  skillsPannelList[skillPannelIndex].player = player;

  $.state.skillsPannelsList = skillsPannelList;
}