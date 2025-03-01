declare module '../types/cluster-script.d.ts' {
  interface StateProxy {
    items: ItemHandle[] | null;
    i: number;
    currentTime: number;
    skillsPannelsList: {
      player: PlayerHandle | null;
      skillsPannel: ItemHandle;
    }[];
    pannelState: 'initializing' | null;
  }
}


$.onStart(() => {
  $.log("onStart")
  $.state.i = 0;
  $.state.currentTime = 0;

  $.state.skillsPannelsList = [];
  $.state.pannelState = 'initializing';

  const distance = 30;
  if ($.state.items === undefined)
    $.state.items = $.getItemsNear($.getPosition(), distance);
});

$.onUpdate((deltaTime) => {
  let pannelState = $.state.pannelState;

  deltaTimeFunction(deltaTime, 0.2, sendInitialize);

  if (pannelState === "initialized") {
    $.subNode("Initializing").setEnabled(false);
    $.state.pannelState = "initializeDone";
  }
});

$.onReceive((messageType, arg, sender) => {
  $.log('PannelManager get message');
  switch (messageType) {
    case 'onInitializeSkillsPannel': {
      $.log('onInitializeSkillsPannel');
      const skillsPannelItemHandle = arg;
      setStateSkillsPannelsList(skillsPannelItemHandle);
      break;
    }
    case 'requestPannelManagerId': {
      const skillsPannelItemHandle = sender;
      const pannelManager = $.itemHandle;
      skillsPannelItemHandle.send('pannelInitialize', pannelManager);
      break;
    }
    case 'requestSkillsPannelEquipped': {
      const pannelState = $.state.pannelState;
      if (pannelState === 'initializing') return;

      const skillsPannelId = arg.skillsPannel.id;
      const player = arg.player;
      sendEventAllowEquip(skillsPannelId, player);
      break;
    }
    case 'onSwitchInteracted': {
      $.log('onSwitchInteracted');
      const pannelState = $.state.pannelState;
      if (pannelState === 'initializing') return;

      const player = arg.player;
      // TODO: パネルを持っていなかったら、パネルをもたせる
      const skillsPannelsList = $.state.skillsPannelsList;
      $.log(skillsPannelsList);
      const skillsPannel = skillsPannelsList.find(
        // TODO: 存在しないパラメータ playerId ？
        (pannel) => pannel.playerId === player.id,
      );
      $.log(skillsPannel);

      if (!skillsPannel) {
        $.log('!skillsPannel');
        for (const pannel of skillsPannelsList) {
          // TODO: 存在しないパラメータ playerId ？
          if (pannel.playerId) continue;
          $.log('sendEventAllowEquip(skillsPannelId, player);');
          sendEventAllowEquip(pannel.skillsPannel.id, player);
          break;
        }
      }

      const playre = arg.player;
      const interactedSwitchNumber = arg.interactedSwitchNumber;
      sendEventTagChangeEvent(playre, interactedSwitchNumber);
      break;
    }
    case 'onLeavePlayer':
      removeSkillsPannelInfoFromState(arg);
      break;
  }
});

function deltaTimeFunction(
  deltaTime: number,
  restTime: number,
  argFunction: () => void,
) {
  if ($.state.items != undefined) {
    $.state.currentTime += deltaTime;
    if ($.state.currentTime >= restTime && $.state.i < $.state.items.length) {
      argFunction();
      $.state.i++;
      $.state.currentTime = 0;
    }
    if ($.state.i >= $.state.items.length) {
      $.state.i = 0;
      $.state.currentTime = 0;
      $.state.pannelState = "initialized";
      $.state.items = [];
    }
  }
}

function sendInitialize() {
  $.state.items[$.state.i].send('switchInitialize', '');
  $.state.items[$.state.i].send('pannelInitialize', '');
  $.log(`${$.state.items[$.state.i]}${$.state.i}にメッセージを送りました`);
}

function setStateSkillsPannelsList(skillsPannelItemHandle) {
  const skillsPannelsList = $.state.skillsPannelsList;
  skillsPannelsList.push({
    player: null,
    skillsPannel: skillsPannelItemHandle,
  });
  $.state.skillsPannelsList = skillsPannelsList;
}

function sendEventAllowEquip(skillsPannelId, player) {
  $.log('sendEventAllowEquip');
  const skillsPannelList = $.state.skillsPannelsList;

  let playerAlreadyEquiped = false;
  let alreadyEquipedPannel: ItemHandle | undefined;
  skillsPannelList.forEach((pannel) => {
    if (pannel.player && pannel.player.id === player.id) {
      playerAlreadyEquiped = true;
      alreadyEquipedPannel = pannel.skillsPannel;
    }
  });

  try {
    alreadyEquipedPannel.send('isPannelExistNear');
  } catch {
    for (const pannel of skillsPannelList) {
      // TODO: 存在しないパラメータ playerId ？
      if (pannel.playerId === player.id) {
        skillsPannelList.splice(i, 1);
      }
    }
    playerAlreadyEquiped = false;
  }

  if (!playerAlreadyEquiped) {
    $.log('playerAlreadyEquiped true');
    skillsPannelList.forEach((pannel) => {
      if (pannel.skillsPannel.id === skillsPannelId) {
        const isPlayerExist = Boolean(pannel.player);
        if (!isPlayerExist) {
          pannel.skillsPannel.send('allowEquip', player);
          pannel.player = player;
        }
      }
    });
    $.state.skillsPannelsList = skillsPannelList;
  }
}

function sendEventTagChangeEvent(player, interactedSwitchNumber) {
  const skillsPannelList = $.state.skillsPannelsList;
  skillsPannelList.forEach((pannel) => {
    if (pannel.player && player.id === pannel.player.id) {
      pannel.skillsPannel.send('tagChangeEvent', interactedSwitchNumber);
    }
  });
}

function removeSkillsPannelInfoFromState(arg) {
  const player = arg;
  const playerId = player.id;
  const skillsPannelList = $.state.skillsPannelsList;
  skillsPannelList.forEach((pannel, i) => {
    // TODO: 存在しないパラメータ playerId ？
    if (pannel.playerId === playerId) {
      skillsPannelList.splice(i, 1);
    }
  });
}
