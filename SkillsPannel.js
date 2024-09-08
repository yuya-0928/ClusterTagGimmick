function initialize() {
  $.state.items = null;
  $.state.i = 0;
  $.state.currentTime = 0;

  $.state.pannelManagerId = null;
  $.state.pannelManagerItemHandle = null;
  $.state.playerHandle = null;
  $.state.skillsPannelState = "initializing"

  const distance = 30;
  if ($.state.items == null)
    $.state.items = $.getItemsNear($.getPosition(), distance);
}

$.onStart(() => {
  initialize();
})

$.onInteract((player) => {
  const pannelManagerItemHandle = $.state.pannelManagerItemHandle;
  const skillsPannelItemHaneld = $.itemHandle;
  pannelManagerItemHandle.send("requestSkillsPannelEquipped", { player: player, skillsPannel: skillsPannelItemHaneld });
});

$.onReceive((messageType, arg, sender) => {
  switch (messageType) {
    case "allowEquip": {
      $.log('allowEquip')
      const player = arg;
      $.state.playerHandle = player
      break;
    }
    case "pannelInitialize": {
      const currentState = $.state.skillsPannelState;
      if (currentState !== "initializing") return;

      const pannelManager = sender;
      $.state.pannelManagerItemHandle = pannelManager;
      sendEventOnInitializeSkillsPannel();
      break;
    }
    case "tagChangeEvent": {
      const interactedSwitchNumber = arg;
      const tagName = `tag_${interactedSwitchNumber}`
      const tagObject = $.subNode(tagName);
      const isDisplayed = tagObject.getEnabled();
      tagObject.setEnabled(!isDisplayed);
      break;
    }
  }
});

$.onUpdate((deltaTime) => {
  let playerHandle = $.state.playerHandle;
  setPlayerPositionRotation(playerHandle)

  if (playerHandle) {
    observePlayer(playerHandle);
  }

  let pannelManager = $.state.pannelManagerItemHandle;
  if (!pannelManager) {
    deltaTimeFunction(deltaTime, 0.2, sendRequestPannelManegerId)
  }

  let skillsPannelState = $.state.skillsPannelState
  if (skillsPannelState !== "initializing") {
    $.subNode("Initializing").setEnabled(false);
  }
})

function setPlayerPositionRotation(playerHandle) {
  if (!playerHandle) return;
  $.log('setPlayerPositionRotation');

  const offset = new Vector3(0, 2, -0.5);

  try {
    let playerPosition = playerHandle.getPosition();
    let playerRotation = playerHandle.getRotation();
    if (playerPosition) {
      $.setPosition(playerPosition.add(offset.applyQuaternion(playerRotation)));
      $.setRotation(playerRotation);
    }
  } catch {
    // TODO: 落下してプレイヤーがスポーンした時、PannelManagerから離れているとsendが距離制限でエラーになる
    const currentPlayerHandle = $.state.playerHandle;

    const pannelManager = $.state.pannelManagerItemHandle;
    try {
      pannelManager.send("onLeavePlayer", currentPlayerHandle);
    } catch {
      $.destroy();
    }
    // スポーンした場合のみ適用される。元からワールドに設定されている場合はdestroyされない。
    $.destroy();
  }
}

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

function sendRequestPannelManegerId() {
  $.state.items[$.state.i].send("requestPannelManagerId", "");
}

function observePlayer(currentPlayerHandle) {
  const isPlayerExist = currentPlayerHandle.exists();

  if (!isPlayerExist) {
    const pannelManager = $.state.pannelManagerItemHandle;
    pannelManager.send("onLeavePlayer", currentPlayerHandle);
    // スポーンした場合のみ適用される。元からワールドに設定されている場合はdestroyされない。
    $.destroy();
  }
}

function sendEventOnInitializeSkillsPannel() {
  const pannelManagerItemHandle = $.state.pannelManagerItemHandle;
  const skillsPannelItemHandle = $.ItemHandle

  pannelManagerItemHandle.send("onInitializeSkillsPannel", skillsPannelItemHandle);
  $.state.skillsPannelState = null;
}